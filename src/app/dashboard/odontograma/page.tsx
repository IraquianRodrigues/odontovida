"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { OdontogramService } from "@/services/odontogram.service";
import { OdontogramViewer } from "@/components/odontogram/odontogram-viewer";
import { ToothDetailModal } from "@/components/odontogram/tooth-detail-modal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Activity } from "lucide-react";
import type { ToothRecordWithDetails } from "@/types/odontogram";
import { useUserRole } from "@/hooks/use-user-role";
import { useRouter } from "next/navigation";

interface Patient {
  id: number;
  nome: string;
}

export default function OdontogramaPage() {
  const router = useRouter();
  const { hasOdontogramAccess, isLoading: roleLoading } = useUserRole();
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedTooth, setSelectedTooth] = useState<ToothRecordWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redirect if not dentist
  useEffect(() => {
    if (!roleLoading && !hasOdontogramAccess) {
      router.push("/dashboard");
    }
  }, [hasOdontogramAccess, roleLoading, router]);

  // Fetch patients
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ["patients-for-odontogram"],
    queryFn: async () => {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get user profile to check role
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      // If admin, return all patients
      if (userProfile?.role === 'admin') {
        const { data, error } = await supabase
          .from("clientes")
          .select("id, nome")
          .order("nome");

        if (error) throw error;
        return data as Patient[];
      }

      // For dentists, get professional record
      const { data: professional } = await supabase
        .from("professionals")
        .select("id, code")
        .eq("user_id", user.id)
        .single();

      if (!professional) {
        // If user is not a professional, return empty
        return [];
      }

      // Check if professional code is numeric
      const isNumericCode = /^\d+$/.test(professional.code);
      if (!isNumericCode) {
        // Professional has non-numeric code (e.g., "dr-jorge")
        // Cannot match with appointments.professional_code (INTEGER)
        console.warn(`Professional code "${professional.code}" is not numeric, cannot match appointments`);
        return [];
      }

      // Get unique customer names from appointments for this professional
      // Note: appointments.professional_code is INTEGER, professionals.code is TEXT
      // Note: appointments stores customer_name directly, NOT a foreign key to clientes
      const { data: appointments } = await supabase
        .from("appointments")
        .select("customer_name")
        .eq("professional_code", parseInt(professional.code));

      if (!appointments || appointments.length === 0) {
        return [];
      }

      // Get unique customer names (case-insensitive)
      const customerNames = [...new Set(
        appointments
          .map(apt => apt.customer_name?.trim())
          .filter(name => name) // Remove null/undefined/empty
      )];

      if (customerNames.length === 0) {
        return [];
      }

      // Fetch patient details by matching names (case-insensitive)
      // We need to do this client-side since Supabase doesn't support case-insensitive IN
      const { data: allClientes, error } = await supabase
        .from("clientes")
        .select("id, nome")
        .order("nome");

      if (error) throw error;

      // Filter clientes by matching customer names (case-insensitive)
      const matchedPatients = (allClientes || []).filter(cliente => 
        customerNames.some(customerName => 
          customerName.toLowerCase() === cliente.nome.toLowerCase()
        )
      );

      return matchedPatients as Patient[];
    },
  });

  // Fetch odontogram for selected patient
  const {
    data: odontogram,
    isLoading: odontogramLoading,
    refetch: refetchOdontogram,
  } = useQuery({
    queryKey: ["odontogram", selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return null;
      const result = await OdontogramService.getPatientOdontogram(selectedPatientId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!selectedPatientId,
  });

  const handleToothClick = (tooth: ToothRecordWithDetails) => {
    setSelectedTooth(tooth);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTooth(null);
  };

  const handleUpdate = () => {
    refetchOdontogram();
  };

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasOdontogramAccess) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-3 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="h-6 w-6 text-white" />
            </div>
            Odontograma
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema de registro e visualização dentária
          </p>
        </div>
      </div>

      {/* Patient Selector */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="max-w-md">
          <Label htmlFor="patient-select" className="text-base font-semibold mb-3 block">
            Selecione o Paciente
          </Label>
          <Select
            value={selectedPatientId?.toString() || ""}
            onValueChange={(value) => setSelectedPatientId(parseInt(value))}
          >
            <SelectTrigger id="patient-select" className="w-full">
              <SelectValue placeholder="Escolha um paciente..." />
            </SelectTrigger>
            <SelectContent>
              {patientsLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Carregando pacientes...
                </div>
              ) : patients && patients.length > 0 ? (
                patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id.toString()}>
                    {patient.nome}
                  </SelectItem>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  Nenhum paciente encontrado
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Odontogram Display */}
      {selectedPatientId && (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          {odontogramLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Carregando odontograma...</p>
            </div>
          ) : odontogram ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold">
                  Paciente: {odontogram.patient?.nome}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Clique em um dente para visualizar detalhes e registrar informações
                </p>
              </div>
              
              <OdontogramViewer
                teeth={odontogram.teeth}
                onToothClick={handleToothClick}
              />
            </>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              Erro ao carregar odontograma
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!selectedPatientId && (
        <div className="bg-muted/30 border-2 border-dashed border-border rounded-lg p-12 text-center">
          <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Nenhum paciente selecionado</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Selecione um paciente acima para visualizar e editar o odontograma
          </p>
        </div>
      )}

      {/* Tooth Detail Modal */}
      <ToothDetailModal
        tooth={selectedTooth}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onUpdate={handleUpdate}
      />
    </div>
  );
}

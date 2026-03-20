"use client";

import { logger } from "@/lib/logger";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { OdontogramService } from "@/services/odontogram";
import { Loader2, Activity, AlertCircle, Sparkles, ShieldCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const OdontogramViewer = dynamic(
  () => import("@/components/odontogram/odontogram-viewer").then(mod => mod.OdontogramViewer),
  { ssr: false, loading: () => <div className="flex justify-center py-16"><Loader2 className="h-12 w-12 animate-spin text-muted-foreground" /></div> }
);
const ToothDetailModal = dynamic(
  () => import("@/components/odontogram/tooth-detail-modal").then(mod => mod.ToothDetailModal),
  { ssr: false }
);
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
        logger.warn(`Professional code "${professional.code}" is not numeric, cannot match appointments`);
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

  const clinicalSummary = useMemo(() => {
    if (!odontogram?.teeth?.length) return null;
    const teeth = odontogram.teeth;
    const withConditions = teeth.filter((tooth) => tooth.surface_conditions.length > 0).length;
    const cavity = teeth.filter((tooth) => tooth.status === "cavity").length;
    const extractionNeeded = teeth.filter((tooth) => tooth.status === "extraction_needed").length;
    const healthy = teeth.filter((tooth) => tooth.status === "healthy").length;
    return {
      total: teeth.length,
      withConditions,
      cavity,
      extractionNeeded,
      healthy,
    };
  }, [odontogram]);

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
    <div className="container mx-auto p-6 lg:p-8 space-y-8">
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
              <div className="bg-foreground rounded-2xl p-3.5 flex items-center justify-center shadow-lg">
                <Activity className="h-6 w-6 text-background" />
              </div>
              <span>Odontograma</span>
            </h1>
            <p className="text-muted-foreground">
              Visão clínica para acompanhamento dentário e evolução por dente
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <Sparkles className="h-3 w-3" />
                Visual Premium
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                Acesso Controlado
              </Badge>
              {selectedPatientId && odontogram?.updated_at && (
                <Badge variant="outline">
                  Atualizado em {new Date(odontogram.updated_at).toLocaleDateString("pt-BR")}
                </Badge>
              )}
            </div>
          </div>
          {clinicalSummary && (
            <div className="grid grid-cols-2 gap-3 min-w-[280px]">
              <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">Dentes avaliados</p>
                <p className="text-xl font-bold tabular-nums">{clinicalSummary.total}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">Condições registradas</p>
                <p className="text-xl font-bold tabular-nums">{clinicalSummary.withConditions}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">Cárie ativa</p>
                <p className="text-xl font-bold tabular-nums text-amber-600">{clinicalSummary.cavity}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">Extração necessária</p>
                <p className="text-xl font-bold tabular-nums text-red-600">{clinicalSummary.extractionNeeded}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
        <div className="max-w-lg space-y-3">
          <Label htmlFor="patient-select" className="text-base font-semibold block">
            Selecione o Paciente
          </Label>
          <p className="text-sm text-muted-foreground">
            Escolha um paciente para carregar o mapa dentário e histórico clínico.
          </p>
          <Select
            value={selectedPatientId?.toString() || ""}
            onValueChange={(value) => setSelectedPatientId(parseInt(value))}
          >
            <SelectTrigger id="patient-select" className="w-full h-11 rounded-xl">
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

      {selectedPatientId && (
        <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
          {odontogramLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Carregando odontograma...</p>
            </div>
          ) : odontogram ? (
            <>
              <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Paciente: {odontogram.patient?.nome}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Clique em um dente para visualizar detalhes e registrar informações
                  </p>
                </div>
                {clinicalSummary && (
                  <Badge variant="outline" className="h-fit px-3 py-1.5">
                    {clinicalSummary.healthy} dentes saudáveis
                  </Badge>
                )}
              </div>
              <OdontogramViewer
                teeth={odontogram.teeth}
                onToothClick={handleToothClick}
              />
            </>
          ) : (
            <div className="text-center py-20">
              <AlertCircle className="h-14 w-14 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">Falha ao carregar odontograma</h3>
              <p className="text-muted-foreground">
                Tente novamente em instantes ou selecione outro paciente.
              </p>
            </div>
          )}
        </div>
      )}

      {!selectedPatientId && (
        <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-14 text-center">
          <div className="mx-auto mb-5 h-20 w-20 rounded-2xl bg-background border border-border flex items-center justify-center shadow-sm">
            <AlertTriangle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nenhum paciente selecionado</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Selecione um paciente para visualizar e editar o odontograma com indicadores clínicos.
          </p>
        </div>
      )}

      <ToothDetailModal
        tooth={selectedTooth}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onUpdate={handleUpdate}
      />
    </div>
  );
}

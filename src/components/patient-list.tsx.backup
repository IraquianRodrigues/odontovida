"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MedicalRecordsService, type PatientSummary } from "@/services/medical-records.service";
import { useUserRole } from "@/hooks/use-user-role";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PatientListProps {
  searchQuery: string;
  onPatientClick: (patientId: number) => void;
}

export function PatientList({ searchQuery, onPatientClick }: PatientListProps) {
  const { profile, isAdmin } = useUserRole();

  // Buscar pacientes - todos para admin, apenas do profissional para dentistas
  const { data: patientsData, isLoading } = useQuery({
    queryKey: ["patients", profile?.id, isAdmin],
    queryFn: async () => {
      if (!profile?.id) return { success: false, data: [] };
      
      // Se for admin, buscar todos os pacientes
      if (isAdmin) {
        return MedicalRecordsService.getAllPatients();
      }
      
      // Se for profissional, buscar apenas seus pacientes
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: professionals } = await supabase
        .from("professionals")
        .select("id")
        .eq("email", profile.email)
        .single();
      
      if (!professionals) return { success: false, data: [] };
      
      return MedicalRecordsService.getPatientsByProfessional(professionals.id);
    },
    enabled: !!profile?.id,
  });

  const patients = patientsData?.data || [];

  // Filtrar pacientes baseado na busca usando useMemo
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) {
      return patients;
    }

    const query = searchQuery.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.client_name.toLowerCase().includes(query) ||
        patient.client_phone.includes(query)
    );
  }, [searchQuery, patients]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredPatients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Nenhum paciente encontrado</h3>
        <p className="text-muted-foreground mt-2">
          {searchQuery
            ? "Tente ajustar sua busca"
            : "Você ainda não tem pacientes agendados"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredPatients.map((patient) => (
        <Card
          key={patient.client_id}
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
          onClick={() => onPatientClick(patient.client_id)}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                  {patient.client_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              {/* Patient Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {patient.client_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {patient.client_phone}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{patient.total_appointments} consultas</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span>{patient.total_records} prontuários</span>
                  </div>
                </div>

                {/* Last Appointment */}
                {patient.last_appointment && (
                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs">
                      Último atendimento:{" "}
                      {format(new Date(patient.last_appointment), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

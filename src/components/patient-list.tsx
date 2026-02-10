"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MedicalRecordsService, type PatientSummary } from "@/services/medical-records";
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-[220px] rounded-sm border border-border/50 bg-card animate-pulse 
                       shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.04)]"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-sm bg-muted/50" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 bg-muted/50 rounded" />
                  <div className="h-4 w-1/2 bg-muted/50 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-muted/50 rounded-sm" />
                <div className="h-16 bg-muted/50 rounded-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredPatients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 bg-muted/30 rounded-sm mb-4">
          <User className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Nenhum paciente encontrado</h3>
        <p className="text-muted-foreground mt-2 max-w-sm">
          {searchQuery
            ? "Tente ajustar sua busca"
            : "Você ainda não tem pacientes agendados"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPatients.map((patient) => (
        <Card
          key={patient.client_id}
          className="group cursor-pointer overflow-hidden rounded-sm border-border/50
                     shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.04),0_8px_16px_rgba(0,0,0,0.04)]
                     hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_8px_16px_rgba(0,0,0,0.06),0_16px_32px_rgba(0,0,0,0.08)]
                     hover:border-primary/20
                     transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
                     hover:-translate-y-1 hover:scale-[1.01]"
          onClick={() => onPatientClick(patient.client_id)}
        >
          <CardContent className="p-0">
            {/* Header com Avatar e Nome */}
            <div className="p-6 pb-4 border-b border-border/50 bg-gradient-to-br from-background to-muted/20">
              <div className="flex items-start gap-4">
                {/* Avatar Premium */}
                <Avatar className="h-14 w-14 ring-2 ring-border/50 group-hover:ring-primary/30 transition-all duration-300">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg rounded-sm">
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
                  <h3 className="font-bold text-lg truncate text-foreground group-hover:text-primary transition-colors">
                    {patient.client_name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {patient.client_phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Section Premium */}
            <div className="p-6 pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Consultas Card */}
                <div className="flex items-center gap-2.5 p-3 rounded-sm bg-muted/30 border border-border/50 
                                hover:bg-muted/50 transition-colors group/stat">
                  <div className="p-1.5 rounded-sm bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                      Consultas
                    </p>
                    <p className="text-base font-bold text-foreground tabular-nums">
                      {patient.total_appointments}
                    </p>
                  </div>
                </div>
                
                {/* Prontuários Card */}
                <div className="flex items-center gap-2.5 p-3 rounded-sm bg-muted/30 border border-border/50 
                                hover:bg-muted/50 transition-colors group/stat">
                  <div className="p-1.5 rounded-sm bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                      Prontuários
                    </p>
                    <p className="text-base font-bold text-foreground tabular-nums">
                      {patient.total_records}
                    </p>
                  </div>
                </div>
              </div>

              {/* Last Appointment Badge Premium */}
              {patient.last_appointment && (
                <div className="pt-2">
                  <Badge 
                    variant="outline" 
                    className="w-full justify-center text-xs font-medium py-2 rounded-sm 
                               border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    Último atendimento:{" "}
                    <span className="font-semibold ml-1 tabular-nums">
                      {format(new Date(patient.last_appointment), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

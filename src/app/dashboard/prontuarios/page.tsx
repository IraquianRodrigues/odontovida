"use client";

import { useState } from "react";
import { useUserRole } from "@/hooks/use-user-role";
import { PatientList } from "@/components/patient-list";
import { PatientRecordView } from "@/components/patient-record-view";
import { Input } from "@/components/ui/input";
import { Search, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ProntuariosPage() {
  const { profile, hasMedicalRecordsAccess } = useUserRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "patient">("list");

  // Redirecionar se não tiver acesso
  if (!hasMedicalRecordsAccess) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center p-6">
        <Card className="p-12 max-w-md rounded-sm border-border/50 shadow-[0_2px_4px_rgba(0,0,0,0.06),0_8px_16px_rgba(0,0,0,0.06),0_16px_32px_rgba(0,0,0,0.08)]">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-sm flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Acesso Restrito
              </h1>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Apenas profissionais de saúde e administradores podem acessar os prontuários.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const handlePatientClick = (patientId: number) => {
    setSelectedPatientId(patientId);
    setViewMode("patient");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedPatientId(null);
  };

  // Fullscreen Patient View
  if (viewMode === "patient" && selectedPatientId) {
    return <PatientRecordView patientId={selectedPatientId} onBack={handleBackToList} />;
  }

  // List View
  return (
    <div className="min-h-screen bg-muted/40 transition-colors duration-300">
      <div className="container mx-auto p-6 lg:p-12 space-y-10 lg:space-y-12">
        {/* Premium Header */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-1 w-16 bg-primary rounded-full" />
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Prontuários Médicos
                </h1>
              </div>
              <p className="text-base text-muted-foreground font-medium pl-[76px]">
                Gerencie os prontuários e histórico médico dos seus pacientes
              </p>
            </div>
          </div>

          {/* Premium Search Bar */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <div className="p-2 bg-primary/5 rounded-sm">
                <Search className="h-5 w-5 text-primary" />
              </div>
            </div>
            <Input
              placeholder="Buscar paciente por nome ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-16 h-14 text-base rounded-sm border-border/50 
                         bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.04)]
                         focus:border-primary/50 focus:ring-primary/20 focus:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_4px_8px_rgba(0,0,0,0.06)]
                         transition-all duration-300"
            />
          </div>
        </div>

        {/* Patient List */}
        <PatientList
          searchQuery={searchQuery}
          onPatientClick={handlePatientClick}
        />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useUserRole } from "@/hooks/use-user-role";
import { PatientList } from "@/components/patient-list";
import { Input } from "@/components/ui/input";
import { Search, ShieldAlert, Loader2, Sparkles, Stethoscope, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PatientRecordView = dynamic(
  () => import("@/components/patient-record-view").then(mod => mod.PatientRecordView),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
  }
);

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
        <div className="space-y-7">
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 lg:p-8 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/15 p-3 border border-primary/20">
                    <Stethoscope className="h-6 w-6 text-primary" />
                  </div>
                  Prontuários Médicos
                </h1>
                <p className="text-base text-muted-foreground font-medium max-w-2xl">
                  Gerencie os prontuários e histórico médico dos seus pacientes com uma visão clínica centralizada.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                  <Sparkles className="h-3 w-3" />
                  Visual Premium
                </Badge>
                <Badge variant="outline" className="px-3 py-1.5">
                  Perfil: {profile?.role || "Profissional"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Search className="h-4 w-4 text-primary" />
                </div>
              </div>
              <Input
                placeholder="Buscar paciente por nome ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-16 pr-12 h-14 text-base rounded-xl border-border/60 
                           bg-background focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <PatientList
          searchQuery={searchQuery}
          onPatientClick={handlePatientClick}
        />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useUserRole } from "@/hooks/use-user-role";
import { PatientList } from "@/components/patient-list";
import { MedicalRecordModal } from "@/components/medical-record-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ProntuariosPage() {
  const { profile, hasMedicalRecordsAccess } = useUserRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redirecionar se não tiver acesso
  if (!hasMedicalRecordsAccess) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center p-6">
        <Card className="p-12 max-w-md">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Acesso Restrito
              </h1>
              <p className="text-muted-foreground mt-2">
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatientId(null);
  };

  return (
    <div className="min-h-screen bg-muted/40 transition-colors duration-300">
      <div className="container mx-auto p-6 lg:p-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground transition-colors">
              Prontuários Médicos
            </h1>
            <p className="text-sm text-muted-foreground font-medium transition-colors">
              Gerencie os prontuários dos seus pacientes
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente por nome ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Patient List */}
        <PatientList
          searchQuery={searchQuery}
          onPatientClick={handlePatientClick}
        />

        {/* Medical Record Modal */}
        {isModalOpen && selectedPatientId && (
          <MedicalRecordModal
            patientId={selectedPatientId}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}

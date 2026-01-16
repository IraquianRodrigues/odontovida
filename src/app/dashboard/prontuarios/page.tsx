"use client";

import { useState } from "react";
import { useUserRole } from "@/hooks/use-user-role";
import { PatientList } from "@/components/patient-list";
import { MedicalRecordModal } from "@/components/medical-record-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

export default function ProntuariosPage() {
  const { profile, hasMedicalRecordsAccess } = useUserRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redirecionar se não tiver acesso
  if (!hasMedicalRecordsAccess) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">
            Acesso Restrito
          </h1>
          <p className="text-muted-foreground mt-2">
            Apenas profissionais de saúde e administradores podem acessar os prontuários.
          </p>
        </div>
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Prontuários Médicos</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os prontuários dos seus pacientes
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente por nome ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-auto p-6">
        <PatientList
          searchQuery={searchQuery}
          onPatientClick={handlePatientClick}
        />
      </div>

      {/* Medical Record Modal */}
      {isModalOpen && selectedPatientId && (
        <MedicalRecordModal
          patientId={selectedPatientId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

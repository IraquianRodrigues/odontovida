"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle } from "lucide-react";
import { useProfessionals } from "@/services/professionals/use-professionals";
import { useServices } from "@/services/services/use-services";
import {
  useAvailableServicesForProfessional,
  useAvailableProfessionalsForService,
  useDurationForProfessionalService,
} from "@/services/appointments/use-appointments";

interface AppointmentFormFiltersProps {
  selectedProfessionalId: number | null;
  selectedServiceId: number | null;
  onProfessionalChange: (professionalId: number | null) => void;
  onServiceChange: (serviceId: number | null) => void;
  onDurationChange: (durationMinutes: number | null) => void;
}

/**
 * Componente que gerencia filtros dinâmicos para profissionais e serviços
 * com duração customizada baseada na associação professional_services
 */
export function AppointmentFormFilters({
  selectedProfessionalId,
  selectedServiceId,
  onProfessionalChange,
  onServiceChange,
  onDurationChange,
}: AppointmentFormFiltersProps) {
  // Busca todos os profissionais e serviços
  const { data: allProfessionals = [] } = useProfessionals();
  const { data: allServices = [] } = useServices();

  // Busca serviços disponíveis para o profissional selecionado
  const { data: availableServices = [] } =
    useAvailableServicesForProfessional(selectedProfessionalId);

  // Busca profissionais disponíveis para o serviço selecionado
  const { data: availableProfessionals = [] } =
    useAvailableProfessionalsForService(selectedServiceId);

  // Busca duração customizada
  const { data: customDuration } = useDurationForProfessionalService(
    selectedProfessionalId,
    selectedServiceId
  );

  // Determina quais profissionais e serviços mostrar
  const [professionalsToShow, setProfessionalsToShow] = useState(
    allProfessionals
  );
  const [servicesToShow, setServicesToShow] = useState(allServices);

  // Atualiza listas baseado nas seleções
  useEffect(() => {
    if (selectedServiceId && availableProfessionals.length > 0) {
      // Se um serviço está selecionado, mostra apenas profissionais disponíveis
      setProfessionalsToShow(availableProfessionals);
    } else {
      // Se não, mostra todos
      setProfessionalsToShow(allProfessionals);
    }
  }, [selectedServiceId, availableProfessionals, allProfessionals]);

  useEffect(() => {
    if (selectedProfessionalId && availableServices.length > 0) {
      // Se um profissional está selecionado, mostra apenas serviços disponíveis
      setServicesToShow(availableServices);
    } else {
      // Se não, mostra todos
      setServicesToShow(allServices);
    }
  }, [selectedProfessionalId, availableServices, allServices]);

  // Atualiza duração quando ambos estiverem selecionados
  useEffect(() => {
    if (selectedProfessionalId && selectedServiceId) {
      if (customDuration !== null) {
        onDurationChange(customDuration);
      } else {
        // Fallback para duração padrão do serviço
        const service = allServices.find((s) => s.id === selectedServiceId);
        if (service) {
          onDurationChange(service.duration_minutes);
        }
      }
    } else {
      onDurationChange(null);
    }
  }, [
    selectedProfessionalId,
    selectedServiceId,
    customDuration,
    allServices,
    onDurationChange,
  ]);

  // Valida se a combinação profissional-serviço é válida
  const isValidCombination =
    !selectedProfessionalId ||
    !selectedServiceId ||
    availableServices.some((s) => s.id === selectedServiceId);

  // Duração final a ser exibida
  const finalDuration = customDuration || allServices.find((s) => s.id === selectedServiceId)?.duration_minutes;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Select de Profissional */}
        <div className="space-y-2">
          <Label htmlFor="professional">Profissional</Label>
          <Select
            value={selectedProfessionalId?.toString() || ""}
            onValueChange={(value) =>
              onProfessionalChange(value ? Number(value) : null)
            }
          >
            <SelectTrigger id="professional">
              <SelectValue placeholder="Selecione um profissional" />
            </SelectTrigger>
            <SelectContent>
              {professionalsToShow.map((professional) => (
                <SelectItem
                  key={professional.id}
                  value={professional.id.toString()}
                >
                  {professional.name}
                  {professional.specialty && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({professional.specialty})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedServiceId &&
            professionalsToShow.length < allProfessionals.length && (
              <p className="text-xs text-muted-foreground">
                Mostrando apenas profissionais que realizam este serviço
              </p>
            )}
        </div>

        {/* Select de Serviço */}
        <div className="space-y-2">
          <Label htmlFor="service">Serviço</Label>
          <Select
            value={selectedServiceId?.toString() || ""}
            onValueChange={(value) =>
              onServiceChange(value ? Number(value) : null)
            }
          >
            <SelectTrigger id="service">
              <SelectValue placeholder="Selecione um serviço" />
            </SelectTrigger>
            <SelectContent>
              {servicesToShow.map((service) => (
                <SelectItem key={service.id} value={service.id.toString()}>
                  {service.code}
                  <span className="text-xs text-muted-foreground ml-2">
                    ({service.duration_minutes} min)
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedProfessionalId &&
            servicesToShow.length < allServices.length && (
              <p className="text-xs text-muted-foreground">
                Mostrando apenas serviços que este profissional realiza
              </p>
            )}
        </div>
      </div>

      {/* Informações de duração */}
      {selectedProfessionalId && selectedServiceId && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            {isValidCombination ? (
              <>
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  Duração: {finalDuration} minutos
                </span>
                {customDuration &&
                  customDuration !==
                    allServices.find((s) => s.id === selectedServiceId)
                      ?.duration_minutes && (
                    <Badge variant="secondary" className="text-xs">
                      Duração customizada
                    </Badge>
                  )}
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">
                  Este profissional não realiza este serviço
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


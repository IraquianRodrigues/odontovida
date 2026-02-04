"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, User, Stethoscope, Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateAppointment } from "@/services/appointments/use-appointments";
import { useProfessionals } from "@/services/professionals/use-professionals";
import { useServices } from "@/services/services/use-services";
import { useClientes } from "@/services/clientes/use-clientes";
import { useServicesByProfessional } from "@/services/professional-services/use-professional-services";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
}: NewAppointmentModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

  const createMutation = useCreateAppointment();
  const { data: professionals = [], isLoading: loadingProfessionals } = useProfessionals();
  const { data: services = [], isLoading: loadingServices } = useServices();
  const { data: clientes = [], isLoading: loadingClientes } = useClientes();
  
  // Buscar serviços do profissional selecionado
  const { data: professionalServices = [] } = useServicesByProfessional(selectedProfessional);
  
  // Filtrar apenas serviços ativos do profissional
  const availableServices = selectedProfessional
    ? professionalServices
        .filter(ps => ps.is_active)
        .map(ps => ps.service)
        .filter(Boolean)
    : services;

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCustomerName("");
      setCustomerPhone("");
      setSelectedProfessional(null);
      setSelectedService(null);
      setAppointmentDate("");
      setAppointmentTime("");
    }
  }, [isOpen]);
  
  // Reset service when professional changes
  useEffect(() => {
    setSelectedService(null);
  }, [selectedProfessional]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (!customerName.trim()) {
      toast.error("Por favor, informe o nome do paciente");
      return;
    }

    if (!customerPhone.trim()) {
      toast.error("Por favor, informe o telefone do paciente");
      return;
    }

    if (!selectedProfessional) {
      toast.error("Por favor, selecione um profissional");
      return;
    }

    if (!selectedService) {
      toast.error("Por favor, selecione um serviço");
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      toast.error("Por favor, informe a data e hora do agendamento");
      return;
    }

    // Combinar data e hora
    const startDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    
    // Validar se a data não é no passado
    if (startDateTime < new Date()) {
      toast.error("A data e hora devem ser no futuro");
      return;
    }

    // Validar horário comercial (8h às 18h)
    const hour = startDateTime.getHours();
    if (hour < 8 || hour >= 18) {
      toast.error("Agendamentos devem ser entre 8h e 18h");
      return;
    }

    // Buscar duração do serviço
    const service = services.find((s) => s.id === selectedService);
    if (!service) {
      toast.error("Serviço não encontrado");
      return;
    }

    // Calcular horário de término
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + service.duration_minutes);

    try {
      await createMutation.mutateAsync({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        service_code: selectedService,
        professional_code: selectedProfessional,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      });

      toast.success("Agendamento criado com sucesso!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro detalhado ao criar agendamento:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao criar agendamento: ${errorMessage}`);
    }
  };

  const handleClienteSelect = (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === parseInt(clienteId));
    if (cliente) {
      setCustomerName(cliente.nome);
      setCustomerPhone(cliente.telefone);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
        {/* Header com gradiente */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Novo Agendamento
            </DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Crie um agendamento manual para um paciente
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Cliente Existente (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="existing-cliente" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Cliente Existente (Opcional)
              </Label>
              <Select onValueChange={handleClienteSelect}>
                <SelectTrigger id="existing-cliente" disabled={loadingClientes}>
                  <SelectValue placeholder={loadingClientes ? "Carregando..." : "Selecione um cliente cadastrado"} />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id.toString()}>
                      {cliente.nome} - {cliente.telefone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nome do Paciente */}
            <div className="space-y-2">
              <Label htmlFor="customer-name" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Nome do Paciente *
              </Label>
              <Input
                id="customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Digite o nome completo"
                required
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="customer-phone" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Telefone *
              </Label>
              <Input
                id="customer-phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                required
              />
            </div>

            {/* Profissional */}
            <div className="space-y-2">
              <Label htmlFor="professional" className="text-sm font-medium flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                Profissional *
              </Label>
              <Select
                value={selectedProfessional?.toString()}
                onValueChange={(value) => setSelectedProfessional(parseInt(value))}
              >
                <SelectTrigger id="professional" disabled={loadingProfessionals}>
                  <SelectValue placeholder={loadingProfessionals ? "Carregando..." : "Selecione o profissional"} />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id.toString()}>
                      {prof.name} {prof.specialty && `- ${prof.specialty}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Serviço */}
            <div className="space-y-2">
              <Label htmlFor="service" className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Serviço *
              </Label>
              <Select
                value={selectedService?.toString()}
                onValueChange={(value) => setSelectedService(parseInt(value))}
                disabled={!selectedProfessional}
              >
                <SelectTrigger id="service" disabled={loadingServices || !selectedProfessional}>
                  <SelectValue placeholder={
                    !selectedProfessional 
                      ? "Selecione um profissional primeiro" 
                      : loadingServices 
                      ? "Carregando..." 
                      : availableServices.length === 0
                      ? "Nenhum serviço disponível para este profissional"
                      : "Selecione o serviço"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map((service) => (
                    <SelectItem key={service!.id} value={service!.id.toString()}>
                      {service!.code} ({service!.duration_minutes} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointment-date" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Data *
                </Label>
                <Input
                  id="appointment-date"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointment-time" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Hora *
                </Label>
                <Input
                  id="appointment-time"
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer com ações */}
        <div className="border-t bg-gradient-to-br from-muted/30 to-transparent px-6 py-4">
          <div className="flex gap-3 justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Agendamento"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

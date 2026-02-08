"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { toast } from "sonner";
import { useNotifications } from "@/services/notifications/use-notifications";
import type { UseNotificationsReturn } from "@/services/notifications/use-notifications";
import type { Notification } from "@/services/notifications/notifications.service";
import { createClient } from "@/lib/supabase/client";
import { AppointmentDetailsModal } from "@/components/appointment-details-modal";
import { useAppointment } from "@/services/appointments/use-appointments";

interface NotificationContextValue extends UseNotificationsReturn {
  openAppointmentModal: (appointmentId: number) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within NotificationProvider"
    );
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const supabase = createClient();

  // Buscar appointment quando selecionado
  const { data: selectedAppointment, refetch: refetchAppointment } = useAppointment(
    selectedAppointmentId
  );

  // Efeito para verificar se o agendamento selecionado está concluído
  React.useEffect(() => {
    if (selectedAppointment && selectedAppointment.status === 'completed') {
      toast.info("Este agendamento já foi concluído", {
        description: "Não é possível visualizar detalhes de agendamentos concluídos."
      });
      setSelectedAppointmentId(null);
    }
  }, [selectedAppointment]);

  // Buscar userId do usuário autenticado
  React.useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };

    getUser();

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Hook de notificações
  const notificationsHook = useNotifications(userId);

  // Função para abrir modal de agendamento
  const openAppointmentModal = useCallback((appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
  }, []);

  // Função para fechar modal
  const closeAppointmentModal = useCallback(() => {
    setSelectedAppointmentId(null);
  }, []);

  const contextValue: NotificationContextValue = {
    ...notificationsHook,
    openAppointmentModal,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Modal de detalhes do agendamento - Só renderiza se não estiver concluído (para evitar flash) */}
      {selectedAppointment && selectedAppointment.status !== 'completed' && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={closeAppointmentModal}
          onUpdate={() => {
            refetchAppointment();
            notificationsHook.refresh();
          }}
        />
      )}
    </NotificationContext.Provider>
  );
}


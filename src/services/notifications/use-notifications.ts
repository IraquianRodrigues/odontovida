"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  notificationsService,
  type Notification,
} from "./notifications.service";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotifications(userId: string | null): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const supabase = createClient();

  const LIMIT = 5;

  // Função para carregar notificações
  const loadNotifications = useCallback(
    async (currentOffset: number, append = false) => {
      if (!userId) {
        console.log("🔔 [Notifications] loadNotifications chamado sem userId");
        setIsLoading(false);
        return;
      }

      console.log("🔔 [Notifications] Carregando notificações para userId:", userId, "offset:", currentOffset);

      try {
        const data = await notificationsService.getNotifications({
          userId,
          limit: LIMIT,
          offset: currentOffset,
        });

        console.log("🔔 [Notifications] Notificações carregadas:", data.length);

        if (append) {
          setNotifications((prev) => [...prev, ...data]);
        } else {
          setNotifications(data);
        }

        setHasMore(data.length === LIMIT);
      } catch (error) {
        console.error("Erro ao carregar notificações:", error);
      }
    },
    [userId]
  );

  // Função para carregar contador de não lidas
  const loadUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const count = await notificationsService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error("Erro ao carregar contador:", error);
    }
  }, [userId]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      if (!userId) {
        console.log("🔔 [Notifications] userId ainda não disponível, aguardando...");
        return;
      }
      
      console.log("🔔 [Notifications] Carregando dados iniciais para userId:", userId);
      setIsLoading(true);
      await Promise.all([loadNotifications(0), loadUnreadCount()]);
      setIsLoading(false);
      console.log("🔔 [Notifications] Dados carregados. Total:", notifications.length, "Não lidas:", unreadCount);
    };

    loadInitialData();
  }, [userId, loadNotifications, loadUnreadCount]); // Adicionar userId como dependência

  // Configurar Supabase Realtime
  useEffect(() => {
    if (!userId) return;

    console.log("🔔 [Notifications] Configurando Realtime para userId:", userId);

    let channel: RealtimeChannel;

    const setupRealtime = async () => {
      channel = supabase
        .channel("notifications-channel")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log("🔔 [Notifications] Nova notificação recebida via Realtime:", payload);
            const newNotification = payload.new as Notification;
            
            console.log("🔔 [Notifications] Adicionando notificação ao estado:", {
              id: newNotification.id,
              title: newNotification.title,
              user_id: newNotification.user_id,
              current_userId: userId
            });
            
            // Adicionar nova notificação no início da lista
            setNotifications((prev) => {
              console.log("🔔 [Notifications] Estado anterior:", prev.length, "notificações");
              const newState = [newNotification, ...prev];
              console.log("🔔 [Notifications] Novo estado:", newState.length, "notificações");
              return newState;
            });
            
            // Incrementar contador de não lidas
            setUnreadCount((prev) => {
              console.log("🔔 [Notifications] Contador anterior:", prev, "→ Novo:", prev + 1);
              return prev + 1;
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log("🔔 [Notifications] Notificação atualizada via Realtime:", payload);
            const updatedNotification = payload.new as Notification;
            
            // Atualizar notificação na lista
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === updatedNotification.id ? updatedNotification : n
              )
            );
            
            // Atualizar contador se foi marcada como lida
            if (updatedNotification.read_at) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe((status) => {
          console.log("🔔 [Notifications] Status da subscrição Realtime:", status);
        });
    };

    setupRealtime();

    // Cleanup
    return () => {
      if (channel) {
        console.log("🔔 [Notifications] Removendo canal Realtime");
        supabase.removeChannel(channel);
      }
    };
  }, [userId, supabase]);

  // Carregar mais notificações
  const loadMore = useCallback(async () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    await loadNotifications(newOffset, true);
  }, [offset, loadNotifications]);

  // Marcar como lida
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await notificationsService.markAsRead(notificationId);
        
        // Atualizar localmente
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, read_at: new Date().toISOString() }
              : n
          )
        );
        
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Erro ao marcar como lida:", error);
      }
    },
    []
  );

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await notificationsService.markAllAsRead(userId);
      
      // Atualizar localmente
      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || now }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  }, [userId]);

  // Refresh manual
  const refresh = useCallback(async () => {
    setOffset(0);
    await Promise.all([loadNotifications(0), loadUnreadCount()]);
  }, [loadNotifications, loadUnreadCount]);

  // Deletar notificação
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await notificationsService.deleteNotification(notificationId);
        
        // Remover localmente
        setNotifications((prev) => {
          const notification = prev.find((n) => n.id === notificationId);
          const wasUnread = notification && !notification.read_at;
          
          if (wasUnread) {
            setUnreadCount((count) => Math.max(0, count - 1));
          }
          
          return prev.filter((n) => n.id !== notificationId);
        });
      } catch (error) {
        console.error("Erro ao deletar notificação:", error);
      }
    },
    []
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };
}

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { logger } from "@/lib/logger";
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
  const supabase = useMemo(() => createClient(), []);

  const LIMIT = 5;

  const loadNotifications = useCallback(
    async (currentOffset: number, append = false) => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await notificationsService.getNotifications({
          userId,
          limit: LIMIT,
          offset: currentOffset,
        });

        if (append) {
          setNotifications((prev) => [...prev, ...data]);
        } else {
          setNotifications(data);
        }

        setHasMore(data.length === LIMIT);
      } catch (error) {
        logger.error("Erro ao carregar notificações:", error);
      }
    },
    [userId]
  );

  const loadUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const count = await notificationsService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      logger.error("Erro ao carregar contador:", error);
    }
  }, [userId]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      if (!userId) return;

      setIsLoading(true);
      await Promise.all([loadNotifications(0), loadUnreadCount()]);
      setIsLoading(false);
    };

    loadInitialData();
  }, [userId, loadNotifications, loadUnreadCount]);

  // Configurar Supabase Realtime
  useEffect(() => {
    if (!userId) return;

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
            const newNotification = payload.new as Notification;

            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
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
            const updatedNotification = payload.new as Notification;

            setNotifications((prev) =>
              prev.map((n) =>
                n.id === updatedNotification.id ? updatedNotification : n
              )
            );

            if (updatedNotification.read_at) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, supabase]);

  const loadMore = useCallback(async () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    await loadNotifications(newOffset, true);
  }, [offset, loadNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await notificationsService.markAsRead(notificationId);

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, read_at: new Date().toISOString() }
              : n
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        logger.error("Erro ao marcar como lida:", error);
      }
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await notificationsService.markAllAsRead(userId);

      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || now }))
      );

      setUnreadCount(0);
    } catch (error) {
      logger.error("Erro ao marcar todas como lidas:", error);
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    setOffset(0);
    await Promise.all([loadNotifications(0), loadUnreadCount()]);
  }, [loadNotifications, loadUnreadCount]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await notificationsService.deleteNotification(notificationId);

        setNotifications((prev) => {
          const notification = prev.find((n) => n.id === notificationId);
          const wasUnread = notification && !notification.read_at;

          if (wasUnread) {
            setUnreadCount((count) => Math.max(0, count - 1));
          }

          return prev.filter((n) => n.id !== notificationId);
        });
      } catch (error) {
        logger.error("Erro ao deletar notificação:", error);
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

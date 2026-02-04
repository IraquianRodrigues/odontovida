"use client";

import { useNotificationContext } from "@/providers/notification-provider";
import type { Notification } from "@/services/notifications/notifications.service";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Circle, CircleCheck, Check, Trash2 } from "lucide-react";

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead, deleteNotification, openAppointmentModal } = useNotificationContext();
  const isUnread = !notification.read_at;

  const handleClick = () => {
    // Se for novo agendamento e tiver appointment_id, abrir modal
    if (notification.appointment_id) {
      openAppointmentModal(notification.appointment_id);
      
      // Marcar como lida automaticamente ao clicar
      if (isUnread) {
        markAsRead(notification.id);
      }
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div
      className={cn(
        "px-4 py-3 transition-colors cursor-pointer",
        isUnread
          ? "bg-lime-50/50 dark:bg-lime-950/10 hover:bg-lime-100/50 dark:hover:bg-lime-950/20"
          : "hover:bg-accent/50"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Indicador de lida/não lida */}
        <div className="mt-0.5">
          {isUnread ? (
            <Circle className="h-2.5 w-2.5 fill-lime-500 text-lime-500" />
          ) : (
            <CircleCheck className="h-4 w-4 text-muted-foreground/40" />
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                "text-sm leading-tight",
                isUnread ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
              )}
            >
              {notification.title}
            </h4>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
            {notification.message}
          </p>

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[10px] text-muted-foreground/70">
              {timeAgo}
            </span>

            <div className="flex items-center gap-1">
              {isUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAsRead}
                  className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground gap-1"
                >
                  <Check className="h-3 w-3" />
                  Marcar como lida
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

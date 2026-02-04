"use client";

import { useNotificationContext } from "@/providers/notification-provider";
import { NotificationItem } from "./notification-item";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCheck, Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    loadMore,
    markAllAsRead,
  } = useNotificationContext();

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Notificações</h3>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              ({unreadCount} {unreadCount === 1 ? "nova" : "novas"})
            </span>
          )}
        </div>
        
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Lista de notificações */}
      <ScrollArea className="max-h-[400px]">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              Nenhuma notificação
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Você está em dia!
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer - Carregar mais */}
      {hasMore && notifications.length > 0 && (
        <div className="border-t px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMore}
            disabled={isLoading}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              "Carregar mais"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

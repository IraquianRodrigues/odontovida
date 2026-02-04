import { createClient } from "@/lib/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  appointment_id: number | null;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GetNotificationsParams {
  userId: string;
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

export class NotificationsService {
  private supabase = createClient();

  /**
   * Busca notificações do usuário com paginação
   */
  async getNotifications(
    params: GetNotificationsParams
  ): Promise<Notification[]> {
    const { userId, limit = 5, offset = 0, unreadOnly = false } = params;

    let query = this.supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.is("read_at", null);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar notificações:", error);
      throw new Error("Falha ao buscar notificações");
    }

    return (data as Notification[]) || [];
  }

  /**
   * Conta notificações não lidas do usuário
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null);

    if (error) {
      console.error("Erro ao contar notificações não lidas:", error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await this.supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId);

    if (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      throw new Error("Falha ao marcar notificação como lida");
    }
  }

  /**
   * Marca todas as notificações do usuário como lidas
   */
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);

    if (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
      throw new Error("Falha ao marcar todas as notificações como lidas");
    }
  }

  /**
   * Deleta uma notificação
   */
  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await this.supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      console.error("Erro ao deletar notificação:", error);
      throw new Error("Falha ao deletar notificação");
    }
  }

  /**
   * Deleta todas as notificações lidas do usuário
   */
  async deleteAllRead(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId)
      .not("read_at", "is", null);

    if (error) {
      console.error("Erro ao deletar notificações lidas:", error);
      throw new Error("Falha ao deletar notificações lidas");
    }
  }
}

// Singleton instance
export const notificationsService = new NotificationsService();

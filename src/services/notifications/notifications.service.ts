export interface Notification { id: string; user_id: string; appointment_id: string | null; title: string; message: string; read_at: string | null; created_at: string; updated_at: string }
export interface GetNotificationsParams { userId: string; limit?: number; offset?: number; unreadOnly?: boolean }

/** O projeto conectado não possui uma tabela de notificações da aplicação. */
export class NotificationsService {
  async getNotifications(_params: GetNotificationsParams): Promise<Notification[]> { return []; }
  async getUnreadCount(_userId: string): Promise<number> { return 0; }
  async markAsRead(_notificationId: string): Promise<void> {}
  async markAllAsRead(_userId: string): Promise<void> {}
  async deleteNotification(_notificationId: string): Promise<void> {}
  async deleteAllRead(_userId: string): Promise<void> {}
}
export const notificationsService = new NotificationsService();

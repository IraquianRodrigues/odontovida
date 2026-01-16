// Types for Mercado Pago Integration

export interface MercadoPagoPreferenceItem {
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

export interface MercadoPagoPreference {
  items: MercadoPagoPreferenceItem[];
  payer?: {
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
    name?: string;
  };
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: 'approved' | 'all';
  external_reference?: string;
  notification_url?: string;
  statement_descriptor?: string;
  metadata?: Record<string, any>;
}

export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  date_created: string;
  items: MercadoPagoPreferenceItem[];
  external_reference?: string;
}

export interface MercadoPagoPayment {
  id: number;
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  date_created: string;
  date_approved?: string;
  external_reference?: string;
  payment_method_id: string;
  payment_type_id: string;
  metadata?: Record<string, any>;
}

export interface MercadoPagoWebhookNotification {
  id: number;
  live_mode: boolean;
  type: 'payment' | 'plan' | 'subscription' | 'invoice' | 'point_integration_wh';
  date_created: string;
  application_id: number;
  user_id: number;
  version: number;
  api_version: string;
  action: 'payment.created' | 'payment.updated' | string;
  data: {
    id: string;
  };
}

export interface CreatePreferenceRequest {
  transaction_id: string;
}

export interface CreatePreferenceResponse {
  success: boolean;
  preference_id?: string;
  init_point?: string;
  error?: string;
}

export interface CheckPaymentRequest {
  transaction_id: string;
}

export interface CheckPaymentResponse {
  success: boolean;
  payment_status?: string;
  payment_id?: number;
  error?: string;
}

import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import type {
  MercadoPagoPreference,
  MercadoPagoPreferenceResponse,
  MercadoPagoPayment,
} from '@/types/mercadopago';

// Inicializar cliente do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  options: {
    timeout: 5000,
  },
});

// Inicializar APIs
const preferenceApi = new Preference(client);
const paymentApi = new Payment(client);

export class MercadoPagoService {
  /**
   * Cria uma preferência de pagamento no Mercado Pago
   */
  static async createPaymentPreference(
    transactionId: string,
    amount: number,
    description: string,
    clientName?: string,
    clientEmail?: string,
    clientPhone?: string
  ): Promise<{ success: boolean; data?: MercadoPagoPreferenceResponse; error?: string }> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
      const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
      
      const preferenceData: MercadoPagoPreference = {
        items: [
          {
            title: description,
            description: `Pagamento - ${clientName || 'Cliente'}`,
            quantity: 1,
            unit_price: amount,
            currency_id: 'BRL',
          },
        ],
        payer: {
          name: clientName,
          email: clientEmail || 'teste@odontovida.com.br',
          ...(clientPhone ? {
            phone: {
              number: clientPhone.replace(/\D/g, ''),
            }
          } : {}),
        },
        back_urls: {
          success: `${baseUrl}/dashboard/financeiro?payment=success`,
          failure: `${baseUrl}/dashboard/financeiro?payment=failure`,
          pending: `${baseUrl}/dashboard/financeiro?payment=pending`,
        },
        // Apenas usar auto_return em produção (não localhost)
        ...(isLocalhost ? {} : { auto_return: 'approved' as const }),
        external_reference: transactionId,
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
        statement_descriptor: process.env.NEXT_PUBLIC_CLINIC_NAME || 'OdontoVida',
        metadata: {
          transaction_id: transactionId,
        },
      };

      const preference = await preferenceApi.create({
        body: preferenceData as any,
      });

      return {
        success: true,
        data: preference as unknown as MercadoPagoPreferenceResponse,
      };
    } catch (error: any) {
      console.error('Erro ao criar preferência de pagamento:', error);
      return {
        success: false,
        error: error.message || 'Erro ao criar preferência de pagamento',
      };
    }
  }

  /**
   * Consulta o status de um pagamento no Mercado Pago
   */
  static async getPaymentStatus(
    paymentId: number
  ): Promise<{ success: boolean; data?: MercadoPagoPayment; error?: string }> {
    try {
      const payment = await paymentApi.get({ id: paymentId });

      return {
        success: true,
        data: payment as unknown as MercadoPagoPayment,
      };
    } catch (error: any) {
      console.error('Erro ao consultar status do pagamento:', error);
      return {
        success: false,
        error: error.message || 'Erro ao consultar status do pagamento',
      };
    }
  }

  /**
   * Processa notificação de webhook do Mercado Pago
   */
  static async processWebhookNotification(
    paymentId: number
  ): Promise<{
    success: boolean;
    payment?: MercadoPagoPayment;
    error?: string;
  }> {
    try {
      const result = await this.getPaymentStatus(paymentId);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Pagamento não encontrado',
        };
      }

      return {
        success: true,
        payment: result.data,
      };
    } catch (error: any) {
      console.error('Erro ao processar webhook:', error);
      return {
        success: false,
        error: error.message || 'Erro ao processar webhook',
      };
    }
  }

  /**
   * Mapeia status do Mercado Pago para status da transação
   */
  static mapPaymentStatusToTransactionStatus(
    mpStatus: string
  ): 'pendente' | 'pago' | 'cancelado' {
    switch (mpStatus) {
      case 'approved':
        return 'pago';
      case 'rejected':
      case 'cancelled':
      case 'refunded':
      case 'charged_back':
        return 'cancelado';
      default:
        return 'pendente';
    }
  }

  /**
   * Mapeia método de pagamento do Mercado Pago
   */
  static mapPaymentMethod(
    paymentTypeId: string,
    paymentMethodId: string
  ): 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto' | 'transferencia' {
    if (paymentMethodId === 'pix') return 'pix';
    if (paymentMethodId === 'bolbradesco' || paymentTypeId === 'ticket') return 'boleto';
    if (paymentTypeId === 'credit_card') return 'cartao_credito';
    if (paymentTypeId === 'debit_card') return 'cartao_debito';
    if (paymentTypeId === 'bank_transfer') return 'transferencia';
    return 'dinheiro';
  }
}

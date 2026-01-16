import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MercadoPagoService } from '@/services/mercadopago.service';
import type { MercadoPagoWebhookNotification } from '@/types/mercadopago';

export async function POST(request: NextRequest) {
  try {
    const body: MercadoPagoWebhookNotification = await request.json();

    console.log('Webhook recebido:', JSON.stringify(body, null, 2));

    // Verificar se é uma notificação de pagamento
    if (body.type !== 'payment') {
      return NextResponse.json({ success: true, message: 'Tipo de notificação ignorado' });
    }

    // Obter o ID do pagamento
    const paymentId = parseInt(body.data.id);
    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'ID do pagamento inválido' },
        { status: 400 }
      );
    }

    // Processar a notificação
    const result = await MercadoPagoService.processWebhookNotification(paymentId);

    if (!result.success || !result.payment) {
      console.error('Erro ao processar webhook:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    const payment = result.payment;

    // Buscar a transação usando external_reference
    const transactionId = payment.external_reference;
    if (!transactionId) {
      console.log('Pagamento sem external_reference, ignorando');
      return NextResponse.json({ success: true, message: 'Sem external_reference' });
    }

    const supabase = await createClient();
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (fetchError || !transaction) {
      console.error('Transação não encontrada:', transactionId);
      return NextResponse.json(
        { success: false, error: 'Transação não encontrada' },
        { status: 404 }
      );
    }

    // Mapear status e método de pagamento
    const newStatus = MercadoPagoService.mapPaymentStatusToTransactionStatus(payment.status);
    const paymentMethod = MercadoPagoService.mapPaymentMethod(
      payment.payment_type_id,
      payment.payment_method_id
    );

    // Atualizar a transação
    const updateData: any = {
      mercadopago_payment_id: payment.id.toString(),
      mercadopago_payment_status: payment.status,
      status: newStatus,
    };

    // Se foi aprovado, adicionar data de pagamento e método
    if (payment.status === 'approved') {
      updateData.paid_date = payment.date_approved || new Date().toISOString().split('T')[0];
      updateData.payment_method = paymentMethod;
    }

    const { error: updateError } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId);

    if (updateError) {
      console.error('Erro ao atualizar transação:', updateError);
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar transação' },
        { status: 500 }
      );
    }

    console.log(`Transação ${transactionId} atualizada com sucesso. Status: ${newStatus}`);

    return NextResponse.json({
      success: true,
      message: 'Webhook processado com sucesso',
      transaction_id: transactionId,
      payment_status: payment.status,
    });
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Mercado Pago envia GET para validar a URL
export async function GET() {
  return NextResponse.json({ success: true, message: 'Webhook endpoint ativo' });
}

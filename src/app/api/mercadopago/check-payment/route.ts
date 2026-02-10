import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MercadoPagoService } from '@/services/mercadopago';
import type { CheckPaymentRequest } from '@/types/mercadopago';

export async function POST(request: NextRequest) {
  try {
    const body: CheckPaymentRequest = await request.json();
    const { transaction_id } = body;

    if (!transaction_id) {
      return NextResponse.json(
        { success: false, error: 'transaction_id é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar a transação no banco
    const supabase = await createClient();
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transaction_id)
      .single();

    if (fetchError || !transaction) {
      return NextResponse.json(
        { success: false, error: 'Transação não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se tem payment_id
    if (!transaction.mercadopago_payment_id) {
      return NextResponse.json(
        { success: false, error: 'Transação não possui pagamento associado' },
        { status: 400 }
      );
    }

    // Consultar status no Mercado Pago
    const paymentId = parseInt(transaction.mercadopago_payment_id);
    const result = await MercadoPagoService.getPaymentStatus(paymentId);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error || 'Erro ao consultar pagamento' },
        { status: 500 }
      );
    }

    const payment = result.data;

    // Mapear status e método de pagamento
    const newStatus = MercadoPagoService.mapPaymentStatusToTransactionStatus(payment.status);
    const paymentMethod = MercadoPagoService.mapPaymentMethod(
      payment.payment_type_id,
      payment.payment_method_id
    );

    // Atualizar a transação se o status mudou
    if (transaction.status !== newStatus || transaction.mercadopago_payment_status !== payment.status) {
      const updateData: any = {
        mercadopago_payment_status: payment.status,
        status: newStatus,
      };

      // Se foi aprovado, adicionar data de pagamento e método
      if (payment.status === 'approved' && !transaction.paid_date) {
        updateData.paid_date = payment.date_approved || new Date().toISOString().split('T')[0];
        updateData.payment_method = paymentMethod;
      }

      const { error: updateError } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transaction_id);

      if (updateError) {
        console.error('Erro ao atualizar transação:', updateError);
        return NextResponse.json(
          { success: false, error: 'Erro ao atualizar transação' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      payment_status: payment.status,
      payment_id: payment.id,
      transaction_status: newStatus,
      updated: transaction.status !== newStatus,
    });
  } catch (error: any) {
    console.error('Erro ao verificar pagamento:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

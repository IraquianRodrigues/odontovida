import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MercadoPagoService } from '@/services/mercadopago.service';
import type { CreatePreferenceRequest } from '@/types/mercadopago';

export async function POST(request: NextRequest) {
  try {
    const body: CreatePreferenceRequest = await request.json();
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
      .select(`
        *,
        client:clientes(id, nome, telefone, email)
      `)
      .eq('id', transaction_id)
      .single();

    if (fetchError || !transaction) {
      return NextResponse.json(
        { success: false, error: 'Transação não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a transação já tem uma preferência criada
    if (transaction.mercadopago_preference_id) {
      return NextResponse.json({
        success: true,
        preference_id: transaction.mercadopago_preference_id,
        init_point: transaction.mercadopago_payment_link,
        message: 'Preferência já existe',
      });
    }

    // Verificar se a transação está pendente
    if (transaction.status !== 'pendente') {
      return NextResponse.json(
        { success: false, error: 'Apenas transações pendentes podem gerar link de pagamento' },
        { status: 400 }
      );
    }

    // Criar preferência no Mercado Pago
    const clientName = transaction.client?.nome || 'Cliente';
    const clientEmail = transaction.client?.email;
    const clientPhone = transaction.client?.telefone;
    const description = `${transaction.category} - ${transaction.description || 'Pagamento'}`;
    
    const preferenceResult = await MercadoPagoService.createPaymentPreference(
      transaction_id,
      transaction.amount,
      description,
      clientName,
      clientEmail,
      clientPhone
    );

    if (!preferenceResult.success || !preferenceResult.data) {
      return NextResponse.json(
        { success: false, error: preferenceResult.error || 'Erro ao criar preferência' },
        { status: 500 }
      );
    }

    // Atualizar a transação com os dados da preferência
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        mercadopago_preference_id: preferenceResult.data.id,
        mercadopago_payment_link: preferenceResult.data.init_point,
      })
      .eq('id', transaction_id);

    if (updateError) {
      console.error('Erro ao atualizar transação:', updateError);
      return NextResponse.json(
        { success: false, error: 'Erro ao salvar dados do pagamento' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preference_id: preferenceResult.data.id,
      init_point: preferenceResult.data.init_point,
    });
  } catch (error: any) {
    console.error('Erro ao criar preferência:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

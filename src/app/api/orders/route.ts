import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Extrai os campos do webhook (iFood/99/Keeta)
    const { tenant_id, external_id, source, restaurant, customer, items, payload, time_window } = body;

    // Insere no banco com status inicial 'received'
    const { data, error } = await supabase
      .from('orders')
      .insert({
        tenant_id,
        external_id,
        source,
        restaurant,
        customer,
        items,
        payload,
        time_window,
        status: 'received'
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao inserir pedido:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Opcional: Aqui poderíamos disparar o Agente de Despacho (IA) de forma assíncrona
    // fetch('http://localhost:3000/api/dispatch', { method: 'POST', body: JSON.stringify({ order_id: data.id }) })

    return NextResponse.json({ order: data }, { status: 201 });
  } catch (error: any) {
    console.error('Erro fatal no webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

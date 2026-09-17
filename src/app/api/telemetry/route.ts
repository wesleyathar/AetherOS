import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mission_id, drone_id, gps, battery, flight } = body;

    // 1. Grava no histórico (tabela telemetry)
    const { error } = await supabase.from('telemetry').insert({
      mission_id,
      drone_id,
      gps,
      battery,
      flight
    });

    if (error) {
      console.error('Erro ao gravar telemetria:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 2. Transmite em tempo real para os painéis dos operadores (Supabase Realtime)
    // Usamos a API de Channel nativa do cliente Supabase
    const channel = supabase.channel('telemetry');
    await channel.send({
      type: 'broadcast',
      event: 'update',
      payload: { mission_id, drone_id, gps, battery, flight }
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error('Erro fatal na telemetria:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

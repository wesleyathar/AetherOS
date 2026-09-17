import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

// Inicialização lazy: o cliente só é criado na primeira chamada de API (em runtime),
// não durante o build do Next.js, evitando o erro "Invalid supabaseUrl".
export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    if (!url || !key) {
      throw new Error('Variáveis SUPABASE_URL e SUPABASE_KEY não configuradas.');
    }
    _client = createClient(url, key);
  }
  return _client;
}

// Proxy para manter compatibilidade com o código existente que usa `supabase.from(...)`
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabase()[prop as keyof SupabaseClient];
  }
});

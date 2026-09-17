import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || ''; // Deve ser a Service Role Key para as funções de backend, ou Anon Key se tiver RLS configurado

export const supabase = createClient(supabaseUrl, supabaseKey);

import { createClient } from '@supabase/supabase-js';

// Reemplaza esto con tus credenciales reales de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Cliente de Supabase para Nomi.
 * Centralizamos la conexión aquí para usarla en hooks de autenticación y datos.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

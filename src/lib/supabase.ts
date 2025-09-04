import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Inicializando Supabase...');
console.log('- URL:', supabaseUrl ? '✅ Configurada' : '❌ Não encontrada');
console.log('- Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Não encontrada');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO: Variáveis de ambiente do Supabase não configuradas!');
  console.error('📋 Instruções:');
  console.error('1. Crie um arquivo .env na raiz do projeto');
  console.error('2. Adicione as linhas:');
  console.error('   VITE_SUPABASE_URL=sua_url_do_supabase');
  console.error('   VITE_SUPABASE_ANON_KEY=sua_chave_anonima');
  console.error('3. Reinicie o servidor com npm run dev');
  throw new Error('❌ Variáveis de ambiente do Supabase não configuradas. Verifique o arquivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simplified database types since we're only using auth.users
export type Database = {
  public: {
    Tables: {};
  };
};
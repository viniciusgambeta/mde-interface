// Utilitário para testar a conexão com o Supabase
import { supabase } from '../lib/supabase';

export const testSupabaseConnection = async () => {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    // Teste 1: Verificar se as variáveis de ambiente estão configuradas
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('📊 Variáveis de ambiente:');
    console.log('- VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Não configurada');
    console.log('- VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Variáveis de ambiente não configuradas');
    }

    // Teste 2: Verificar conexão básica
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Erro ao obter sessão:', error.message);
      return false;
    }
    console.log('✅ Conexão com auth estabelecida');

    // Teste 3: Verificar se a tabela assinaturas existe
    try {
      const { error: tableError } = await supabase
        .from('assinaturas')
        .select('count', { count: 'exact', head: true });
      
      if (tableError) {
        console.error('❌ Erro ao acessar tabela assinaturas:', tableError.message);
        return false;
      }
      console.log('✅ Tabela assinaturas acessível');
    } catch (e) {
      console.error('❌ Tabela assinaturas não encontrada ou sem permissão');
      return false;
    }

    console.log('🎉 Todas as verificações passaram! Supabase configurado corretamente.');
    return true;
    
  } catch (error) {
    console.error('❌ Erro no teste de conexão:', error);
    return false;
  }
};

export const debugAuthState = () => {
  console.log('🔐 Debug do estado de autenticação:');
  
  // Verificar se o cliente Supabase foi inicializado
  console.log('- Cliente Supabase:', supabase ? '✅ Inicializado' : '❌ Não inicializado');
  
  // Verificar sessão atual
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
      console.error('- Erro ao obter sessão:', error.message);
    } else {
      console.log('- Sessão atual:', session ? '✅ Ativa' : '❌ Não encontrada');
      if (session) {
        console.log('  - User ID:', session.user.id);
        console.log('  - Email:', session.user.email);
      }
    }
  });
};
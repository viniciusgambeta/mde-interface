# 🔧 Configuração do Supabase - Solução para Problemas de Autenticação

## ❌ Problema Identificado
As variáveis de ambiente do Supabase não estão configuradas, causando o erro:
```
Missing Supabase environment variables
```

## ✅ Solução

### 1. Obter as Credenciais do Supabase

Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard):

1. Vá para **Settings** → **API**
2. Copie a **Project URL** 
3. Copie a **anon public key**

### 2. Configurar as Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### 3. Reiniciar o Servidor

Após configurar as variáveis:

```bash
npm run dev
```

## 🔍 Verificação

O sistema de autenticação está configurado para:
- ✅ Login/Registro com email e senha
- ✅ Integração com tabela `assinaturas` 
- ✅ Onboarding de usuários
- ✅ Controle de usuários premium
- ✅ Atualização de perfil

## 📋 Estrutura do Banco

O sistema espera uma tabela `assinaturas` com os campos:
- `user_id` (UUID, referência para auth.users)
- `"Nome do cliente"` (text)
- `"Email do cliente"` (text)
- `is_premium` (boolean)
- `onboarding_completed` (boolean)
- E outros campos de perfil...

## 🚨 Próximos Passos

1. Configure as variáveis de ambiente
2. Verifique se a tabela `assinaturas` existe no Supabase
3. Execute as migrações se necessário
4. Teste o login/registro
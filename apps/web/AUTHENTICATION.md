# Configuração de Autenticação com Cookies

## Visão Geral

O sistema de autenticação foi configurado para usar cookies em vez de localStorage, integrado com Next.js usando `@supabase/ssr`. Esta configuração permite autenticação segura tanto no servidor quanto no cliente.

## Arquitetura

### 1. Clientes Supabase

#### Cliente do Browser (`/src/lib/supabase.ts`)

```typescript
import { createClientComponentClient } from "@/lib/supabase";

// Para usar em Client Components
const supabase = createClientComponentClient();
```

#### Cliente do Servidor (`/src/lib/supabase-server.ts`)

```typescript
import { createServerComponentClient } from "@/lib/supabase-server";

// Para usar em Server Components
const supabase = await createServerComponentClient();
```

### 2. Middleware de Autenticação

O middleware (`/middleware.ts`) automaticamente:

- Verifica se o usuário está autenticado
- Redireciona usuários não autenticados para `/login`
- Redireciona usuários autenticados para o dashboard apropriado
- Mantém os cookies de sessão atualizados

### 3. Server Actions

#### Autenticação via Server Actions (`/src/lib/auth-actions.ts`)

```typescript
import { signIn, signOut, getUser } from "@/lib/auth-actions";

// Login
const result = await signIn(formData);

// Logout
await signOut();

// Obter usuário atual no servidor
const user = await getUser();
```

### 4. Context de Autenticação

O `AuthContext` foi refatorado para usar:

- `supabase.auth.signInWithPassword()` para login
- `supabase.auth.getUser()` para obter o usuário atual
- Cookies para persistência de sessão

## Como Usar

### Em Client Components

```typescript
"use client";
import { useAuth } from "@/contexts/AuthContext";

export default function MyComponent() {
  const { user, signIn, signOut, loading } = useAuth();

  // Usar normalmente
  if (loading) return <div>Carregando...</div>;
  if (!user) return <div>Não autenticado</div>;

  return <div>Olá, {user.full_name}!</div>;
}
```

### Em Server Components

```typescript
import { getUser } from "@/lib/auth-actions";

export default async function MyServerComponent() {
  const user = await getUser();

  if (!user) {
    return <div>Não autenticado</div>;
  }

  return <div>Olá, {user.full_name}!</div>;
}
```

### Server Actions

```typescript
"use server";
import { createServerComponentClient } from "@/lib/supabase-server";

export async function myAction() {
  const supabase = await createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  // Fazer operação autenticada
}
```

## Configuração de Cookies

### Configuração de Domínio

Para produção, configure as variáveis de ambiente:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Configuração de Cookies

Os cookies são configurados automaticamente com:

- `httpOnly`: false (para acesso do JavaScript)
- `secure`: true (em produção)
- `sameSite`: 'lax'
- `path`: '/'

## Vantagens desta Configuração

1. **Segurança**: Cookies são mais seguros que localStorage
2. **SSR**: Usuário disponível no servidor
3. **SEO**: Melhor indexação de páginas protegidas
4. **Performance**: Menos requisições para verificar autenticação
5. **Experiência**: Transições mais suaves entre páginas

## Rotas Protegidas

O middleware automaticamente protege:

- `/student-dashboard`
- `/teacher-dashboard`

E redireciona usuários autenticados de:

- `/login`

## Troubleshooting

### Problemas Comuns

1. **Cookies não persistem**: Verifique se as variáveis de ambiente estão corretas
2. **Redirecionamento infinito**: Verifique a lógica do middleware
3. **Usuário não carrega**: Verifique se o Supabase está configurado corretamente

### Debug

Para debug, você pode verificar:

- Cookies no DevTools (Application > Cookies)
- Rede para requisições de autenticação
- Console para erros de autenticação

## Migração do localStorage

A migração foi feita mantendo compatibilidade com o código existente:

- O `AuthContext` continua funcionando normalmente
- Páginas existentes não precisam ser alteradas
- Novos componentes podem usar tanto Client quanto Server Components

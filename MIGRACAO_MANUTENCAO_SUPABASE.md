# Migração para Sistema Completo de Manutenção com Supabase

## O que foi adicionado nesta branch

- Integração base com Supabase (`lib/env.ts`, `lib/supabase.ts`)
- Tipos do domínio de manutenção (`types/maintenance.ts`)
- Serviços para ler views e atualizar status (`services/maintenance.service.ts`)
- Hooks com React Query (`hooks/use-maintenance.ts`)
- Componentes visuais reutilizáveis (`components/maintenance/*`)
- Dashboard novo em `/maintenance`
- Tela detalhada da ordem em `/order/[id]`

## Variáveis de ambiente

Crie um `.env` baseado no `.env.example`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
EXPO_PUBLIC_COMPANY_SLUG=minha-oficina
EXPO_PUBLIC_ENABLE_SUPABASE_MAINTENANCE=true
EXPO_PUBLIC_APP_NAME=LM Waiting Room Live
```

## Views esperadas no banco

A interface nova usa estas estruturas no Supabase:

- `v_manager_orders`
- `v_customer_orders`
- `v_order_timeline`
- `maintenance_attachments`
- `maintenance_orders`

## Fluxo recomendado

1. Continue usando as telas antigas para a operação atual.
2. Ative o modo Supabase no `.env`.
3. Acesse `/maintenance` para validar a visão gerencial.
4. Acesse `/order/<ID_DA_ORDEM>` para validar detalhes e timeline.
5. Depois substitua gradualmente as tabs antigas pelas novas telas.

## Próximo passo sugerido

- ligar autenticação por perfil
- trocar a tab `Admin` pela nova visão do operador
- trocar a tab `Live` para ler ordens de manutenção em vez de atendimentos simples
- trocar `Analytics` para usar `v_manager_orders`
- trocar `Settings` para incluir credenciais e comportamento do modo manutenção

# Teste por etapas do novo sistema de manutenção

## Ordem recomendada de validação

1. Configure o `.env` com as credenciais do Supabase.
2. Ative `EXPO_PUBLIC_ENABLE_SUPABASE_MAINTENANCE=true`.
3. Valide as rotas nesta ordem:
   - `/maintenance-safe`
   - `/operator-safe`
   - `/live-safe`
   - `/manager-safe`
   - `/order-safe/<ID_DA_ORDEM>`

## O que observar em cada tela

### `/maintenance-safe`
- cards de ordens
- status badge
- leitura visual geral
- fallback quando o Supabase estiver desativado

### `/operator-safe`
- cards maiores
- foco em ações do operador
- leitura rápida de veículo, cliente, serviço e prioridade

### `/live-safe`
- visual para TV e recepção
- agrupamento por etapa da manutenção
- boa leitura em tela grande

### `/manager-safe`
- cards de métricas
- distribuição por status
- produtividade por operador

### `/order-safe/<ID_DA_ORDEM>`
- resumo da ordem
- timeline pública
- anexos

## Próxima etapa sugerida

Depois dessa validação visual:
1. expor a nova navegação dentro das tabs principais
2. substituir gradualmente `Live`
3. substituir gradualmente `Relatório`
4. por fim migrar `Admin`

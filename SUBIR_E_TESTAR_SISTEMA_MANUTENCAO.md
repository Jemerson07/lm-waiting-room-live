# Subir e testar o sistema de manutenção

## 1. Preparar o ambiente

### Requisitos
- Node.js 20+
- pnpm 9+
- projeto Supabase já criado
- estrutura SQL de manutenção já aplicada no banco

### Instalação
```bash
pnpm install
```

## 2. Configurar variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example`.

Exemplo:
```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
EXPO_PUBLIC_COMPANY_SLUG=minha-oficina
EXPO_PUBLIC_ENABLE_SUPABASE_MAINTENANCE=true
EXPO_PUBLIC_APP_NAME=LM Waiting Room Live
```

## 3. Rodar o projeto

### Web + servidor
```bash
pnpm dev
```

### Apenas Expo/Metro
```bash
pnpm dev:metro
```

### Android
```bash
pnpm android
```

### iOS
```bash
pnpm ios
```

## 4. Estrutura principal já pronta

### Hubs
- `/system-safe` → hub geral do sistema novo
- `/garage-hub-safe` → hub da oficina e recepção
- `/workshop-safe` → mesa da oficina
- `/manager-workspace-safe` → mesa gerencial

### Cliente
- `/customer-safe`
- `/customer-orders-safe`
- `/order-safe/ID_DA_ORDEM`
- `/order-center-safe/ID_DA_ORDEM`
- `/order-gallery-safe/ID_DA_ORDEM`
- `/order-media-safe/ID_DA_ORDEM`

### Oficina / operador
- `/checkin-safe`
- `/operator-safe`
- `/operator-actions-safe`
- `/operator-service-desk-safe`
- `/attachments-safe`
- `/maintenance-board-safe`

### Apresentação / TV / sala de espera
- `/lounge-presentation-safe`
- `/lounge-premium-safe`
- `/live-safe`

### Gestão e configuração
- `/manager-safe`
- `/settings-safe`

## 5. Ordem recomendada de teste

### Etapa A — validar integração
1. abrir `/settings-safe`
2. confirmar se Supabase está configurado
3. confirmar se o modo manutenção está ativo

### Etapa B — validar apresentação
1. abrir `/lounge-presentation-safe`
2. abrir `/lounge-premium-safe`
3. validar contagem de veículos e curso do atendimento

### Etapa C — validar oficina
1. abrir `/garage-hub-safe`
2. abrir `/checkin-safe`
3. criar uma nova ordem
4. abrir `/operator-service-desk-safe`
5. abrir `/operator-actions-safe`
6. atualizar o status da ordem
7. abrir `/attachments-safe`
8. registrar um anexo

### Etapa D — validar ordem
1. abrir `/order-center-safe/ID_DA_ORDEM`
2. abrir `/order-safe/ID_DA_ORDEM`
3. abrir `/order-gallery-safe/ID_DA_ORDEM`
4. abrir `/order-media-safe/ID_DA_ORDEM`

### Etapa E — validar cliente
1. abrir `/customer-orders-safe`
2. buscar ordens pelo e-mail do cliente
3. abrir o acompanhamento da ordem

### Etapa F — validar gerente
1. abrir `/manager-safe`
2. abrir `/manager-workspace-safe`
3. abrir `/maintenance-board-safe`

## 6. Estrutura funcional do sistema

### Sala de espera / descanso
Use:
- `/lounge-presentation-safe`
- `/lounge-premium-safe`

### Atendimento da oficina
Use:
- `/operator-service-desk-safe`
- `/operator-actions-safe`
- `/maintenance-board-safe`
- `/attachments-safe`

### Acompanhamento do cliente
Use:
- `/customer-orders-safe`
- `/order-safe/ID_DA_ORDEM`
- `/order-center-safe/ID_DA_ORDEM`

### Gestão
Use:
- `/manager-safe`
- `/manager-workspace-safe`

## 7. Pontos de atenção

- as telas novas estão em rotas seguras e separadas para não quebrar o fluxo antigo
- o próximo passo ideal é expor essas rotas na navegação principal do app
- a integração depende das views e tabelas do Supabase já estarem prontas
- para criação de ordem, o cliente e o veículo precisam existir no banco
- para registro de anexos, é necessário usuário autenticado

## 8. Próxima etapa sugerida

Depois de validar tudo:
1. expor o sistema novo nas tabs principais
2. migrar a Live antiga para o fluxo novo
3. migrar a área de relatório
4. consolidar a área Admin/Operador

# Sala de Espera Live

Sistema de gestão operacional para oficinas, centros automotivos e operações de manutenção de frota, com foco em **fila de atendimento**, **controle de status**, **histórico operacional**, **governança de SLA** e **visibilidade em tempo real**.

## Visão geral

O projeto foi concebido para resolver um problema operacional real: organizar o fluxo de atendimento de veículos do check-in até a conclusão do serviço, reduzindo gargalos, aumentando a visibilidade da operação e dando mais controle para gestão e equipe.

## Principais capacidades

- Painel administrativo para controle da operação
- Criação e acompanhamento de atendimentos
- Avanço de status por etapa operacional
- Histórico por atendimento
- Governança de SLA e justificativas operacionais
- Controle de acesso por papel de usuário
- Estrutura preparada para uso web e app

## Fluxo principal da operação

1. Entrada do veículo no atendimento
2. Acompanhamento por etapa operacional
3. Atualização de status pelo time
4. Registro de histórico e eventos
5. Acompanhamento de SLA e exceções
6. Conclusão e retenção no histórico

## Stack utilizada

### Front-end
- Expo
- React Native
- Expo Router
- TypeScript

### Back-end e dados
- Supabase
- Autenticação com controle de papéis
- Tabelas de ordens, eventos, clientes, veículos e empresas

### Integrações e suporte técnico
- React Query
- Zod
- Drizzle
- Express

## Estrutura do projeto

```text
app/                 Rotas e telas principais
components/          Componentes reutilizáveis da interface
hooks/               Hooks de dados, autenticação e operação
lib/                 Integrações, regras de acesso e serviços
server/              Camada de apoio e serviços auxiliares
shared/              Tipos e utilitários compartilhados
```

## Perfis de acesso

- **Administrador**: visão gerencial, exclusão e controle ampliado
- **Operador**: uso operacional da fila e atualização de status
- **Cliente**: estrutura preparada para expansão de acesso controlado

## Diferenciais do projeto

Este repositório não representa apenas um CRUD. Ele demonstra:

- Modelagem de fluxo operacional real
- Pensamento de produto aplicado ao software
- Controle de acesso por perfil
- Integração com base de dados e autenticação
- Estrutura voltada para entrega web e mobile
- Capacidade de transformar necessidade de negócio em solução funcional

## Como rodar localmente

### Pré-requisitos
- Node.js 20+
- pnpm
- Projeto Supabase configurado

### Instalação

```bash
pnpm install
```

### Variáveis de ambiente
Crie um arquivo `.env` na raiz com:

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
EXPO_PUBLIC_COMPANY_SLUG=...
```

### Rodar localmente

```bash
npx expo start --web
```

### Checagem de tipos

```bash
pnpm exec tsc --noEmit
```

## Deploy

### Web
A estrutura suporta exportação web com Expo e publicação em ambientes como Netlify.

```bash
npx expo export -p web
```

### Android (APK)
O projeto também está preparado para build com EAS.

```bash
eas build -p android --profile preview
```

## Valor de negócio

O Sala de Espera Live foi desenhado para gerar ganho operacional por meio de:

- mais organização da fila de atendimento
- mais visibilidade do andamento dos veículos
- mais controle para o gestor
- histórico centralizado das movimentações
- acompanhamento de SLA e bloqueios operacionais

## Posicionamento profissional

Este projeto é um case de desenvolvimento com foco em:

- solução de problema real
- produto digital para operação
- full stack com visão de negócio
- tecnologia aplicada à eficiência operacional

## Próximos passos do produto

- refinamento da experiência mobile
- evolução de relatórios gerenciais
- dashboards operacionais mais analíticos
- expansão de notificações e automações
- consolidação do fluxo de implantação para clientes

## Autor

**Jemerson Santos**

Se quiser usar este projeto como vitrine profissional, consulte também `docs/LINKEDIN_CASE.md`.

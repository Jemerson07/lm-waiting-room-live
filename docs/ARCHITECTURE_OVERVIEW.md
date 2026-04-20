# Architecture Overview

## Objetivo

Este documento resume a arquitetura funcional do projeto **Sala de Espera Live**, destacando como o sistema foi estruturado para suportar um fluxo operacional de atendimento automotivo em tempo real.

## Camadas principais

### Interface
A camada de interface foi construída com Expo, React Native e Expo Router, permitindo evolução para web e mobile com reaproveitamento de componentes e navegação orientada a rotas.

### Estado e dados
A aplicação utiliza hooks e integrações centralizadas para leitura e atualização de atendimentos, usuários, configurações e histórico operacional.

### Autenticação e acesso
O acesso é apoiado pelo Supabase Auth, com leitura de papéis por empresa para separar responsabilidades administrativas e operacionais.

### Regras de negócio
As regras principais do fluxo estão concentradas em módulos de domínio e utilitários que tratam:

- transição de status
- leitura de SLA
- prioridade operacional
- justificativas e governança
- composição do histórico por atendimento

## Entidades centrais

### Empresa
Representa a organização que utiliza o sistema.

### Filial
Permite contextualizar a operação por unidade.

### Cliente
Representa o dono do veículo ou solicitante do serviço.

### Veículo
Identifica o ativo em manutenção.

### Ordem de manutenção
É o núcleo do fluxo operacional e guarda o status atual do atendimento.

### Evento de manutenção
Mantém histórico de mudanças, observações e ações relevantes.

## Fluxo simplificado

```text
Cliente/Veículo -> Ordem de Manutenção -> Atualização de Status -> Evento -> Histórico/SLA
```

## Padrões observados no projeto

- componentes reutilizáveis para interface operacional
- hooks para desacoplar leitura e escrita de dados
- separação entre tela, componente e integração
- integração com Supabase para autenticação e persistência
- orientação para deploy web e app Android

## Valor técnico do case

Este projeto demonstra:

- modelagem orientada a processo real
- integração front-end + autenticação + dados
- visão de produto aplicada à engenharia
- capacidade de estruturar software para operação e gestão

## Melhorias futuras recomendadas

- consolidar testes automatizados para fluxos críticos
- evoluir documentação de APIs internas
- ampliar relatórios gerenciais
- organizar checklist de implantação por cliente
- incluir material visual do fluxo no repositório

# Design do Aplicativo - LM Sala de Espera Live

## Conceito Geral

Aplicativo móvel para gerenciamento e visualização em tempo real de atendimentos em uma sala de espera veicular. O aplicativo possui duas interfaces principais: uma administrativa para gerenciar atendimentos e uma tela "live" estilizada para exibição em TVs/displays na sala de espera.

## Orientação e Usabilidade

- **Orientação**: Portrait (9:16) para uso em dispositivos móveis
- **Usabilidade**: Interface otimizada para uso com uma mão
- **Plataforma**: iOS e Android (seguindo Apple Human Interface Guidelines)

## Lista de Telas

### 1. Tela Administrativa (Admin)
**Propósito**: Gerenciar atendimentos em tempo real

**Conteúdo Principal**:
- Formulário para adicionar novos atendimentos (placa, modelo, cliente, descrição)
- Lista de atendimentos organizados por cards
- Filtros por status (Todos, Chegada, Aguardando, Em Manutenção, Finalizada)
- Indicadores visuais de tempo decorrido
- Botões de ação para avançar status ou remover atendimentos

**Funcionalidades**:
- Adicionar novo atendimento via modal
- Atualizar status do atendimento (progressão linear)
- Remover atendimentos finalizados
- Filtrar visualização por status
- Atualização automática em tempo real

### 2. Tela Live (Display)
**Propósito**: Visualização pública para clientes na sala de espera

**Conteúdo Principal**:
- Header com logo da empresa e nome
- Relógio em tempo real
- Seções organizadas por status com contadores
- Cards visuais de veículos com animações
- Background animado temático
- Footer com informações da empresa

**Funcionalidades**:
- Atualização automática a cada 3 segundos
- Pull-to-refresh manual
- Animações suaves para transições
- Agrupamento visual por status
- Storytelling visual do processo de atendimento

### 3. Tela de Configurações
**Propósito**: Personalizar informações da empresa

**Conteúdo Principal**:
- Nome da empresa
- Configurações de cores (paleta azul/branco fixa)
- Ativar/desativar alertas sonoros

**Funcionalidades**:
- Editar nome da empresa
- Toggle para alertas sonoros
- Persistência local das configurações

## Fluxos de Usuário Principais

### Fluxo 1: Adicionar Novo Atendimento
1. Usuário acessa tela Admin
2. Toca no botão "+" flutuante
3. Modal de formulário aparece
4. Preenche: placa, modelo, nome do cliente (opcional), descrição (opcional)
5. Toca em "Criar Atendimento"
6. Feedback háptico de sucesso
7. Atendimento aparece na lista com status "Chegada"
8. Atendimento aparece automaticamente na tela Live

### Fluxo 2: Avançar Status do Atendimento
1. Usuário visualiza card do atendimento na tela Admin
2. Toca no botão de ação "→ Próximo Status"
3. Status avança (Chegada → Aguardando → Em Manutenção → Finalizada)
4. Feedback háptico médio
5. Card atualiza cor e posição conforme novo status
6. Mudança reflete automaticamente na tela Live

### Fluxo 3: Visualizar Atendimentos na Tela Live
1. Tela Live exibe automaticamente todos os atendimentos
2. Atendimentos agrupados por status em seções
3. Cada seção mostra contador de itens
4. Cards animam suavemente ao aparecer/mudar
5. Atualização automática a cada 3 segundos
6. Cliente pode puxar para baixo para forçar atualização

## Paleta de Cores (Azul e Branco)

### Cores Principais
- **Azul Primário**: `#0066CC` (Azul VW) - Cor principal da marca
- **Branco**: `#FFFFFF` - Background e textos em fundos escuros
- **Azul Escuro**: `#004C99` - Elementos de destaque e sombras

### Cores de Status
- **Chegada**: `#0066CC` (Azul) - Veículo acabou de chegar
- **Aguardando**: `#FFA500` (Laranja) - Aguardando atendimento
- **Em Manutenção**: `#FF6B00` (Laranja Escuro) - Sendo atendido
- **Finalizada**: `#00C853` (Verde) - Atendimento concluído

### Cores de Suporte
- **Texto Primário**: `#11181C` (modo claro) / `#ECEDEE` (modo escuro)
- **Texto Secundário**: `#687076` (modo claro) / `#9BA1A6` (modo escuro)
- **Background Card**: `#F8F9FA` (modo claro) / `#1E1E1E` (modo escuro)
- **Background Gradient (Live)**: Gradiente azul `#0066CC` → `#004C99`

## Tipografia

### Hierarquia de Texto
- **Título Grande**: 32pt, Bold, lineHeight 40pt - Títulos de tela
- **Subtítulo**: 20pt, Bold, lineHeight 28pt - Seções e headers
- **Corpo**: 16pt, Regular, lineHeight 24pt - Texto padrão
- **Corpo Semibold**: 16pt, Semibold, lineHeight 24pt - Destaques
- **Legenda**: 14pt, Regular, lineHeight 20pt - Informações secundárias
- **Pequeno**: 12pt, Regular, lineHeight 18pt - Footer e timestamps

### Fonte
- **iOS**: SF Pro (sistema)
- **Android**: Roboto (sistema)

## Espaçamento

Sistema de grid de 8pt:
- **Extra Pequeno**: 4pt
- **Pequeno**: 8pt
- **Médio**: 16pt
- **Grande**: 24pt
- **Extra Grande**: 32pt
- **Seção**: 40pt

## Componentes Visuais

### 1. Card de Atendimento (Admin)
- **Tamanho**: Full width - 32pt (margens)
- **Padding**: 16pt
- **Border Radius**: 12pt
- **Sombra**: Suave (elevation 2)
- **Indicador de Status**: Barra colorida lateral (4pt)
- **Elementos**:
  - Placa do veículo (destaque, 20pt Bold)
  - Modelo do veículo (16pt Regular)
  - Nome do cliente (14pt, opcional)
  - Descrição (14pt, opcional, max 2 linhas)
  - Badge de status (colorido)
  - Tempo decorrido (12pt, cinza)
  - Botões de ação (44pt altura mínima)

### 2. Card de Veículo (Live)
- **Tamanho**: Full width - 40pt (margens)
- **Padding**: 20pt
- **Border Radius**: 16pt
- **Background**: Semi-transparente branco (rgba(255,255,255,0.95))
- **Elementos**:
  - Placa do veículo (24pt Bold, cor do status)
  - Modelo do veículo (18pt Regular)
  - Nome do cliente (16pt, opcional)
  - Badge de status grande (visual destacado)
  - Animação de pulso para "Em Manutenção"

### 3. Botão Flutuante (FAB)
- **Tamanho**: 56pt × 56pt
- **Border Radius**: 28pt (circular)
- **Posição**: Bottom right, 16pt das bordas
- **Cor**: Azul primário `#0066CC`
- **Ícone**: "+" branco, 24pt
- **Sombra**: Elevation 6
- **Animação**: Scale ao pressionar

### 4. Badge de Status
- **Padding**: 8pt horizontal, 4pt vertical
- **Border Radius**: 12pt
- **Cor de fundo**: Cor do status
- **Texto**: Branco, 14pt Semibold

### 5. Filtros (Admin)
- **Layout**: Scroll horizontal
- **Tamanho**: Auto width, 36pt altura
- **Padding**: 12pt horizontal, 8pt vertical
- **Border Radius**: 18pt
- **Estado normal**: Background cinza claro
- **Estado ativo**: Background azul primário, texto branco

## Animações e Transições

### Animações da Tela Live
1. **Background Animado**: Gradiente azul com movimento suave
2. **Fade In**: Cards aparecem com fade in (500ms)
3. **Pulso**: Cards "Em Manutenção" pulsam suavemente (2s loop)
4. **Slide Up**: Novos atendimentos entram de baixo para cima
5. **Slide Out**: Atendimentos removidos saem para a direita

### Feedback Háptico
- **Sucesso**: Notification Success - ao criar/finalizar atendimento
- **Ação**: Impact Medium - ao mudar status
- **Erro**: Notification Error - ao falhar operação

### Transições de Tela
- **Duração**: 300ms
- **Easing**: Ease-in-out
- **Tipo**: Slide horizontal entre tabs

## Layout e Navegação

### Estrutura de Navegação
- **Tab Bar** (bottom):
  - Admin (ícone: clipboard)
  - Live (ícone: tv)
  - Configurações (ícone: gear)

### Safe Areas
- **Top**: Respeitar notch/status bar (Math.max(insets.top, 20))
- **Bottom**: Respeitar home indicator (Math.max(insets.bottom, 20))
- **Sides**: 20pt mínimo

### Touch Targets
- **Mínimo**: 44pt × 44pt
- **Botões principais**: 48pt altura
- **Cards**: Tappable com feedback visual

## Storytelling Visual (Tela Live)

A tela Live conta a história do atendimento através de uma narrativa visual:

1. **Header Acolhedor**: Logo + nome da empresa + mensagem "Acompanhe seu veículo em tempo real"
2. **Relógio**: Transmite profissionalismo e pontualidade
3. **Seção "Chegada"**: "Seu veículo chegou! Estamos preparando o atendimento"
4. **Seção "Aguardando"**: "Em breve iniciaremos o atendimento do seu veículo"
5. **Seção "Em Manutenção"**: "Seu veículo está sendo atendido agora" (com animação de pulso)
6. **Seção "Finalizada"**: "Atendimento concluído! Obrigado pela confiança"
7. **Footer**: Informações da empresa e slogan

### Elementos de Storytelling
- **Cores progressivas**: Azul (início) → Laranja (processo) → Verde (conclusão)
- **Animações**: Mais intensas em "Em Manutenção" para chamar atenção
- **Agrupamento visual**: Facilita localização do próprio veículo
- **Contadores**: Transparência sobre quantos veículos em cada etapa

## Considerações de Performance

- **Polling**: Atualização a cada 3 segundos (não sobrecarregar)
- **FlatList**: Usar para listas longas (não ScrollView com .map)
- **Memoização**: React.memo em cards para evitar re-renders desnecessários
- **Imagens**: Usar expo-image para otimização automática
- **Cache**: Manter último estado em AsyncStorage para carregamento rápido

## Acessibilidade

- **Contraste**: Todas as combinações de cor atendem WCAG AA
- **Touch targets**: Mínimo 44pt conforme HIG
- **Labels**: Todos os botões têm labels descritivos
- **Feedback**: Visual + háptico para todas as ações

# 📱 Guia: Controle Remoto da TV pelo Celular

## 🎯 Objetivo

Você pode controlar a tela Live na TV usando seu celular como controle remoto. A tela do celular mostra os atendimentos em tempo real e você pode gerenciar tudo de uma sala de atendimento.

---

## 🔧 Configuração Inicial

### Passo 1: Certifique-se que o Sistema Está Rodando

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:web
```

Acesse: `http://localhost:3000`

---

### Passo 2: Acessar o Controle Remoto

1. No navegador, acesse: **http://localhost:3000/tv-remote-control**
2. Você verá a página de controle remoto com:
   - Status de conexão
   - Estatísticas em tempo real
   - Instruções de uso
   - Botões de ação

---

## 📺 Conectar Celular à TV

### Opção A: Usar QR Code (Recomendado)

#### Na Sala de Atendimento (Computador)

1. Abra: **http://localhost:3000/tv-remote-control**
2. Clique em **"📱 Gerar QR Code"**
3. Um QR Code será exibido na tela

#### No Seu Celular

1. Abra a **câmera do celular**
2. Aponte para o **QR Code** exibido no computador
3. Clique no **link que aparecer**
4. A tela Live será aberta no seu celular
5. **Pronto!** Você agora controla a TV pelo celular

---

### Opção B: Usar Link Direto

#### Na Sala de Atendimento (Computador)

1. Abra: **http://localhost:3000/tv-remote-control**
2. Clique em **"📋 Copiar URL"**
3. A URL será copiada para a área de transferência

#### No Seu Celular

1. Abra o **navegador do celular**
2. Cole a URL na barra de endereço
3. Pressione **Enter**
4. A tela Live será aberta

---

## 🖥️ Exibir a Tela na TV

### Se Tiver Computador Conectado à TV

1. Conecte o computador à TV via **HDMI**
2. No computador, abra: **http://localhost:3000/tv-display**
3. Pressione **F11** para tela cheia
4. A tela TV será exibida em **landscape**

### Se Tiver Outro Computador na Rede

1. Descubra o IP do computador principal:

**Windows:**
```bash
ipconfig
```

**Mac/Linux:**
```bash
ifconfig
```

Procure por: `192.168.1.100` (exemplo)

2. No computador conectado à TV, abra o navegador:

```
http://192.168.1.100:3000/tv-display
```

3. Pressione **F11** para tela cheia

---

## 📱 Usar o Controle Remoto no Celular

### Tela do Celular Mostra:

| Elemento | O que faz |
|----------|-----------|
| **Status de Conexão** | Verde = Conectado, Amarelo = Aguardando |
| **Estatísticas** | Total, Chegada, Fila, Atendendo |
| **Instruções** | Como usar o sistema |
| **URL da Tela Live** | Link para compartilhar |
| **Botões de Ação** | Gerar QR Code, Copiar URL, Abrir em Nova Aba |

### O que Você Pode Fazer:

1. **Monitorar em Tempo Real** — Ver todos os atendimentos
2. **Gerenciar Atendimentos** — Criar, atualizar status, remover
3. **Controlar a TV** — A tela TV atualiza automaticamente
4. **Exportar Relatórios** — Gerar CSV com dados

---

## 🔄 Sincronização em Tempo Real

### Como Funciona

1. **Celular** → Você cria/atualiza um atendimento
2. **Servidor** → Recebe a mudança
3. **TV** → Atualiza automaticamente a cada 3 segundos
4. **Feedback** → Você vê a mudança no celular

### Exemplo de Fluxo

```
Você cria atendimento "ABC-1234" no celular
↓
Servidor armazena o dado
↓
TV atualiza em até 3 segundos
↓
Atendimento aparece na tela TV
↓
Você vê a notificação de conclusão quando finalizar
```

---

## 🚀 Cenários de Uso

### Cenário 1: Sala de Atendimento

```
┌─────────────────────────────────────┐
│         TELA NA TV (landscape)      │
│  Mostra atendimentos em tempo real  │
│  Atualiza a cada 3 segundos         │
└─────────────────────────────────────┘
         ↑
         │ Sincroniza
         │
    ┌────────────┐
    │  Celular   │
    │  (Você)    │
    │ Controla   │
    │ tudo aqui  │
    └────────────┘
```

### Cenário 2: Múltiplas Salas

```
Sala 1: TV exibindo atendimentos
Sala 2: TV exibindo atendimentos
Sala 3: TV exibindo atendimentos
   ↑         ↑         ↑
   └─────────┴─────────┘
        Seu Celular
    (Controla todas)
```

---

## 🔌 Configuração de Rede

### Para Usar em Múltiplos Dispositivos

1. **Computador 1** (com backend e frontend):
   - Rodando: `npm run dev:server` e `npm run dev:web`
   - IP: `192.168.1.100` (exemplo)

2. **Computador 2** (conectado à TV):
   - Acessa: `http://192.168.1.100:3000/tv-display`
   - Exibe tela TV em tela cheia

3. **Seu Celular**:
   - Acessa: `http://192.168.1.100:3000/tv-remote-control`
   - Controla tudo

---

## 📊 Monitorar Atendimentos

### Na Tela do Celular Você Vê:

- **Total** — Todos os atendimentos
- **Chegada** — Veículos que acabaram de chegar
- **Fila** — Aguardando atendimento
- **Atendendo** — Em manutenção agora
- **Concluído** — Finalizados (removidos da TV após 5 seg)

### Ações Disponíveis:

1. **Criar Atendimento** — Clique em "+" e preencha os dados
2. **Atualizar Status** — Clique no atendimento e mude o status
3. **Remover** — Clique em "✗" para remover
4. **Filtrar** — Use os filtros para ver apenas o que quer
5. **Exportar** — Gere relatórios em CSV

---

## 🐛 Troubleshooting

### ❌ "Celular não conecta"

1. Verifique se estão na **mesma rede WiFi**
2. Confirme o **IP do computador** (`ipconfig` ou `ifconfig`)
3. Tente acessar: `http://192.168.1.100:3000` (substitua pelo seu IP)
4. Reinicie o navegador do celular

---

### ❌ "TV não atualiza"

1. Pressione **F5** para recarregar a página
2. Verifique se o backend está rodando: `npm run dev:server`
3. Abra o console do navegador: **F12**
4. Procure por mensagens de erro

---

### ❌ "Atendimento não aparece na TV"

1. Verifique se o atendimento foi criado no celular
2. Aguarde até 3 segundos para a TV atualizar
3. Recarregue a página TV: **F5**
4. Verifique a conexão de internet

---

## 💡 Dicas Profissionais

1. **Use Modo Landscape** — Melhor visualização no celular
2. **Mantenha Próximo** — WiFi mais forte perto da TV
3. **Monitore Constantemente** — Veja os atendimentos em tempo real
4. **Crie Rotinas** — Sempre criar atendimento → Atualizar status → Finalizar
5. **Exporte Relatórios** — Gere dados para análise

---

## 🎓 Próximos Passos

- [ ] Testar com múltiplos atendimentos
- [ ] Conectar à TV real
- [ ] Usar em múltiplas salas
- [ ] Configurar notificações WhatsApp
- [ ] Gerar relatórios diários

---

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs no Terminal
2. Abra o console do navegador: **F12**
3. Procure por mensagens de erro
4. Tente reiniciar o servidor

---

**Versão:** 1.0.0  
**Última atualização:** 2026-03-25  
**Status:** ✅ Funcional

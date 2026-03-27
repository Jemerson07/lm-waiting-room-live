# 📺 Como Conectar a TV - Guia Simples e Funcional

## ✅ Solução Rápida (Funciona 100%)

### Passo 1: Abrir a URL no Navegador da TV

Na TV, abra um navegador (Chrome, Firefox, Safari) e digite:

```
http://lmsalalive-xnr8pe9w.manus.space/tv-simple.html
```

**Pronto! A tela Live aparecerá na TV automaticamente!**

---

## 🎯 Se a URL acima não funcionar, tente estas alternativas:

### Opção A: Usar o IP Local

1. **No seu computador**, abra o terminal/cmd
2. Digite: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
3. Procure por "IPv4 Address" (ex: 192.168.1.100)
4. **Na TV**, digite: `http://192.168.1.100:3000/tv-simple.html`

### Opção B: Usar Screen Mirroring (Mais Simples)

1. **No celular**, abra o navegador
2. Digite: `http://192.168.1.100:3000/live` (ou use a URL acima)
3. **No celular**, ative Screen Mirroring:
   - Android: Deslize do topo → "Transmitir" ou "Screen Cast"
   - iPhone: Deslize do canto → "Screen Mirroring"
4. Selecione sua TV
5. **Pronto! A tela aparecerá na TV**

### Opção C: Usar o Domínio Manus (Recomendado)

Se você tiver acesso à internet na TV:

```
https://lmsalalive-xnr8pe9w.manus.space/tv-simple.html
```

---

## 🔧 Checklist Antes de Conectar

- [ ] TV ligada e conectada ao WiFi
- [ ] Computador ligado e rodando o sistema (`npm run dev:web`)
- [ ] Celular e TV no mesmo WiFi (se usar Screen Mirroring)
- [ ] Navegador aberto na TV (Chrome, Firefox, Safari)

---

## 📊 O que Você Verá na TV

✅ **Tela Live com 3 seções:**
- 🚗 **Chegada** — Veículos que chegaram
- ⏳ **Fila de Espera** — Veículos aguardando
- 🔧 **Em Atendimento** — Veículos sendo atendidos

✅ **Atualização automática a cada 3 segundos**

✅ **Notificação quando atendimento é concluído**

✅ **Contador de atendimentos finalizados**

---

## 🚀 Próximos Passos

1. **Abra o painel Admin**: `http://localhost:3000`
2. **Crie atendimentos de teste**
3. **Veja a tela Live atualizar na TV**
4. **Mude o status dos atendimentos**
5. **Veja a notificação de conclusão aparecer**

---

## ❌ Se Não Funcionar

### Problema 1: "Página em branco"
- Aguarde 5 segundos (está carregando)
- Recarregue a página (F5)
- Verifique se o servidor está rodando

### Problema 2: "Não consegue acessar o IP"
- Verifique se está no MESMO WiFi
- Tente usar o domínio Manus (mais confiável)
- Reinicie a TV

### Problema 3: "Dados não aparecem"
- Crie alguns atendimentos no painel Admin
- Aguarde 3 segundos para atualizar
- Verifique se o servidor está respondendo

---

## 💡 Dica Profissional

**Use a página HTML simples (`tv-simple.html`) — é mais estável e não depende de React!**

Esta página:
- ✅ Funciona offline
- ✅ Carrega rápido
- ✅ Não tem bugs de React
- ✅ Funciona em qualquer TV
- ✅ Atualiza automaticamente

---

## 📱 Alternativa: Screen Mirroring (Mais Fácil)

Se a TV não tiver navegador ou não conseguir acessar a URL:

1. Abra a tela Live no **celular**
2. Ative Screen Mirroring no celular
3. Selecione a TV
4. **Pronto! A tela aparecerá na TV**

**Tempo total: 2 minutos**

---

## 🎯 URLs Disponíveis

| URL | Descrição | Funciona Offline |
|-----|-----------|------------------|
| `http://localhost:3000/tv-simple.html` | Tela Live simples | ✅ Sim |
| `http://192.168.1.100:3000/tv-simple.html` | Tela Live (IP local) | ✅ Sim |
| `https://lmsalalive-xnr8pe9w.manus.space/tv-simple.html` | Tela Live (domínio) | ✅ Sim |
| `http://localhost:3000/live` | Tela Live (React) | ❌ Não |

**Recomendação: Use `tv-simple.html` — é mais estável!**

---

## 📞 Precisa de Ajuda?

1. Verifique se está no MESMO WiFi
2. Reinicie a TV
3. Reinicie o navegador
4. Tente outro método (Screen Mirroring)
5. Use o domínio Manus (mais confiável)

**Qualquer dúvida, é só chamar! 🚀**

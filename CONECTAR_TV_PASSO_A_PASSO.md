# 📺 Como Conectar a Tela Live na TV - Guia Completo

Este guia mostra **3 métodos diferentes** para conectar a tela Live do seu sistema na TV. Escolha o que funciona melhor para você.

---

## 🎯 Método 1: Screen Mirroring (MAIS SIMPLES - Recomendado)

**Funciona com:** Android, iPhone, Samsung, LG, Sony, qualquer TV com WiFi

### Passo 1: Preparar o Celular e a TV

1. **Coloque o celular e a TV no MESMO WiFi**
  - Celular: Vá em Configurações → WiFi → Conecte na sua rede WiFi
  - TV: Vá em Configurações → Rede → Conecte na mesma rede WiFi
  - ✅ Ambos devem estar na mesma rede (ex: "WiFi-Casa")

### Passo 2: Abrir a Tela Live no Celular

1. Abra o navegador (Chrome, Safari, Firefox)

1. Digite: `http://localhost:3000/live` (se estiver no mesmo computador )
  - OU digite o IP do seu computador: `http://192.168.1.X:3000/live`
  - Para encontrar o IP: No computador, abra terminal e digite `ipconfig` (Windows ) ou `ifconfig` (Mac/Linux)

1. ✅ Você verá a tela Live com os atendimentos

### Passo 3: Ativar Screen Mirroring no Celular

#### 📱 Se for Android:

1. Deslize o dedo do topo para baixo (2 vezes) para abrir o painel de controle

1. Procure por uma das opções:
  - **"Transmitir"** (Google)
  - **"Screen Cast"** (genérico)
  - **"Wireless Display"** (Miracast)
  - **"Smart View"** (Samsung)

1. Clique na opção

1. Selecione sua TV na lista

1. ✅ Pronto! A tela do celular aparecerá na TV

#### 📱 Se for iPhone:

1. Deslize o dedo do canto superior direito para baixo (Control Center)

1. Procure por **"Screen Mirroring"** ou **"AirPlay"**

1. Clique nela

1. Selecione sua TV na lista (deve aparecer como "Apple TV" ou o nome da TV)

1. ✅ Pronto! A tela do iPhone aparecerá na TV

#### 📱 Se for Samsung:

1. Deslize o dedo do topo para baixo (2 vezes)

1. Procure por **"Smart View"**

1. Clique nela

1. Selecione sua TV

1. ✅ Pronto!

### Passo 4: Ajustar a Tela na TV

1. A tela Live aparecerá na TV

1. Se quiser aumentar o tamanho:
  - No celular, vire para **modo paisagem** (deitado)
  - Ou use o zoom do navegador (Ctrl + ou Cmd +)

1. ✅ Pronto! Agora você tem a tela Live na TV

### Vantagens do Método 1:

- ✅ Não precisa modificar o app

- ✅ Funciona com qualquer TV

- ✅ Muito simples

- ✅ Sem atraso perceptível

### Desvantagens do Método 1:

- ⚠️ Mostra tudo da tela (notificações, barra de status)

- ⚠️ Depende da qualidade do WiFi

- ⚠️ Pequeno delay (1-2 segundos)

---

## 🎬 Método 2: Casting (Google Cast - Mais Profissional)

**Funciona com:** Chromecast, Google TV, Android TV

### Passo 1: Verificar Compatibilidade

1. Sua TV tem Chromecast embutido? (Google TV, Android TV)
  - OU você tem um Chromecast externo conectado?

1. ✅ Se sim, continue

### Passo 2: Preparar a Rede

1. Celular e TV devem estar no MESMO WiFi

1. ✅ Pronto

### Passo 3: Usar o Botão de Cast

1. Abra a tela Live no navegador do celular

1. Procure pelo ícone de **"Cast"** (parece uma TV com WiFi):
  - Pode estar no menu do navegador (3 pontos)
  - Ou no painel de controle do celular

1. Clique em Cast

1. Selecione sua TV

1. ✅ Pronto! A tela aparecerá na TV

### Vantagens do Método 2:

- ✅ Sem espelhar a tela inteira

- ✅ Apenas a aba do navegador é transmitida

- ✅ Sem notificações aparecendo

- ✅ Melhor qualidade

### Desvantagens do Método 2:

- ⚠️ Só funciona com Chromecast/Google TV

- ⚠️ Precisa de TV compatível

---

## 🌐 Método 3: URL Direta na TV (MAIS PROFISSIONAL)

**Funciona com:** Smart TV com navegador (Samsung, LG, Sony, etc)

### Passo 1: Encontrar o IP do Seu Computador

**No Windows:**

1. Abra o terminal (cmd)

1. Digite: `ipconfig`

1. Procure por "IPv4 Address" (ex: 192.168.1.100)

1. Anote esse número

**No Mac:**

1. Abra o terminal

1. Digite: `ifconfig | grep "inet "`

1. Procure por "inet 192.168..." (ex: 192.168.1.100)

1. Anote esse número

**No Linux:**

1. Abra o terminal

1. Digite: `hostname -I`

1. Anote o primeiro IP (ex: 192.168.1.100)

### Passo 2: Conectar a TV à Rede

1. Vá em Configurações → Rede → WiFi

1. Conecte na mesma rede do computador

1. ✅ Pronto

### Passo 3: Abrir o Navegador da TV

1. Procure pelo app de navegador (Chrome, Safari, Firefox, etc)

1. Abra o navegador

1. Na barra de endereço, digite:

   ```
   http://192.168.1.100:3000/live
   ```

   (Substitua 192.168.1.100 pelo IP que você anotou )

1. Pressione Enter

1. ✅ Pronto! A tela Live aparecerá na TV

### Vantagens do Método 3:

- ✅ Sem celular

- ✅ Sem delay

- ✅ Muito estável

- ✅ Profissional

### Desvantagens do Método 3:

- ⚠️ TV precisa ter navegador

- ⚠️ Precisa saber o IP do computador

---

## 🔧 Troubleshooting (Problemas Comuns)

### Problema 1: "Não encontra a TV"

**Solução:**

1. Verifique se celular e TV estão no MESMO WiFi

1. Reinicie o WiFi (desligue e ligue)

1. Tente aproximar o celular da TV

1. Reinicie a TV

### Problema 2: "A tela aparece mas está muito pequena"

**Solução:**

1. Vire o celular para modo paisagem (deitado)

1. Use o zoom do navegador (Ctrl + ou Cmd +)

1. Aumente o tamanho da fonte (Ctrl + ou Cmd +)

### Problema 3: "Não consigo digitar o IP"

**Solução:**

1. Use um teclado Bluetooth conectado à TV

1. OU use o controle remoto para digitar

1. OU use um app de controle remoto do celular

### Problema 4: "A conexão cai"

**Solução:**

1. Verifique a qualidade do WiFi

1. Aproxime-se do roteador

1. Reinicie o roteador

1. Troque para 5GHz (se disponível)

### Problema 5: "Não consigo achar o Screen Mirroring"

**Solução:**

1. Procure no painel de controle (deslize do topo)

1. Procure por "Transmitir", "Cast", "Smart View", "AirPlay"

1. Se não encontrar, vá em Configurações → Exibição → Transmissão

1. Ative a opção

---

## 📋 Checklist Final

Antes de conectar, verifique:

- [ ] Celular e TV estão no MESMO WiFi

- [ ] O sistema está rodando no computador (`npm run dev:web`)

- [ ] O navegador está aberto com a tela Live

- [ ] A TV está ligada e conectada ao WiFi

- [ ] Você escolheu um dos 3 métodos acima

---

## 🎯 Resumo Rápido

| Método | Facilidade | Qualidade | Compatibilidade | Recomendação |
| --- | --- | --- | --- | --- |
| **Screen Mirroring** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **MELHOR** |
| **Google Cast** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Bom |
| **URL Direta** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Profissional |

---

## 📞 Precisa de Ajuda?

Se tiver problemas:

1. Verifique se está no MESMO WiFi

1. Reinicie a TV

1. Reinicie o celular

1. Reinicie o computador

1. Tente outro método

**Dica:** O **Método 1 (Screen Mirroring)** é o mais simples e funciona com qualquer TV. Comece por ele!

---

## 🚀 Próximo Passo

Depois de conectar a TV:

1. Acesse o painel Admin: `http://localhost:3000`

1. Crie alguns atendimentos de teste

1. Veja a tela Live na TV atualizar em tempo real

1. Teste mudar o status dos atendimentos

1. Veja a notificação de conclusão aparecer na TV

**Pronto! Você tem um sistema de sala de espera profissional na TV! 🎉**


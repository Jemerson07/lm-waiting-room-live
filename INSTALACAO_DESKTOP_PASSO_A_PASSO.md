# 📖 Guia de Instalação Desktop - Passo a Passo

## ⏱️ Tempo Total: 15-20 minutos

---

## 🔧 PASSO 1: Instalar Node.js

### Windows

1. Abra o navegador e acesse: **https://nodejs.org/**
2. Clique no botão verde grande **"LTS"** (versão recomendada)
3. Clique em **"Download"**
4. Abra o arquivo baixado (`.msi`)
5. Clique em **"Next"** várias vezes até terminar
6. ✅ Reinicie o computador

### Mac

1. Abra o navegador e acesse: **https://nodejs.org/**
2. Clique no botão verde grande **"LTS"**
3. Clique em **"Download"** (escolha versão Mac)
4. Abra o arquivo baixado (`.pkg`)
5. Siga as instruções do instalador
6. ✅ Reinicie o computador

### Linux (Ubuntu/Debian)

Abra o terminal e execute:

```bash
sudo apt-get update
sudo apt-get install nodejs npm
```

---

## ✅ PASSO 2: Verificar Instalação

Abra o **Terminal** (ou **Prompt de Comando** no Windows) e execute:

```bash
node --version
npm --version
```

Você deve ver versões como:
```
v18.17.0
9.6.7
```

Se aparecer erro, reinicie o computador e tente novamente.

---

## 📥 PASSO 3: Instalar Git

### Windows

1. Acesse: **https://git-scm.com/**
2. Clique em **"Download for Windows"**
3. Abra o arquivo baixado
4. Clique em **"Next"** até terminar
5. ✅ Reinicie o computador

### Mac

Abra o Terminal e execute:

```bash
brew install git
```

### Linux

Abra o Terminal e execute:

```bash
sudo apt-get install git
```

---

## 📂 PASSO 4: Clonar o Projeto

1. **Abra o Terminal** (ou Prompt de Comando)
2. **Navegue para uma pasta** onde quer guardar o projeto:

```bash
# Exemplo: criar pasta na área de trabalho
cd Desktop
```

3. **Clone o projeto:**

```bash
git clone https://github.com/seu-usuario/lm-waiting-room-live.git
cd lm-waiting-room-live
```

> **Nota:** Se você não tiver o repositório no GitHub, peça o link do projeto.

---

## 📦 PASSO 5: Instalar Dependências

No Terminal, dentro da pasta do projeto, execute:

```bash
npm install
```

⏳ **Isso pode levar 3-5 minutos.** Aguarde até aparecer a mensagem:

```
added XXX packages
```

---

## 🗄️ PASSO 6: Configurar Banco de Dados

### Opção A: Usar Banco Local (Recomendado para Testes)

#### Windows

1. Baixe MySQL: **https://dev.mysql.com/downloads/mysql/**
2. Instale seguindo o instalador
3. Abra **MySQL Command Line Client** (procure no menu Iniciar)
4. Digite a senha (se pedida)
5. Execute:

```sql
CREATE DATABASE lm_waiting_room;
EXIT;
```

#### Mac

Abra o Terminal e execute:

```bash
brew install mysql
brew services start mysql
mysql -u root
```

Depois execute:

```sql
CREATE DATABASE lm_waiting_room;
EXIT;
```

#### Linux

Abra o Terminal e execute:

```bash
sudo apt-get install mysql-server
sudo systemctl start mysql
mysql -u root -p
```

Depois execute:

```sql
CREATE DATABASE lm_waiting_room;
EXIT;
```

---

### Opção B: Usar Banco Online (PlanetScale) - Mais Fácil

1. Acesse: **https://planetscale.com/**
2. Clique em **"Sign up"** e crie uma conta
3. Clique em **"Create a database"**
4. Escolha um nome (ex: `lm-waiting-room`)
5. Clique em **"Create database"**
6. Clique em **"Connect"**
7. Selecione **"Node.js"**
8. Copie a connection string (começa com `mysql://`)

---

## 🔐 PASSO 7: Criar Arquivo de Configuração

1. **Abra a pasta do projeto** no explorador de arquivos
2. **Crie um novo arquivo** chamado `.env.local`
3. **Abra com um editor de texto** (Bloco de Notas, VS Code, etc)
4. **Cole o conteúdo abaixo:**

```env
# Banco de Dados
DATABASE_URL="mysql://root:@localhost:3306/lm_waiting_room"

# Se usar PlanetScale, cole aqui:
# DATABASE_URL="mysql://seu_usuario:sua_senha@seu_host/lm_waiting_room"

# WhatsApp (opcional - deixe em branco por enquanto)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# API
API_URL="http://localhost:3000"
```

5. **Salve o arquivo**

> **Importante:** Se usar PlanetScale, substitua a primeira linha pela connection string copiada.

---

## 🚀 PASSO 8: Executar o Projeto

### Terminal 1 - Backend

1. Abra um **Terminal/Prompt de Comando**
2. Navegue para a pasta do projeto:

```bash
cd caminho/para/lm-waiting-room-live
```

3. Inicie o backend:

```bash
npm run dev:server
```

Você deve ver:

```
✓ Server running on http://localhost:3000
```

**Deixe este terminal aberto!**

---

### Terminal 2 - Frontend

1. Abra um **NOVO Terminal/Prompt de Comando**
2. Navegue para a pasta do projeto:

```bash
cd caminho/para/lm-waiting-room-live
```

3. Inicie o frontend:

```bash
npm run dev:web
```

Você deve ver:

```
✓ Local:   http://localhost:3000
```

O navegador deve abrir automaticamente. Se não abrir, acesse manualmente: **http://localhost:3000**

---

## 🎯 PASSO 9: Acessar as Diferentes Telas

Agora você pode acessar:

| Tela | URL | O que faz |
|------|-----|----------|
| **Admin** | `http://localhost:3000` | Criar e gerenciar atendimentos |
| **Live** | `http://localhost:3000/live` | Tela ao vivo (desktop) |
| **TV** | `http://localhost:3000/tv-display` | Tela para TV (landscape) |
| **Relatórios** | `http://localhost:3000/analytics` | Análise e exportar CSV |
| **Configurações** | `http://localhost:3000/settings` | Ajustes do sistema |

---

## 📺 PASSO 10: Usar em TV

### Se Tiver Computador Conectado à TV

1. Conecte o computador à TV via **HDMI**
2. Abra o navegador
3. Acesse: **http://localhost:3000/tv-display**
4. Pressione **F11** para tela cheia
5. A tela TV aparecerá em **landscape** com 4 colunas

### Se Tiver Outro Computador na Mesma Rede

1. No computador que está rodando o projeto, descubra seu IP:

**Windows:**
```bash
ipconfig
```

**Mac/Linux:**
```bash
ifconfig
```

Procure por algo como: `192.168.1.100`

2. No outro computador, abra o navegador e acesse:

```
http://192.168.1.100:3000/tv-display
```

---

## 🐛 TROUBLESHOOTING

### ❌ "Port 3000 is already in use"

Significa que a porta 3000 já está sendo usada. Feche outros programas ou use outra porta:

```bash
PORT=3001 npm run dev:web
```

Depois acesse: `http://localhost:3001`

---

### ❌ "Cannot connect to database"

1. Verifique se MySQL está rodando
2. Confirme as credenciais em `.env.local`
3. Teste a conexão:

```bash
mysql -u root -p
```

Se pedir senha e você não sabe, use: `password`

---

### ❌ "Module not found"

Limpe e reinstale:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

### ❌ "Tela TV não atualiza"

1. Pressione **F5** para recarregar
2. Abra o console do navegador: **F12**
3. Procure por mensagens de erro

---

## ✨ PRONTO!

Você agora tem o sistema rodando localmente! 

**Próximas ações:**

1. ✅ Criar alguns atendimentos no painel Admin
2. ✅ Ver em tempo real na tela Live
3. ✅ Conectar à TV e testar
4. ✅ Exportar relatórios em CSV

---

## 📞 Dúvidas?

Se tiver problemas:

1. Verifique os logs no Terminal (onde rodou `npm run dev:web`)
2. Abra o console do navegador: **F12**
3. Procure por mensagens de erro
4. Tente reiniciar o servidor

---

**Versão:** 1.0.0  
**Última atualização:** 2026-03-25

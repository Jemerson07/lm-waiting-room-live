# 🎨 Guia Visual: GitHub + Deploy Passo a Passo

Este guia mostra **exatamente onde clicar** com instruções visuais.

---

## 📌 Parte 1: GitHub Setup

### 1️⃣ Criar Repositório no GitHub

**URL**: https://github.com/new

```
┌─────────────────────────────────────────────────────┐
│ Create a new repository                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Repository name *                                   │
│ ┌─────────────────────────────────────────────────┐ │
│ │ lm-waiting-room-live                            │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Description (optional)                              │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Sistema de gerenciamento de sala de espera      │ │
│ │ veicular com painel admin e tela live           │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ○ Public  ● Private                                 │
│   ↑ ESCOLHA ISTO                                    │
│                                                     │
│ ☐ Initialize with README                            │
│ ☐ Add .gitignore                                    │
│ ☐ Choose a license                                 │
│                                                     │
│              [Create repository]                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2️⃣ Após Criar, Você Verá Esta Tela

```
┌─────────────────────────────────────────────────────┐
│ Quick setup — if you've done this kind of thing    │
│ before                                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│ HTTPS    SSH    GitHub CLI                          │
│  ↑ Clique aqui (padrão)                             │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ https://github.com/SEU_USER/lm-waiting-room... │ │
│ │ [Copy]                                          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ …or push an existing repository from the command   │
│ line                                                │
│                                                     │
│ git remote add origin https://github.com/...      │
│ git branch -M main                                 │
│ git push -u origin main                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3️⃣ Executar Comandos no Terminal

Abra o terminal e execute:

```bash
# Navegue até o projeto
cd ~/lm-waiting-room-live

# Remova o remote antigo
git remote remove origin

# Adicione o novo remote (copie do GitHub)
git remote add origin https://github.com/SEU_USERNAME/lm-waiting-room-live.git

# Renomeie a branch
git branch -M main

# Faça o primeiro push
git push -u origin main
```

**Resultado esperado:**
```
Enumerating objects: 150, done.
Counting objects: 100% (150/150), done.
Delta compression using up to 8 threads
Compressing objects: 100% (120/120), done.
Writing objects: 100% (150/150), 2.50 MiB | 500 KiB/s, done.
Total 150 (delta 50), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (50/50), done.
To https://github.com/SEU_USERNAME/lm-waiting-room-live.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

### 4️⃣ Verificar no GitHub

Acesse: `https://github.com/SEU_USERNAME/lm-waiting-room-live`

Você deve ver:
- ✅ Todos os arquivos do projeto
- ✅ Histórico de commits
- ✅ Documentação (README, DEPLOY_GUIDE, etc)

---

## 🗄️ Parte 2: Banco de Dados (PlanetScale)

### 1️⃣ Criar Conta

**URL**: https://planetscale.com

```
┌─────────────────────────────────────┐
│ Sign up with GitHub                 │
│ [GitHub Logo] Sign up with GitHub   │
└─────────────────────────────────────┘
```

Clique e autorize.

### 2️⃣ Criar Banco de Dados

Após login:

```
┌─────────────────────────────────────┐
│ [Create database] (botão azul)      │
└─────────────────────────────────────┘
```

Preencha:
```
Database name: lm-waiting-room
Region: São Paulo (ou mais próximo)
Plan: Free
```

Clique em **Create database**.

### 3️⃣ Obter Connection String

1. Clique no banco criado
2. Vá para aba **Passwords**
3. Clique em **New password**
4. Nome: `main`
5. Clique em **Create password**

Você verá:
```
mysql://user123:password123@aws.connect.psdb.cloud/lm-waiting-room?sslaccept=strict
```

**COPIE E GUARDE ESTA STRING!**

---

## 🚀 Parte 3: Deploy (Render)

### 1️⃣ Criar Conta

**URL**: https://render.com

```
┌─────────────────────────────────────┐
│ Sign up with GitHub                 │
│ [GitHub Logo] Sign up with GitHub   │
└─────────────────────────────────────┘
```

### 2️⃣ Conectar Repositório

Após login:

```
┌─────────────────────────────────────┐
│ [New +] (canto superior direito)    │
│   ↓                                 │
│ [Web Service]                       │
│   ↓                                 │
│ [Connect a repository]              │
└─────────────────────────────────────┘
```

Procure por `lm-waiting-room-live` e clique em **Connect**.

### 3️⃣ Configurar Deploy

Você verá um formulário:

```
┌─────────────────────────────────────────────────────┐
│ Name                                                │
│ ┌─────────────────────────────────────────────────┐ │
│ │ lm-waiting-room-live                            │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Environment                                         │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Node ▼                                          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Region                                              │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Ohio ▼                                          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Branch                                              │
│ ┌─────────────────────────────────────────────────┐ │
│ │ main ▼                                          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Build Command                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ pnpm install && pnpm build                      │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Start Command                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ pnpm start                                      │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Instance Type                                       │
│ ○ Free  ● Pro                                       │
│  ↑ ESCOLHA ISTO                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 4️⃣ Adicionar Variáveis de Ambiente

Clique em **Advanced** (abaixo do formulário):

```
┌─────────────────────────────────────────────────────┐
│ Advanced                                            │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Add Environment Variable                        │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Key                    │ Value                       │
│ ────────────────────────────────────────────────── │
│ DATABASE_URL           │ (cole do PlanetScale)      │
│ TWILIO_ACCOUNT_SID     │ seu_account_sid            │
│ TWILIO_AUTH_TOKEN      │ seu_auth_token             │
│ TWILIO_WHATSAPP_NUMBER │ whatsapp:+1234567890       │
│ VITE_APP_ID            │ seu_app_id                 │
│ JWT_SECRET             │ gere_string_aleatória      │
│ OAUTH_SERVER_URL       │ https://api.manus.im       │
│ OWNER_OPEN_ID          │ seu_owner_id               │
│ NODE_ENV               │ production                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5️⃣ Criar Web Service

Clique em **Create Web Service** (botão azul no final).

### 6️⃣ Aguardar Deploy

Você verá logs em tempo real:

```
┌─────────────────────────────────────────────────────┐
│ Build in progress...                                │
│                                                     │
│ [=====          ] 50%                               │
│                                                     │
│ Installing dependencies...                          │
│ Building application...                             │
│ Starting server...                                  │
│                                                     │
│ ✓ Deploy successful!                                │
│ URL: https://lm-waiting-room-live.onrender.com     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Pronto!** Seu app está no ar! 🎉

---

## 📱 Parte 4: Configurar WhatsApp

### 1️⃣ Criar Conta Twilio

**URL**: https://www.twilio.com/console

Faça sign up ou login.

### 2️⃣ Obter Credenciais

```
┌─────────────────────────────────────┐
│ Account Info                        │
│                                     │
│ Account SID                         │
│ ┌─────────────────────────────────┐ │
│ │ ACxxxxxxxxxxxxxxxxxxxxxxxx      │ │
│ │ [Copy]                          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Auth Token                          │
│ ┌─────────────────────────────────┐ │
│ │ ••••••••••••••••••••••••••••••• │ │
│ │ [Show] [Copy]                   │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**COPIE ambos!**

### 3️⃣ Configurar WhatsApp

1. Vá para **Messaging** → **Services**
2. Clique em **Create Messaging Service**
3. Escolha **WhatsApp**
4. Siga os passos para conectar sua conta WhatsApp
5. Copie o **WhatsApp Number**

### 4️⃣ Adicionar ao Render

1. Volte para Render
2. Clique no seu serviço
3. Vá para **Environment**
4. Clique em **Edit**
5. Atualize:
   - `TWILIO_ACCOUNT_SID` = seu Account SID
   - `TWILIO_AUTH_TOKEN` = seu Auth Token
   - `TWILIO_WHATSAPP_NUMBER` = seu WhatsApp Number

6. Clique em **Save**

Render fará redeploy automaticamente.

---

## ✅ Verificação Final

### Teste 1: Acessar Aplicação

Abra: `https://lm-waiting-room-live.onrender.com`

Você deve ver:
- ✅ Painel Administrativo
- ✅ Tela Live
- ✅ Configurações

### Teste 2: Criar Atendimento

1. Vá para **Admin**
2. Preencha o formulário
3. Clique em **Adicionar**
4. Verifique se aparece na lista

### Teste 3: WhatsApp

1. Crie um atendimento com um número de telefone
2. Mude o status
3. Verifique se recebeu mensagem no WhatsApp

---

## 🔄 Próximas Atualizações

Depois que tudo estiver configurado:

```bash
# Faça suas mudanças
# Commit e push
git add .
git commit -m "Descrição da mudança"
git push origin main

# Render detectará o push e fará deploy automaticamente
# Verifique os logs no painel
```

---

## 🆘 Problemas?

| Problema | Solução |
|----------|---------|
| Build falha | Verifique logs no Render |
| Database não conecta | Verifique DATABASE_URL |
| WhatsApp não funciona | Verifique credenciais Twilio |
| App fica lento | Considere upgrade do plano |

---

**Parabéns!** 🎉 Você tem um app em produção!

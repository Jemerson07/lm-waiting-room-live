# 🚀 Guia Completo: Deploy Gratuito do LM Sala de Espera Live

Este guia mostra como subir o projeto no GitHub e fazer deploy gratuito em produção.

---

## 📋 Índice

1. [Preparação Local](#preparação-local)
2. [Criar Repositório no GitHub](#criar-repositório-no-github)
3. [Configurar Banco de Dados Gratuito](#configurar-banco-de-dados-gratuito)
4. [Deploy Gratuito](#deploy-gratuito)
5. [Variáveis de Ambiente](#variáveis-de-ambiente)

---

## 1️⃣ Preparação Local

### Passo 1: Clonar ou Usar Projeto Existente

Se você já tem o projeto localmente, apenas certifique-se de que está limpo:

```bash
cd ~/lm-waiting-room-live
git status  # Deve estar limpo (nothing to commit)
```

### Passo 2: Criar Arquivo .env.local (LOCAL APENAS)

Este arquivo **NUNCA** deve ser commitado no Git:

```bash
cat > .env.local << 'EOF'
# Variáveis locais para desenvolvimento
DATABASE_URL=mysql://root:password@localhost:3306/lm_waiting_room
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
VITE_APP_ID=seu_app_id
JWT_SECRET=seu_jwt_secret_local
OAUTH_SERVER_URL=https://api.manus.im
OWNER_OPEN_ID=seu_owner_id
NODE_ENV=development
EOF
```

### Passo 3: Verificar .gitignore

Confirme que `.env.local` está no `.gitignore`:

```bash
grep "\.env" .gitignore
# Deve mostrar: .env*.local
```

---

## 2️⃣ Criar Repositório no GitHub

### Passo 1: Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Preencha os dados:
   - **Repository name**: `lm-waiting-room-live`
   - **Description**: `Sistema de gerenciamento e visualização em tempo real para sala de espera veicular`
   - **Visibility**: `Public` (para usar recursos gratuitos)
   - **Initialize**: Deixe desmarcado (já temos git local)

3. Clique em **Create repository**

### Passo 2: Adicionar Remote do GitHub

Após criar o repositório, você verá instruções. Execute:

```bash
cd ~/lm-waiting-room-live

# Remover remote antigo (Manus)
git remote remove origin

# Adicionar novo remote (GitHub)
git remote add origin https://github.com/SEU_USUARIO/lm-waiting-room-live.git

# Renomear branch se necessário
git branch -M main

# Fazer primeiro push
git push -u origin main
```

### Passo 3: Verificar no GitHub

Acesse `https://github.com/SEU_USUARIO/lm-waiting-room-live` e confirme que o código está lá.

---

## 3️⃣ Configurar Banco de Dados Gratuito

Você tem 3 opções gratuitas:

### Opção A: PlanetScale (Recomendado - MySQL 100% compatível)

**Vantagens:**
- 5GB de armazenamento gratuito
- MySQL 100% compatível
- Fácil de usar
- Suporta branches

**Passos:**

1. Acesse https://planetscale.com
2. Clique em **Sign up** (use GitHub para facilitar)
3. Crie uma organização
4. Clique em **Create database**
   - Name: `lm-waiting-room`
   - Region: Escolha a mais próxima
5. Clique em **Create database**

6. Na aba **Passwords**, clique em **Create password**
   - Escolha um nome (ex: `main`)
   - Clique em **Create password**

7. Copie a connection string (formato MySQL):
```
mysql://username:password@host/database
```

8. Guarde esta string para usar no deploy

### Opção B: Railway (Alternativa com Crédito Gratuito)

**Vantagens:**
- $5 de crédito gratuito por mês
- Interface simples
- Suporta múltiplos bancos

**Passos:**

1. Acesse https://railway.app
2. Clique em **Start Project**
3. Selecione **MySQL**
4. Clique em **Deploy**
5. Na aba **Variables**, copie `DATABASE_URL`

### Opção C: Render (Com Limitações)

**Vantagens:**
- Gratuito com limitações
- Fácil integração

**Desvantagens:**
- Banco dorme após 15 min de inatividade
- Menos recursos

---

## 4️⃣ Deploy Gratuito

### Opção A: Render (Recomendado para Iniciantes)

**Passo 1: Criar Conta**
1. Acesse https://render.com
2. Clique em **Sign up** (use GitHub)
3. Autorize a conexão

**Passo 2: Conectar Repositório**
1. Clique em **New +** → **Web Service**
2. Clique em **Connect a repository**
3. Selecione `lm-waiting-room-live`
4. Clique em **Connect**

**Passo 3: Configurar Deploy**
1. Preencha os dados:
   - **Name**: `lm-waiting-room-live`
   - **Environment**: `Node`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Instance Type**: `Free`

2. Clique em **Advanced** e adicione variáveis de ambiente:

```
DATABASE_URL=mysql://user:pass@host/db
TWILIO_ACCOUNT_SID=seu_sid
TWILIO_AUTH_TOKEN=seu_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
VITE_APP_ID=seu_app_id
JWT_SECRET=seu_jwt_secret
OAUTH_SERVER_URL=https://api.manus.im
OWNER_OPEN_ID=seu_owner_id
NODE_ENV=production
```

3. Clique em **Create Web Service**

**Passo 4: Aguardar Deploy**
- Render fará o build automaticamente
- Você receberá uma URL: `https://lm-waiting-room-live.onrender.com`

### Opção B: Railway (Mais Recursos Gratuitos)

**Passo 1: Criar Projeto**
1. Acesse https://railway.app
2. Clique em **New Project**
3. Selecione **Deploy from GitHub repo**
4. Autorize e selecione `lm-waiting-room-live`

**Passo 2: Configurar Variáveis**
1. Clique em **Variables**
2. Adicione todas as variáveis de ambiente
3. Clique em **Deploy**

**Passo 3: Obter URL**
- Railway gerará uma URL automaticamente
- Você pode customizar em **Settings** → **Domain**

---

## 5️⃣ Variáveis de Ambiente

### Obter Credenciais Twilio (WhatsApp)

1. Acesse https://www.twilio.com/console
2. Faça login ou crie conta
3. Na seção **Account Info**, copie:
   - **Account SID**
   - **Auth Token**

4. Vá para **Messaging** → **Services**
5. Crie um novo serviço WhatsApp
6. Copie o **WhatsApp Number**

### Configurar no Deploy

Adicione as variáveis no painel do seu serviço de deploy:

```
DATABASE_URL=mysql://user:pass@host/db
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
VITE_APP_ID=seu_app_id
JWT_SECRET=gere_uma_string_aleatória_segura
OAUTH_SERVER_URL=https://api.manus.im
OWNER_OPEN_ID=seu_owner_id
NODE_ENV=production
```

---

## 🔄 Fluxo de Atualização

Após fazer mudanças no código:

```bash
# 1. Fazer commit
git add .
git commit -m "Descrição da mudança"

# 2. Push para GitHub
git push origin main

# 3. Deploy automático
# Render/Railway detectarão o push e farão deploy automaticamente
```

---

## ✅ Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Código feito push para GitHub
- [ ] Banco de dados criado (PlanetScale/Railway)
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado (Render/Railway)
- [ ] URL de produção funcionando
- [ ] WhatsApp configurado e testado

---

## 🆘 Troubleshooting

### Erro: "DATABASE_URL não configurada"
- Verifique se adicionou a variável no painel do deploy
- Reinicie o serviço após adicionar

### Erro: "Cannot connect to database"
- Verifique se a connection string está correta
- Confirme que o banco está rodando
- Teste a conexão localmente

### Deploy falha na build
- Verifique os logs no painel
- Confirme que `pnpm install` funciona localmente
- Verifique se há erros de TypeScript

### WhatsApp não envia mensagens
- Verifique credenciais Twilio
- Confirme que o número está no formato correto
- Teste via console Twilio

---

## 📚 Recursos Úteis

- [GitHub Docs](https://docs.github.com)
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)
- [PlanetScale Docs](https://planetscale.com/docs)
- [Twilio WhatsApp](https://www.twilio.com/whatsapp)

---

**Dúvidas?** Consulte a documentação oficial dos serviços ou abra uma issue no GitHub!

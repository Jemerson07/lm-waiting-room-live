# 📚 Guia Passo a Passo: GitHub + Deploy Gratuito

Este é um guia **super detalhado** para você que está começando com GitHub e deploy.

---

## 🎯 O que você vai fazer

1. ✅ Criar conta no GitHub (se não tiver)
2. ✅ Criar um repositório
3. ✅ Fazer upload do código
4. ✅ Configurar banco de dados gratuito
5. ✅ Fazer deploy gratuito
6. ✅ Configurar WhatsApp

**Tempo estimado**: 30-45 minutos

---

## 📖 Parte 1: GitHub (15 minutos)

### Passo 1.1: Criar Conta no GitHub

Se você **NÃO** tem conta no GitHub:

1. Abra https://github.com
2. Clique em **Sign up** (canto superior direito)
3. Preencha:
   - Email
   - Senha
   - Username (seu nome de usuário)
4. Clique em **Create account**
5. Verifique seu email
6. Pronto! Você tem uma conta GitHub

Se você **JÁ** tem conta, apenas faça login.

### Passo 1.2: Criar Repositório

1. Após fazer login, clique no **+** (canto superior direito)
2. Clique em **New repository**
3. Preencha:
   - **Repository name**: `lm-waiting-room-live`
   - **Description**: `Sistema de gerenciamento de sala de espera veicular`
   - **Visibility**: Selecione **Public** (importante para usar recursos gratuitos)
   - **Initialize this repository with**: Deixe desmarcado

4. Clique em **Create repository**

### Passo 1.3: Fazer Upload do Código

Você verá uma página com instruções. Abra o terminal no seu computador e execute:

```bash
# Navegue até a pasta do projeto
cd ~/lm-waiting-room-live

# Remova o remote antigo
git remote remove origin

# Adicione o novo remote (copie do GitHub)
git remote add origin https://github.com/SEU_USERNAME/lm-waiting-room-live.git

# Renomeie a branch (se necessário)
git branch -M main

# Faça o primeiro push
git push -u origin main
```

**Pronto!** Seu código está no GitHub. Acesse https://github.com/SEU_USERNAME/lm-waiting-room-live para ver.

---

## 🗄️ Parte 2: Banco de Dados Gratuito (10 minutos)

### Opção A: PlanetScale (RECOMENDADO)

**Por que PlanetScale?**
- ✅ MySQL 100% compatível
- ✅ 5GB gratuito
- ✅ Muito fácil de usar
- ✅ Perfeito para começar

#### Passo 2A.1: Criar Conta

1. Abra https://planetscale.com
2. Clique em **Sign up**
3. Escolha **Sign up with GitHub** (mais fácil)
4. Autorize a conexão
5. Preencha seu nome e crie a organização

#### Passo 2A.2: Criar Banco de Dados

1. Clique em **Create a database**
2. Preencha:
   - **Name**: `lm-waiting-room`
   - **Region**: Escolha a mais próxima (ex: São Paulo)
   - **Plan**: `Free` (padrão)
3. Clique em **Create database**

#### Passo 2A.3: Obter Connection String

1. Clique no banco que acabou de criar
2. Vá para a aba **Passwords**
3. Clique em **New password**
4. Escolha um nome (ex: `main`)
5. Clique em **Create password**
6. **COPIE** a string que aparece (formato MySQL)

Exemplo:
```
mysql://user123:password123@aws.connect.psdb.cloud/lm-waiting-room?sslaccept=strict
```

**GUARDE ESTA STRING!** Você vai precisar dela no deploy.

---

### Opção B: Railway (Alternativa)

Se preferir Railway:

1. Acesse https://railway.app
2. Clique em **Start a New Project**
3. Clique em **Provision MySQL**
4. Clique em **Deploy**
5. Vá para a aba **Variables**
6. Copie o valor de `DATABASE_URL`

---

## 🚀 Parte 3: Deploy Gratuito (15 minutos)

### Opção A: Render (RECOMENDADO para Iniciantes)

**Por que Render?**
- ✅ Muito fácil de usar
- ✅ Deploy automático do GitHub
- ✅ Gratuito
- ✅ Suporta Node.js

#### Passo 3A.1: Criar Conta

1. Abra https://render.com
2. Clique em **Sign up**
3. Escolha **Sign up with GitHub**
4. Autorize a conexão

#### Passo 3A.2: Conectar Repositório

1. Clique em **New +** (canto superior direito)
2. Clique em **Web Service**
3. Clique em **Connect a repository**
4. Procure por `lm-waiting-room-live`
5. Clique em **Connect**

#### Passo 3A.3: Configurar Deploy

Você verá um formulário. Preencha:

```
Name: lm-waiting-room-live
Environment: Node
Region: Ohio (ou mais próximo)
Branch: main
Build Command: pnpm install && pnpm build
Start Command: pnpm start
Instance Type: Free
```

#### Passo 3A.4: Adicionar Variáveis de Ambiente

1. Clique em **Advanced** (abaixo do formulário)
2. Clique em **Add Environment Variable**
3. Adicione cada variável:

```
DATABASE_URL = (cole a string do PlanetScale)
TWILIO_ACCOUNT_SID = seu_account_sid
TWILIO_AUTH_TOKEN = seu_auth_token
TWILIO_WHATSAPP_NUMBER = whatsapp:+1234567890
VITE_APP_ID = seu_app_id
JWT_SECRET = gere_uma_string_aleatória_segura
OAUTH_SERVER_URL = https://api.manus.im
OWNER_OPEN_ID = seu_owner_id
NODE_ENV = production
```

4. Clique em **Create Web Service**

#### Passo 3A.5: Aguardar Deploy

- Render começará a fazer o build
- Você verá logs em tempo real
- Quando terminar, você receberá uma URL como: `https://lm-waiting-room-live.onrender.com`

**Pronto!** Seu app está no ar! 🎉

---

### Opção B: Railway (Mais Recursos)

Se preferir Railway:

1. Acesse https://railway.app
2. Clique em **New Project**
3. Clique em **Deploy from GitHub repo**
4. Selecione `lm-waiting-room-live`
5. Clique em **Deploy**
6. Adicione as variáveis de ambiente
7. Railway fará o deploy automaticamente

---

## 📱 Parte 4: Configurar WhatsApp (10 minutos)

### Passo 4.1: Criar Conta Twilio

1. Abra https://www.twilio.com/console
2. Clique em **Sign up** ou faça login
3. Preencha seus dados
4. Verifique seu email

### Passo 4.2: Obter Credenciais

1. No console, vá para **Account Info**
2. Copie:
   - **Account SID**
   - **Auth Token**

3. Vá para **Messaging** → **Services**
4. Clique em **Create Messaging Service**
5. Escolha **WhatsApp**
6. Siga os passos para conectar sua conta WhatsApp
7. Copie o **WhatsApp Number** (formato: `whatsapp:+1234567890`)

### Passo 4.3: Adicionar ao Deploy

1. Volte para Render (ou Railway)
2. Vá para **Environment**
3. Atualize as variáveis:
   - `TWILIO_ACCOUNT_SID` = seu Account SID
   - `TWILIO_AUTH_TOKEN` = seu Auth Token
   - `TWILIO_WHATSAPP_NUMBER` = seu WhatsApp Number

4. Clique em **Save** ou **Deploy**

**Pronto!** WhatsApp está configurado! 📱

---

## ✅ Checklist Final

- [ ] Conta GitHub criada
- [ ] Repositório criado
- [ ] Código feito push
- [ ] Banco de dados criado (PlanetScale/Railway)
- [ ] Conta Render criada
- [ ] Deploy realizado
- [ ] URL de produção funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Twilio configurado
- [ ] WhatsApp testado

---

## 🔄 Próximas Vezes (Muito Mais Rápido!)

Depois que tudo estiver configurado, para fazer atualizações:

```bash
# 1. Faça suas mudanças no código
# 2. Commit e push
git add .
git commit -m "Descrição da mudança"
git push origin main

# 3. Render/Railway detectarão o push e farão deploy automaticamente
# Você verá os logs em tempo real no painel
```

---

## 🆘 Problemas Comuns

### Erro: "Build failed"
- Verifique os logs no painel
- Confirme que `pnpm install` funciona localmente
- Verifique se há erros de TypeScript

### Erro: "Cannot connect to database"
- Verifique se a `DATABASE_URL` está correta
- Confirme que copiou a string inteira
- Teste a conexão localmente

### WhatsApp não envia mensagens
- Verifique as credenciais Twilio
- Confirme que o número está no formato correto
- Teste via console Twilio

### Aplicação fica lenta
- Pode ser o banco dorme (Railway)
- Considere usar PlanetScale
- Ou upgrade para plano pago

---

## 📚 Recursos Úteis

- [GitHub Docs](https://docs.github.com) - Documentação oficial
- [Render Docs](https://render.com/docs) - Como usar Render
- [PlanetScale Docs](https://planetscale.com/docs) - Como usar PlanetScale
- [Twilio Docs](https://www.twilio.com/docs) - Integração WhatsApp

---

## 💡 Dicas Importantes

1. **Nunca commite secrets**: Sempre use variáveis de ambiente
2. **Faça commits frequentes**: Facilita rastrear mudanças
3. **Teste localmente primeiro**: Antes de fazer push
4. **Leia os logs**: Eles mostram o que está acontecendo
5. **Use GitHub Issues**: Para rastrear bugs e features

---

**Parabéns!** 🎉 Você agora tem um app em produção!

Se tiver dúvidas, consulte a documentação oficial dos serviços ou abra uma issue no GitHub.

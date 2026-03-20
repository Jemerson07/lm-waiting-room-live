# 🚀 Guia Completo: Do GitHub ao Deploy Gratuito

**LM Sala de Espera Live** — Sistema de gerenciamento e visualização em tempo real para sala de espera veicular

---

## 📋 Sumário Executivo

Este documento fornece instruções passo a passo para:

1. Criar repositório no GitHub
2. Fazer upload do código
3. Configurar banco de dados MySQL gratuito
4. Fazer deploy em produção (gratuito)
5. Configurar integração WhatsApp

**Tempo total**: 45-60 minutos  
**Custo**: $0 (totalmente gratuito)  
**Conhecimento necessário**: Nenhum (guia para iniciantes)

---

## 🎯 Arquitetura da Solução

O sistema funciona da seguinte forma:

```
┌─────────────────────────────────────────────────────────────┐
│                    Seu Navegador                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Admin Panel | Live Display | Settings | Reports     │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬──────────────────────────────────────────────┘
                 │ HTTPS
                 ↓
┌─────────────────────────────────────────────────────────────┐
│              Render (Deploy Gratuito)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Node.js Server (Express + tRPC)                      │   │
│  │ - Gerencia atendimentos                              │   │
│  │ - Envia mensagens WhatsApp                           │   │
│  │ - Sincroniza dados em tempo real                     │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬──────────────────────────────────────────────┘
                 │ TCP/IP
                 ↓
┌─────────────────────────────────────────────────────────────┐
│           PlanetScale (Banco de Dados Gratuito)              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ MySQL Database                                       │   │
│  │ - Tabela: attendances (atendimentos)                │   │
│  │ - Tabela: serviceTypes (tipos de serviço)           │   │
│  │ - Tabela: settings (configurações)                  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬──────────────────────────────────────────────┘
                 │ HTTPS
                 ↓
┌─────────────────────────────────────────────────────────────┐
│            Twilio (WhatsApp - Opcional)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Envia notificações via WhatsApp                      │   │
│  │ - Chegada: "Seu veículo chegou!"                     │   │
│  │ - Aguardando: "Estamos preparando..."                │   │
│  │ - Em Manutenção: "Seu veículo está sendo atendido"   │   │
│  │ - Finalizado: "Atendimento concluído!"               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Índice Detalhado

| Seção | Tempo | Dificuldade |
|-------|-------|------------|
| [Parte 1: GitHub Setup](#parte-1-github-setup) | 15 min | ⭐ Fácil |
| [Parte 2: Banco de Dados](#parte-2-banco-de-dados-planetscale) | 10 min | ⭐ Fácil |
| [Parte 3: Deploy Render](#parte-3-deploy-gratuito-render) | 15 min | ⭐ Fácil |
| [Parte 4: WhatsApp](#parte-4-integração-whatsapp) | 10 min | ⭐ Fácil |
| [Parte 5: Testes](#parte-5-testes-e-validação) | 5 min | ⭐ Fácil |

---

## ✅ Parte 1: GitHub Setup

### 1.1 Criar Conta GitHub (se não tiver)

**URL**: https://github.com

1. Clique em **Sign up** (canto superior direito)
2. Preencha:
   - **Email**: seu email
   - **Password**: senha segura
   - **Username**: seu nome de usuário (ex: `seu-nome`)
3. Clique em **Create account**
4. Verifique seu email
5. **Pronto!** Você tem uma conta GitHub

### 1.2 Criar Repositório

**URL**: https://github.com/new

Preencha o formulário:

| Campo | Valor |
|-------|-------|
| **Repository name** | `lm-waiting-room-live` |
| **Description** | `Sistema de gerenciamento de sala de espera veicular` |
| **Visibility** | **Public** ⚠️ (importante para recursos gratuitos) |
| **Initialize** | Deixe desmarcado |

Clique em **Create repository**.

### 1.3 Fazer Upload do Código

Abra o terminal no seu computador e execute:

```bash
# Navegue até o projeto
cd ~/lm-waiting-room-live

# Remova o remote antigo
git remote remove origin

# Adicione o novo remote
# Substitua SEU_USERNAME pelo seu usuário GitHub
git remote add origin https://github.com/SEU_USERNAME/lm-waiting-room-live.git

# Renomeie a branch
git branch -M main

# Faça o primeiro push
git push -u origin main
```

**Resultado esperado:**
```
Enumerating objects: 150, done.
...
To https://github.com/SEU_USERNAME/lm-waiting-room-live.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

### 1.4 Verificar no GitHub

Acesse: `https://github.com/SEU_USERNAME/lm-waiting-room-live`

Você deve ver:
- ✅ Todos os arquivos do projeto
- ✅ Histórico de commits
- ✅ Documentação (README, DEPLOY_GUIDE, etc)

---

## 🗄️ Parte 2: Banco de Dados (PlanetScale)

### 2.1 Por que PlanetScale?

| Aspecto | PlanetScale | Railway | Render |
|--------|------------|---------|--------|
| **Tipo** | MySQL | MySQL/PostgreSQL | Qualquer |
| **Gratuito** | 5GB | $5/mês crédito | Limitado |
| **Facilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Performance** | Excelente | Boa | Boa |
| **Recomendação** | ✅ MELHOR | Alternativa | Última opção |

### 2.2 Criar Conta PlanetScale

**URL**: https://planetscale.com

1. Clique em **Sign up**
2. Escolha **Sign up with GitHub** (mais fácil)
3. Autorize a conexão
4. Preencha seu nome
5. **Pronto!** Você tem uma conta

### 2.3 Criar Banco de Dados

1. Clique em **Create a database**
2. Preencha:
   - **Name**: `lm-waiting-room`
   - **Region**: Escolha a mais próxima (ex: São Paulo)
   - **Plan**: `Free` (padrão)
3. Clique em **Create database**

### 2.4 Obter Connection String

1. Clique no banco que acabou de criar
2. Vá para a aba **Passwords**
3. Clique em **New password**
4. Escolha um nome: `main`
5. Clique em **Create password**

Você verá a connection string:

```
mysql://user123:password123@aws.connect.psdb.cloud/lm-waiting-room?sslaccept=strict
```

**⚠️ IMPORTANTE**: Copie e guarde esta string! Você vai precisar dela no próximo passo.

---

## 🚀 Parte 3: Deploy Gratuito (Render)

### 3.1 Por que Render?

- ✅ Totalmente gratuito
- ✅ Deploy automático do GitHub
- ✅ Muito fácil de usar
- ✅ Suporta Node.js (nossa stack)
- ✅ Logs em tempo real

### 3.2 Criar Conta Render

**URL**: https://render.com

1. Clique em **Sign up**
2. Escolha **Sign up with GitHub**
3. Autorize a conexão

### 3.3 Conectar Repositório

1. Clique em **New +** (canto superior direito)
2. Clique em **Web Service**
3. Clique em **Connect a repository**
4. Procure por `lm-waiting-room-live`
5. Clique em **Connect**

### 3.4 Configurar Deploy

Você verá um formulário. Preencha assim:

| Campo | Valor |
|-------|-------|
| **Name** | `lm-waiting-room-live` |
| **Environment** | `Node` |
| **Region** | `Ohio` (ou mais próximo) |
| **Branch** | `main` |
| **Build Command** | `pnpm install && pnpm build` |
| **Start Command** | `pnpm start` |
| **Instance Type** | `Free` ⭐ |

### 3.5 Adicionar Variáveis de Ambiente

Clique em **Advanced** (abaixo do formulário).

Clique em **Add Environment Variable** para cada uma:

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

### 3.6 Criar Web Service

Clique em **Create Web Service** (botão azul).

### 3.7 Aguardar Deploy

Você verá logs em tempo real:

```
Building...
[=====          ] 50%

Installing dependencies...
Building application...
Starting server...

✓ Deploy successful!
URL: https://lm-waiting-room-live.onrender.com
```

**Pronto!** Seu app está no ar! 🎉

---

## 📱 Parte 4: Integração WhatsApp

### 4.1 Criar Conta Twilio

**URL**: https://www.twilio.com/console

1. Clique em **Sign up** ou faça login
2. Preencha seus dados
3. Verifique seu email

### 4.2 Obter Credenciais

1. No console, vá para **Account Info**
2. Copie:
   - **Account SID**
   - **Auth Token**

### 4.3 Configurar WhatsApp

1. Vá para **Messaging** → **Services**
2. Clique em **Create Messaging Service**
3. Escolha **WhatsApp**
4. Siga os passos para conectar sua conta WhatsApp
5. Copie o **WhatsApp Number** (formato: `whatsapp:+1234567890`)

### 4.4 Adicionar ao Render

1. Volte para Render
2. Clique no seu serviço (`lm-waiting-room-live`)
3. Vá para **Environment**
4. Clique em **Edit**
5. Atualize:
   - `TWILIO_ACCOUNT_SID` = seu Account SID
   - `TWILIO_AUTH_TOKEN` = seu Auth Token
   - `TWILIO_WHATSAPP_NUMBER` = seu WhatsApp Number

6. Clique em **Save**

Render fará redeploy automaticamente (2-3 minutos).

---

## ✅ Parte 5: Testes e Validação

### 5.1 Teste 1: Acessar Aplicação

Abra: `https://lm-waiting-room-live.onrender.com`

Você deve ver:
- ✅ Painel Administrativo
- ✅ Tela Live
- ✅ Configurações
- ✅ Relatórios

### 5.2 Teste 2: Criar Atendimento

1. Vá para **Admin**
2. Preencha o formulário:
   - Placa: `ABC1234`
   - Cliente: `João Silva`
   - Telefone: `11987654321`
   - Tipo: `Pneu`
   - Status: `Chegada`
3. Clique em **Adicionar**
4. Verifique se aparece na lista

### 5.3 Teste 3: Mudar Status

1. Clique em **Aguardando** (botão azul)
2. Verifique se muda de status
3. Se WhatsApp estiver configurado, você receberá uma mensagem

### 5.4 Teste 4: Tela Live

1. Clique em **Live** (aba inferior)
2. Verifique se o atendimento aparece
3. Teste o pull-to-refresh (puxar para baixo)

---

## 🔄 Fluxo de Atualização

Depois que tudo estiver configurado, para fazer atualizações:

```bash
# 1. Faça suas mudanças no código
# (edite os arquivos que quiser)

# 2. Commit e push
git add .
git commit -m "Descrição da mudança"
git push origin main

# 3. Render detectará o push e fará deploy automaticamente
# Verifique os logs no painel do Render
```

---

## 📊 Variáveis de Ambiente Explicadas

| Variável | O que é | Onde obter |
|----------|---------|-----------|
| `DATABASE_URL` | Connection string MySQL | PlanetScale → Passwords |
| `TWILIO_ACCOUNT_SID` | ID da conta Twilio | Twilio Console → Account Info |
| `TWILIO_AUTH_TOKEN` | Token de autenticação Twilio | Twilio Console → Account Info |
| `TWILIO_WHATSAPP_NUMBER` | Número WhatsApp Twilio | Twilio Console → Messaging Services |
| `VITE_APP_ID` | ID único da aplicação | Manus Dashboard |
| `JWT_SECRET` | Chave secreta para tokens | Gere uma string aleatória |
| `OAUTH_SERVER_URL` | URL do servidor OAuth | `https://api.manus.im` |
| `OWNER_OPEN_ID` | ID do proprietário | Manus Dashboard |
| `NODE_ENV` | Ambiente | `production` |

---

## 🆘 Troubleshooting

### Problema: "Build failed"

**Solução:**
1. Verifique os logs no painel Render
2. Confirme que `pnpm install` funciona localmente
3. Verifique se há erros de TypeScript: `pnpm check`

### Problema: "Cannot connect to database"

**Solução:**
1. Verifique se a `DATABASE_URL` está correta
2. Confirme que copiou a string inteira do PlanetScale
3. Teste a conexão localmente com a string
4. Verifique se o banco está rodando

### Problema: "WhatsApp não envia mensagens"

**Solução:**
1. Verifique as credenciais Twilio
2. Confirme que o número está no formato correto: `whatsapp:+5511987654321`
3. Teste via console Twilio
4. Verifique se a conta Twilio está ativa

### Problema: "Aplicação fica lenta"

**Solução:**
1. Pode ser o banco dorme (se usar Railway)
2. Considere usar PlanetScale (recomendado)
3. Ou upgrade para plano pago do Render

---

## 📚 Recursos Úteis

| Recurso | URL |
|---------|-----|
| GitHub Docs | https://docs.github.com |
| Render Docs | https://render.com/docs |
| PlanetScale Docs | https://planetscale.com/docs |
| Twilio WhatsApp | https://www.twilio.com/whatsapp |
| Node.js Docs | https://nodejs.org/docs |

---

## 🎓 Próximos Passos

Após fazer o deploy:

1. **Teste em produção**: Acesse a URL e teste todas as funcionalidades
2. **Configure alertas**: Render pode enviar notificações de erro
3. **Monitore performance**: Verifique logs regularmente
4. **Faça backups**: Exporte dados do PlanetScale periodicamente
5. **Implemente melhorias**: Adicione novos recursos conforme necessário

---

## 📋 Checklist Final

- [ ] Conta GitHub criada
- [ ] Repositório criado
- [ ] Código feito push para GitHub
- [ ] Conta PlanetScale criada
- [ ] Banco de dados criado
- [ ] Connection string copiada
- [ ] Conta Render criada
- [ ] Repositório conectado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] URL de produção funcionando
- [ ] Conta Twilio criada (opcional)
- [ ] WhatsApp configurado (opcional)
- [ ] Teste 1: Acessar aplicação ✅
- [ ] Teste 2: Criar atendimento ✅
- [ ] Teste 3: Mudar status ✅
- [ ] Teste 4: Tela Live ✅

---

## 💡 Dicas Importantes

1. **Nunca commite secrets**: Sempre use variáveis de ambiente
2. **Faça commits frequentes**: Facilita rastrear mudanças
3. **Teste localmente primeiro**: Antes de fazer push
4. **Leia os logs**: Eles mostram o que está acontecendo
5. **Use GitHub Issues**: Para rastrear bugs e features
6. **Mantenha backups**: Exporte dados regularmente
7. **Atualize dependências**: Regularmente, mas com cuidado

---

## 🎉 Parabéns!

Você agora tem um app em produção! 🚀

**O que você conseguiu:**
- ✅ Código no GitHub (versionado e compartilhável)
- ✅ Banco de dados em nuvem (5GB gratuito)
- ✅ App rodando em produção (URL pública)
- ✅ Integração WhatsApp (notificações automáticas)
- ✅ Deploy automático (push → produção)

**Próximo?** Compartilhe a URL com seus clientes e comece a usar!

---

**Versão**: 1.0.0  
**Última atualização**: Março 2026  
**Autor**: Manus AI

---

## 📞 Suporte

Se tiver dúvidas:

1. Consulte a documentação oficial dos serviços
2. Abra uma issue no GitHub
3. Verifique os logs no painel do Render
4. Leia a seção de Troubleshooting acima

Boa sorte! 🍀

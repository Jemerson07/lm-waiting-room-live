# 🖥️ Guia de Instalação Desktop - LM Sala de Espera

## Instalação Rápida (Windows, Mac, Linux)

### 1️⃣ Pré-requisitos

- **Node.js 18+** — [Download aqui](https://nodejs.org/)
- **Git** — [Download aqui](https://git-scm.com/)
- **Navegador moderno** — Chrome, Firefox, Safari ou Edge

### 2️⃣ Clonar o Projeto

```bash
git clone https://github.com/seu-usuario/lm-waiting-room-live.git
cd lm-waiting-room-live
```

### 3️⃣ Instalar Dependências

```bash
npm install
```

Ou com Yarn:
```bash
yarn install
```

### 4️⃣ Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL="mysql://usuario:senha@localhost:3306/lm_waiting_room"

# WhatsApp (opcional)
TWILIO_ACCOUNT_SID="seu_account_sid"
TWILIO_AUTH_TOKEN="seu_auth_token"
TWILIO_PHONE_NUMBER="+5511999999999"

# API
API_URL="http://localhost:3000"
```

### 5️⃣ Iniciar o Servidor

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend Web:**
```bash
npm run dev:web
```

O sistema abrirá automaticamente em `http://localhost:3000`

---

## 🎯 Acessar as Diferentes Telas

| Tela | URL | Descrição |
|------|-----|-----------|
| **Admin** | `http://localhost:3000` | Painel administrativo para gerenciar atendimentos |
| **Live** | `http://localhost:3000/live` | Tela ao vivo com atendimentos (desktop) |
| **TV Display** | `http://localhost:3000/tv-display` | Tela para TV (landscape, 30 atendimentos) |
| **Relatórios** | `http://localhost:3000/analytics` | Análise e exportação em CSV |
| **Configurações** | `http://localhost:3000/settings` | Ajustes do sistema |

---

## 📺 Configurar para TV

### Opção 1: Computador Conectado à TV

1. Conecte um computador à TV via HDMI
2. Abra o navegador em tela cheia (F11)
3. Acesse: `http://localhost:3000/tv-display`
4. Pressione F11 para ativar tela cheia

### Opção 2: Raspberry Pi / Smart TV

Se sua TV suporta navegador web:

1. Abra o navegador da TV
2. Digite: `http://seu-ip-do-computador:3000/tv-display`
3. A tela será exibida automaticamente em landscape

### Opção 3: Chromecast / Miracast

1. Inicie o servidor no computador
2. Use Chromecast para espelhar a tela
3. Abra `http://localhost:3000/tv-display`

---

## 🗄️ Banco de Dados

### MySQL Local (Recomendado para Testes)

**Windows:**
```bash
# Instalar MySQL
# https://dev.mysql.com/downloads/mysql/

# Criar banco de dados
mysql -u root -p
CREATE DATABASE lm_waiting_room;
```

**Mac:**
```bash
# Instalar com Homebrew
brew install mysql

# Iniciar serviço
brew services start mysql

# Criar banco de dados
mysql -u root
CREATE DATABASE lm_waiting_room;
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install mysql-server

# Iniciar serviço
sudo systemctl start mysql

# Criar banco de dados
mysql -u root -p
CREATE DATABASE lm_waiting_room;
```

### Usar Banco de Dados Online (PlanetScale)

1. Crie conta em [PlanetScale](https://planetscale.com/)
2. Crie um novo banco de dados
3. Copie a connection string
4. Adicione em `.env.local`:

```env
DATABASE_URL="mysql://seu_usuario:sua_senha@seu_host/lm_waiting_room"
```

---

## 🚀 Executar Migrações

```bash
npm run db:migrate
```

---

## 📱 Usar em Múltiplos Dispositivos

### Na Mesma Rede Local

1. Descubra o IP do seu computador:

**Windows:**
```bash
ipconfig
```

**Mac/Linux:**
```bash
ifconfig
```

2. Em outro dispositivo, acesse:
```
http://seu-ip:3000
```

Exemplo: `http://192.168.1.100:3000`

---

## 🐛 Troubleshooting

### Erro: "Port 3000 is already in use"

```bash
# Mudar porta
PORT=3001 npm run dev:web
```

### Erro: "Cannot connect to database"

1. Verifique se MySQL está rodando
2. Confirme as credenciais em `.env.local`
3. Teste a conexão:

```bash
mysql -u usuario -p -h localhost
```

### Erro: "Module not found"

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Tela TV não atualiza

1. Verifique a conexão de rede
2. Abra o console do navegador (F12)
3. Procure por erros de API

---

## 📊 Usar Relatórios

1. Acesse: `http://localhost:3000/analytics`
2. Clique em um dos botões de exportação:
   - **Atendimentos** — Lista completa em CSV
   - **Produtividade** — Métricas de desempenho
   - **Serviços** — Análise por tipo

---

## 🔧 Desenvolvimento

### Estrutura do Projeto

```
lm-waiting-room-live/
├── app/                    # Páginas e rotas
│   ├── (tabs)/            # Navegação com abas
│   ├── tv-display.tsx     # Tela para TV
│   └── modal.tsx          # Modais
├── components/            # Componentes reutilizáveis
├── lib/                   # Funções utilitárias
├── server/                # Backend (API)
├── drizzle/               # Banco de dados
└── public/                # Assets estáticos
```

### Adicionar Nova Página

1. Crie arquivo em `app/nova-pagina.tsx`
2. Exporte componente padrão
3. Acesse em `http://localhost:3000/nova-pagina`

---

## 📝 Logs e Debug

### Ver logs do servidor

```bash
npm run dev:server
```

### Ver logs do navegador

1. Pressione F12
2. Abra a aba "Console"
3. Procure por mensagens de erro

---

## 🎓 Próximos Passos

- [ ] Configurar notificações WhatsApp
- [ ] Adicionar câmeras RTSP
- [ ] Criar dashboard com gráficos
- [ ] Implementar autenticação
- [ ] Deploy em produção

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs (F12 no navegador)
2. Confirme as variáveis de ambiente
3. Reinicie o servidor
4. Limpe o cache do navegador (Ctrl+Shift+Del)

---

**Versão:** 1.0.0  
**Última atualização:** 2026-03-25  
**Licença:** MIT

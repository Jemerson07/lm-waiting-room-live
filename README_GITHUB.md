# 🚗 LM Sala de Espera Live

**Sistema de gerenciamento e visualização em tempo real para sala de espera veicular**

Um aplicativo completo para gerenciar atendimentos em oficinas mecânicas com painel administrativo, tela live para TV e integração com WhatsApp.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22.13.0-green)](https://nodejs.org)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue)](https://reactnative.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://www.mysql.com)

---

## ✨ Funcionalidades

### 📋 Painel Administrativo
- ✅ Gerenciamento de atendimentos em tempo real
- ✅ Formulário completo (placa, cliente, telefone, tipo de serviço, status)
- ✅ Filtros por status (Todos, Chegada, Aguardando, Em Manutenção, Finalizada)
- ✅ Botões de ação para avançar status
- ✅ Exclusão de atendimentos com confirmação
- ✅ Validação de placas brasileiras (antigo e Mercosul)

### 📺 Tela Live (Display para Sala de Espera)
- ✅ Design estilizado com paleta azul e branco corporativa
- ✅ Background animado com VW Nivus (parallax + zoom)
- ✅ Atualização automática a cada 3 segundos
- ✅ Exibição de atendimentos por status
- ✅ Storytelling visual com mensagens personalizadas
- ✅ Modo TV otimizado (landscape, fontes grandes)

### 📱 Integração WhatsApp
- ✅ Notificações automáticas por mudança de status
- ✅ Integração com Twilio
- ✅ Templates de mensagens personalizadas
- ✅ Validação de números de telefone

### ⚙️ Configurações
- ✅ Editar nome da empresa
- ✅ Controles de notificações
- ✅ Alertas sonoros
- ✅ Intervalo de atualização personalizável
- ✅ Persistência local com AsyncStorage

### 📊 Relatórios
- ✅ Métricas em tempo real
- ✅ Distribuição por tipo de serviço
- ✅ Taxa de conclusão
- ✅ Tempo médio de atendimento

---

## 🛠️ Stack Técnico

| Componente | Tecnologia |
|-----------|-----------|
| **Frontend** | React Native 0.81 + Expo 54 + TypeScript |
| **Backend** | Express.js + tRPC |
| **Database** | MySQL 8.0 + Drizzle ORM |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Integração** | Twilio API (WhatsApp) |
| **Testes** | Vitest (25 testes) |
| **Animações** | React Native Reanimated 4 |

---

## 🚀 Quick Start

### Pré-requisitos
- Node.js 22.13.0+
- pnpm 9.12.0+
- MySQL 8.0+
- Conta Twilio (para WhatsApp)

### Instalação Local

```bash
# 1. Clonar repositório
git clone https://github.com/SEU_USUARIO/lm-waiting-room-live.git
cd lm-waiting-room-live

# 2. Instalar dependências
pnpm install

# 3. Criar arquivo .env.local
cat > .env.local << 'EOF'
DATABASE_URL=mysql://user:password@localhost:3306/lm_waiting_room
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
VITE_APP_ID=seu_app_id
JWT_SECRET=seu_jwt_secret
OAUTH_SERVER_URL=https://api.manus.im
OWNER_OPEN_ID=seu_owner_id
NODE_ENV=development
EOF

# 4. Sincronizar banco de dados
pnpm db:push

# 5. Iniciar desenvolvimento
pnpm dev

# 6. Acessar
# Web: http://localhost:8081
# API: http://localhost:3000
```

---

## 📖 Documentação

### Deploy
Veja [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) para instruções completas de:
- Deploy no Render (gratuito)
- Deploy no Railway (com crédito gratuito)
- Configuração de banco de dados (PlanetScale, Railway)
- Variáveis de ambiente

### Estrutura do Projeto

```
lm-waiting-room-live/
├── app/                    # Telas da aplicação
│   ├── (tabs)/            # Navegação por tabs
│   │   ├── index.tsx      # Home (autenticação)
│   │   ├── admin.tsx      # Painel administrativo
│   │   ├── live.tsx       # Tela live para sala de espera
│   │   ├── tv.tsx         # Modo TV
│   │   ├── reports.tsx    # Relatórios
│   │   └── settings.tsx   # Configurações
│   └── modal.tsx          # Modal exemplo
├── components/            # Componentes reutilizáveis
├── constants/             # Constantes (tema, cores)
├── hooks/                 # Custom hooks
├── lib/                   # Utilitários
├── server/                # Backend
│   ├── _core/            # Core (env, cookies, auth)
│   ├── db.ts             # Funções de banco de dados
│   ├── routes.ts         # Rotas tRPC
│   └── services/         # Serviços (WhatsApp, etc)
├── drizzle/              # Migrações e schema
├── tests/                # Testes unitários
├── public/               # Assets estáticos
└── DEPLOY_GUIDE.md       # Guia de deploy
```

### Tipos de Serviço

O sistema suporta 3 tipos de serviço:

| Tipo | Ícone | Descrição |
|------|-------|-----------|
| **Pneu** | 🔧 | Serviço de pneu |
| **Corretiva** | ⚠️ | Manutenção corretiva |
| **Preventiva** | ✓ | Manutenção preventiva |

---

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Resultado esperado: 25 testes passando
# ✓ tests/whatsapp-integration.test.ts (3 tests)
# ✓ tests/service-types.test.ts (8 tests)
# ✓ tests/attendance.test.ts (14 tests)
```

---

## 🔐 Variáveis de Ambiente

### Obrigatórias para Produção

```
DATABASE_URL              # Connection string MySQL
TWILIO_ACCOUNT_SID        # Twilio Account SID
TWILIO_AUTH_TOKEN         # Twilio Auth Token
TWILIO_WHATSAPP_NUMBER    # Número WhatsApp Twilio
VITE_APP_ID               # ID da aplicação
JWT_SECRET                # Secret para JWT
NODE_ENV                  # production
```

### Opcionais

```
OAUTH_SERVER_URL          # URL do servidor OAuth
OWNER_OPEN_ID             # ID do proprietário
BUILT_IN_FORGE_API_URL    # URL da Forge API
BUILT_IN_FORGE_API_KEY    # Chave da Forge API
```

---

## 📱 Plataformas Suportadas

- ✅ **iOS** (via Expo)
- ✅ **Android** (via Expo)
- ✅ **Web** (navegador)
- ✅ **Desktop** (navegador)
- ✅ **TV** (modo landscape otimizado)

---

## 🎨 Design

- **Paleta de Cores**: Azul corporativo (#0052A3) + Branco
- **Tipografia**: Sistema de fonts iOS-first
- **Responsividade**: Mobile-first com otimizações para desktop/TV
- **Acessibilidade**: WCAG AA compliant

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🆘 Suporte

- 📖 [Documentação Completa](./DEPLOY_GUIDE.md)
- 🐛 [Reportar Bug](https://github.com/SEU_USUARIO/lm-waiting-room-live/issues)
- 💡 [Sugerir Feature](https://github.com/SEU_USUARIO/lm-waiting-room-live/issues)

---

## 🚀 Roadmap

- [ ] Histórico de mensagens WhatsApp
- [ ] Dashboard de métricas avançado
- [ ] Integração com câmeras (RTSP/WebRTC)
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] App nativa iOS (TestFlight)
- [ ] App nativa Android (Google Play)
- [ ] Autenticação com biometria
- [ ] Modo offline com sincronização

---

## 👨‍💼 Autor

Desenvolvido com ❤️ para oficinas mecânicas modernas.

---

**Versão**: 1.0.0  
**Última atualização**: Março 2026

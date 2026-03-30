# 🚀 Guia de Integração: Supabase + Firebase Cloud Messaging

## 📋 Resumo

Este guia mostra como integrar **Supabase** (banco de dados) e **Firebase Cloud Messaging** (notificações gratuitas) ao seu projeto atual, mantendo a estrutura existente.

---

## ✅ Passo 1: Criar Conta no Supabase

### 1.1 Acessar Supabase
1. Vá para: https://supabase.com
2. Clique em **"Start your project"**
3. Faça login com GitHub ou Email

### 1.2 Criar Novo Projeto
1. Clique em **"New project"**
2. Preencha:
   - **Project name**: `lm-sala-espera`
   - **Database password**: Gere uma senha forte
   - **Region**: Escolha a mais próxima (ex: `São Paulo`)
3. Clique em **"Create new project"**
4. Aguarde 2-3 minutos

### 1.3 Copiar Credenciais
1. Vá para **Settings → API**
2. Copie:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## ✅ Passo 2: Criar Conta no Firebase

### 2.1 Acessar Firebase Console
1. Vá para: https://console.firebase.google.com
2. Clique em **"Create a project"**
3. Preencha:
   - **Project name**: `lm-sala-espera`
   - Desative Google Analytics (opcional)
4. Clique em **"Create project"**

### 2.2 Habilitar Cloud Messaging
1. Vá para **Cloud Messaging** (no menu esquerdo)
2. Clique em **"Enable"**

### 2.3 Copiar Credenciais
1. Vá para **Project settings** (ícone de engrenagem)
2. Clique em **"Service accounts"**
3. Clique em **"Generate new private key"**
4. Um arquivo JSON será baixado
5. Abra o arquivo e copie:
   - `project_id` → `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `apiKey` → `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `messagingSenderId` → `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `EXPO_PUBLIC_FIREBASE_APP_ID`

---

## ✅ Passo 3: Configurar Variáveis de Ambiente

### 3.1 Criar `.env.local`
1. Na raiz do projeto, crie um arquivo `.env.local`
2. Adicione:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY

# Firebase
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
EXPO_PUBLIC_FIREBASE_API_KEY=sua-api-key
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=seu-app-id

# App
EXPO_PUBLIC_APP_NAME=LM Sala de Espera
EXPO_PUBLIC_COMPANY_SLUG=lm-sala-espera
```

### 3.2 Adicionar ao `.gitignore`
```
.env.local
.env.*.local
```

---

## ✅ Passo 4: Criar Tabelas no Supabase

### 4.1 Acessar SQL Editor
1. No Supabase, vá para **SQL Editor**
2. Clique em **"New query"**

### 4.2 Criar Tabela de Usuários com Roles
```sql
CREATE TABLE user_company_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  branch_id UUID,
  role TEXT NOT NULL CHECK (role IN ('client', 'operator', 'manager')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

CREATE INDEX idx_user_company_roles_user_id ON user_company_roles(user_id);
CREATE INDEX idx_user_company_roles_company_id ON user_company_roles(company_id);
```

### 4.3 Criar Tabela de Atendimentos
```sql
CREATE TABLE maintenance_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  branch_id UUID,
  customer_id UUID,
  vehicle_id UUID,
  operator_id UUID,
  current_status TEXT NOT NULL DEFAULT 'checkin',
  service_type TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  complaint TEXT,
  diagnosis TEXT,
  estimated_finish_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_maintenance_orders_company_id ON maintenance_orders(company_id);
CREATE INDEX idx_maintenance_orders_status ON maintenance_orders(current_status);
```

### 4.4 Criar Tabela de Notificações
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

---

## ✅ Passo 5: Instalar Dependências

```bash
# Supabase
npm install @supabase/supabase-js

# Firebase
npm install firebase

# Storage
npm install @react-native-async-storage/async-storage

# URL Polyfill
npm install react-native-url-polyfill
```

---

## ✅ Passo 6: Criar Cliente Supabase

### 6.1 Criar `lib/supabase-client.ts`
```typescript
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

const storage = Platform.OS === "web" ? {
  getItem: (key: string) => {
    try {
      return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value);
      }
    } catch {
      // Ignorar erros
    }
  },
  removeItem: (key: string) => {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch {
      // Ignorar erros
    }
  },
} : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});
```

---

## ✅ Passo 7: Criar Serviço de Notificações com FCM

### 7.1 Criar `lib/firebase-config.ts`
```typescript
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
```

### 7.2 Criar `services/notification.service.ts`
```typescript
import { supabase } from "@/lib/supabase-client";

export async function sendNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      title,
      body,
      data,
    });

  if (error) throw error;
}

export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);

  if (error) throw error;
}
```

---

## ✅ Passo 8: Integrar com Seu Sistema Atual

### 8.1 Adicionar Notificações ao Criar Atendimento
```typescript
// Quando um atendimento é criado
import { sendNotification } from "@/services/notification.service";

async function createAttendance(data) {
  // Criar atendimento...
  
  // Enviar notificação
  await sendNotification(
    operatorId,
    "Novo Atendimento",
    `Veículo ${data.placa} chegou`,
    { orderId: newOrder.id }
  );
}
```

### 8.2 Adicionar Notificações ao Finalizar
```typescript
// Quando um atendimento é finalizado
async function finalizeAttendance(attendanceId) {
  // Finalizar atendimento...
  
  // Enviar notificação
  await sendNotification(
    clientId,
    "Atendimento Concluído",
    `Seu veículo ${placa} está pronto!`,
    { attendanceId }
  );
}
```

---

## ✅ Passo 9: Testar Integração

### 9.1 Testar Supabase
```typescript
import { supabase } from "@/lib/supabase-client";

async function testSupabase() {
  const { data, error } = await supabase.auth.getSession();
  console.log("Session:", data);
  console.log("Error:", error);
}
```

### 9.2 Testar Notificações
```typescript
import { sendNotification } from "@/services/notification.service";

async function testNotification() {
  await sendNotification(
    "user-id",
    "Teste",
    "Notificação de teste"
  );
}
```

---

## 📊 Estrutura Final

```
seu-projeto/
├── lib/
│   ├── supabase-client.ts      ← Cliente Supabase
│   └── firebase-config.ts      ← Configuração Firebase
├── services/
│   ├── notification.service.ts ← Serviço de notificações
│   ├── auth.service.ts         ← Autenticação
│   └── orders.service.ts       ← Pedidos
├── .env.local                  ← Variáveis de ambiente
└── ...
```

---

## 🔐 Segurança

### Row Level Security (RLS) no Supabase

```sql
-- Permitir usuários ver apenas suas notificações
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 💡 Próximos Passos

1. **Autenticação com Roles** — Implementar login com diferentes papéis (Cliente, Operador, Gerente)
2. **Sincronização em Tempo Real** — Usar Supabase Realtime para atualizações automáticas
3. **Histórico de Notificações** — Adicionar tela para visualizar notificações antigas
4. **Push Notifications** — Integrar com Expo Push Notifications para notificações no dispositivo

---

## 📞 Suporte

- **Supabase Docs**: https://supabase.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Expo Docs**: https://docs.expo.dev

**Qualquer dúvida, é só chamar! 🚀**

# 📅 Sistema de Agendamentos para Clínicas

![Banner Projeto](https://i.imgur.com/v5KwdDl.png)

Sistema completo de gerenciamento de agendamentos para clínicas e consultórios, desenvolvido com Next.js 15, React 19, React Query, TypeScript e Supabase.

## 🔧 Instalação

### 1. Faça o Fork do projeto e clone o repositório

```bash
git clone https://github.com/seu-usuario/agenda-clinicas.git
cd agenda-clinicas
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_CLINIC_NAME=Nome do Painel

# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

**Como obter as credenciais do Supabase:**

1. Acesse [https://supabase.com/](https://supabase.com/)
2. Crie uma conta ou faça login
3. Crie um novo projeto
4. Vá em **Settings** → **API**
5. Copie a **URL** e a **anon/public key**

### 4. Configure o Banco de Dados no Supabase

Você precisará criar 4 tabelas no Supabase. Acesse o **Table Editor** ou **SQL Editor** e crie as seguintes estruturas:

## 🗂️ Estrutura do Banco de Dados

O sistema utiliza **4 tabelas principais** no Supabase:

### 📊 Relacionamentos entre Tabelas

```
professionals ─┐
               │
               ├──> appointments <─── services
               │
clientes ──────┘
```

### 📋 Tabelas e suas Propriedades

#### 1️⃣ **Table: `professionals`** (Profissionais da Clínica)

| Propriedade  | Tipo        | Obrigatório | Descrição                               |
| ------------ | ----------- | ----------- | --------------------------------------- |
| `id`         | int8        | ✅ Auto     | ID único                                |
| `created_at` | timestamptz | ✅ Auto     | Data de criação                         |
| `code`       | text        | ✅          | Username do profissional (ex: "dr-ana") |
| `name`       | text        | ✅          | Nome completo                           |

**Exemplo:** Dra. Ana Caroline, Dr. João Silva

---

#### 2️⃣ **Table: `services`** (Serviços Oferecidos)

| Propriedade        | Tipo        | Obrigatório | Descrição          |
| ------------------ | ----------- | ----------- | ------------------ |
| `id`               | int8        | ✅ Auto     | ID único           |
| `created_at`       | timestamptz | ✅ Auto     | Data de criação    |
| `code`             | text        | ✅          | Nome do serviço    |
| `duration_minutes` | int4        | ✅          | Duração em minutos |

**Exemplo:** Consulta Geral (30 min), Exame de Rotina (45 min)

---

#### 3️⃣ **Table: `clientes`** (Clientes Cadastrados)

| Propriedade  | Tipo        | Obrigatório       | Descrição          |
| ------------ | ----------- | ----------------- | ------------------ |
| `id`         | int8        | ✅ Auto           | ID único           |
| `created_at` | timestamptz | ✅ Auto           | Data de criação    |
| `nome`       | text        | ✅                | Nome completo      |
| `telefone`   | text        | ✅ Único          | Telefone (com DDD) |
| `trava`      | bool        | ✅ Default: false | Cliente bloqueado? |

**Exemplo:** Carlos Silva, (11) 98765-4321, trava: false

---

#### 4️⃣ **Table: `appointments`** (Agendamentos)

| Propriedade         | Tipo        | Obrigatório | Descrição               |
| ------------------- | ----------- | ----------- | ----------------------- |
| `id`                | int8        | ✅ Auto     | ID único                |
| `created_at`        | timestamptz | ✅ Auto     | Data de criação         |
| `service_code`      | int8        | ✅          | FK → `services.id`      |
| `professional_code` | int8        | ✅          | FK → `professionals.id` |
| `customer_name`     | text        | ✅          | Nome do cliente         |
| `customer_phone`    | text        | ✅          | Telefone do cliente     |
| `start_time`        | timestamptz | ✅          | Horário de início       |
| `end_time`          | timestamptz | ✅          | Horário de término      |

**⚠️ Foreign Keys:**

- `service_code` referencia `services(id)`
- `professional_code` referencia `professionals(id)`

---

### 🔗 Como as Tabelas se Relacionam

1. **appointments** → **professionals**: Qual profissional realizará o atendimento
2. **appointments** → **services**: Qual serviço será realizado
3. **appointments** → **clientes**: Relação via `customer_phone` = `telefone`

## ▶️ Como Executar o Projeto

### Ambiente de Desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Build de Produção

```bash
npm run build
npm run start
```

## ✨ Funcionalidades

### 📊 Dashboard

- ✅ Visualização de agendamentos por data
- ✅ Filtro de busca por nome do cliente
- ✅ Atualização automática a cada 60 segundos (polling)
- ✅ Exibição de detalhes do agendamento
- ✅ Informações de serviço e profissional
- ✅ Integração com WhatsApp
- ✅ Exclusão de agendamentos

### 👥 Gestão de Clientes

- ✅ Listagem paginada (15 clientes por página)
- ✅ Filtro de busca por nome
- ✅ Visualização de detalhes do cliente
- ✅ Sistema de bloqueio/desbloqueio
- ✅ Indicador visual de status (Bloqueado/Ativo)
- ✅ Integração com WhatsApp

### 🔒 Sistema de Bloqueio

- ✅ Bloquear clientes na tabela `clientes`
- ✅ Sincronização automática entre agendamentos e clientes
- ✅ Feedback visual em tempo real
- ✅ Validação de cliente existente

### 👨‍⚕️ Profissionais

- ✅ Listar profissionais cadastrados
- ✅ Atualizar dados profissionais
- ✅ Deletar profissionais

# OdontoVida - Esquema do Banco de Dados Supabase

> **Última atualização:** 22 de Janeiro de 2026  
> **Sistema:** OdontoVida CRM - Sistema de Gestão Odontológica

---

## 📋 Índice

1. [Tabelas Principais](#tabelas-principais)
2. [Tabelas de Relacionamento](#tabelas-de-relacionamento)
3. [Tabelas de Odontograma](#tabelas-de-odontograma)
4. [Tabelas Financeiras](#tabelas-financeiras)
5. [Tabelas de Auditoria](#tabelas-de-auditoria)
6. [Tipos ENUM](#tipos-enum)
7. [Funções e Triggers](#funções-e-triggers)

---

## 1️⃣ Tabelas Principais

### `clientes`

Tabela de cadastro de pacientes/clientes.

| Coluna            | Tipo      | Descrição                          |
| ----------------- | --------- | ---------------------------------- |
| `id`              | INTEGER   | Chave primária (auto-incremento)   |
| `created_at`      | TIMESTAMP | Data de criação do registro        |
| `nome`            | TEXT      | Nome completo do cliente           |
| `telefone`        | TEXT      | Telefone de contato                |
| `trava`           | BOOLEAN   | Indica se o cliente está bloqueado |
| `notes`           | TEXT      | Observações gerais                 |
| `endereco`        | TEXT      | Endereço completo                  |
| `cidade`          | TEXT      | Cidade                             |
| `bairro`          | TEXT      | Bairro                             |
| `data_nascimento` | TEXT      | Data de nascimento                 |

**Índices:**

- `idx_clientes_telefone` em `telefone`

---

### `professionals`

Tabela de profissionais (dentistas, médicos).

| Coluna       | Tipo      | Descrição                          |
| ------------ | --------- | ---------------------------------- |
| `id`         | INTEGER   | Chave primária (auto-incremento)   |
| `created_at` | TIMESTAMP | Data de criação                    |
| `code`       | TEXT      | Código único do profissional       |
| `name`       | TEXT      | Nome do profissional               |
| `specialty`  | TEXT      | Especialidade                      |
| `email`      | TEXT      | Email do profissional              |
| `user_id`    | UUID      | Referência ao usuário (auth.users) |

**Índices:**

- `idx_professionals_code` em `code`
- `idx_professionals_email` em `email`

---

### `services`

Tabela de serviços oferecidos.

| Coluna             | Tipo          | Descrição                        |
| ------------------ | ------------- | -------------------------------- |
| `id`               | INTEGER       | Chave primária (auto-incremento) |
| `created_at`       | TIMESTAMP     | Data de criação                  |
| `code`             | TEXT          | Código do serviço                |
| `duration_minutes` | INTEGER       | Duração padrão em minutos        |
| `price`            | DECIMAL(10,2) | Preço do serviço                 |

**Índices:**

- `idx_services_code` em `code`

---

### `appointments`

Tabela de agendamentos.

| Coluna              | Tipo          | Descrição                        |
| ------------------- | ------------- | -------------------------------- |
| `id`                | INTEGER       | Chave primária (auto-incremento) |
| `created_at`        | TIMESTAMP     | Data de criação                  |
| `service_code`      | INTEGER       | Código do serviço                |
| `professional_code` | INTEGER       | Código do profissional           |
| `customer_name`     | TEXT          | Nome do cliente                  |
| `customer_phone`    | TEXT          | Telefone do cliente              |
| `start_time`        | TIMESTAMP     | Horário de início                |
| `end_time`          | TIMESTAMP     | Horário de término               |
| `completed_at`      | TIMESTAMP     | Data de conclusão                |
| `status`            | TEXT          | Status do agendamento            |
| `payment_status`    | TEXT          | Status de pagamento              |
| `payment_amount`    | DECIMAL(10,2) | Valor pago                       |
| `payment_method`    | TEXT          | Método de pagamento              |

**Índices:**

- `idx_appointments_customer_phone` em `customer_phone`
- `idx_appointments_start_time` em `start_time`
- `idx_appointments_status` em `status`

---

### `user_profiles`

Tabela de perfis de usuários com sistema de roles.

| Coluna       | Tipo      | Descrição                                            |
| ------------ | --------- | ---------------------------------------------------- |
| `id`         | UUID      | Chave primária (referência auth.users)               |
| `email`      | TEXT      | Email do usuário                                     |
| `full_name`  | TEXT      | Nome completo                                        |
| `role`       | TEXT      | Role: 'admin', 'recepcionista', 'dentista', 'medico' |
| `created_at` | TIMESTAMP | Data de criação                                      |
| `updated_at` | TIMESTAMP | Data de atualização                                  |

**Constraint:**

- `role` deve ser um de: `'admin'`, `'recepcionista'`, `'dentista'`, `'medico'`

**Índices:**

- `idx_user_profiles_email` em `email`
- `idx_user_profiles_role` em `role`

---

## 2️⃣ Tabelas de Relacionamento

### `professional_services`

Associação entre profissionais e serviços com duração customizada.

| Coluna                    | Tipo      | Descrição             |
| ------------------------- | --------- | --------------------- |
| `id`                      | BIGSERIAL | Chave primária        |
| `created_at`              | TIMESTAMP | Data de criação       |
| `professional_id`         | BIGINT    | FK para professionals |
| `service_id`              | BIGINT    | FK para services      |
| `custom_duration_minutes` | INTEGER   | Duração customizada   |
| `is_active`               | BOOLEAN   | Se está ativo         |

**Constraints:**

- `unique_professional_service` em `(professional_id, service_id)`

**Índices:**

- `idx_professional_services_professional_id`
- `idx_professional_services_service_id`
- `idx_professional_services_active` (WHERE is_active = true)

---

### `professional_schedules`

Horários de trabalho dos profissionais por dia da semana.

| Coluna            | Tipo      | Descrição                           |
| ----------------- | --------- | ----------------------------------- |
| `id`              | BIGSERIAL | Chave primária                      |
| `created_at`      | TIMESTAMP | Data de criação                     |
| `professional_id` | BIGINT    | FK para professionals               |
| `day_of_week`     | INTEGER   | 0=Domingo, 1=Segunda, ..., 6=Sábado |
| `start_time`      | TIME      | Horário de início                   |
| `end_time`        | TIME      | Horário de término                  |
| `is_active`       | BOOLEAN   | Se está ativo                       |

**Constraints:**

- `day_of_week` entre 0 e 6
- `end_time > start_time`
- `unique_professional_day_period` em `(professional_id, day_of_week, start_time)`

**Índices:**

- `idx_professional_schedules_professional_id`
- `idx_professional_schedules_day_of_week`
- `idx_professional_schedules_active`

---

## 3️⃣ Tabelas de Odontograma

### `odontograms`

Odontograma principal (um por paciente).

| Coluna       | Tipo      | Descrição                 |
| ------------ | --------- | ------------------------- |
| `id`         | UUID      | Chave primária            |
| `patient_id` | INTEGER   | FK para clientes (UNIQUE) |
| `created_by` | UUID      | FK para auth.users        |
| `created_at` | TIMESTAMP | Data de criação           |
| `updated_at` | TIMESTAMP | Data de atualização       |

**Constraints:**

- `UNIQUE(patient_id)` - um odontograma por paciente

**Índices:**

- `idx_odontograms_patient` em `patient_id`
- `idx_odontograms_created_by` em `created_by`

---

### `tooth_records`

Registros individuais de dentes.

| Coluna          | Tipo        | Descrição                           |
| --------------- | ----------- | ----------------------------------- |
| `id`            | UUID        | Chave primária                      |
| `odontogram_id` | UUID        | FK para odontograms                 |
| `tooth_number`  | INTEGER     | Número do dente (FDI: 11-48, 51-85) |
| `tooth_type`    | VARCHAR(20) | 'permanent' ou 'deciduous'          |
| `status`        | VARCHAR(50) | Status do dente                     |
| `notes`         | TEXT        | Observações                         |
| `created_at`    | TIMESTAMP   | Data de criação                     |
| `updated_at`    | TIMESTAMP   | Data de atualização                 |

**Constraints:**

- `tooth_number` entre 11-48 ou 51-85
- `tooth_type` em ('permanent', 'deciduous')
- `UNIQUE(odontogram_id, tooth_number)`

**Status possíveis:** 'healthy', 'cavity', 'filled', 'missing', 'root_canal', 'crown', 'implant'

**Índices:**

- `idx_tooth_records_odontogram`
- `idx_tooth_records_number`

---

### `tooth_surface_conditions`

Condições em superfícies específicas dos dentes.

| Coluna            | Tipo        | Descrição               |
| ----------------- | ----------- | ----------------------- |
| `id`              | UUID        | Chave primária          |
| `tooth_record_id` | UUID        | FK para tooth_records   |
| `surface`         | VARCHAR(20) | Superfície do dente     |
| `condition`       | VARCHAR(50) | Condição encontrada     |
| `material`        | VARCHAR(50) | Material de restauração |
| `severity`        | VARCHAR(20) | Gravidade               |
| `created_by`      | UUID        | FK para auth.users      |
| `created_at`      | TIMESTAMP   | Data de criação         |

**Constraints:**

- `surface` em ('occlusal', 'mesial', 'distal', 'buccal', 'lingual', 'palatal')

**Índices:**

- `idx_tooth_surface_conditions_tooth`

---

### `tooth_treatment_history`

Histórico de tratamentos realizados.

| Coluna            | Tipo          | Descrição             |
| ----------------- | ------------- | --------------------- |
| `id`              | UUID          | Chave primária        |
| `tooth_record_id` | UUID          | FK para tooth_records |
| `treatment_type`  | VARCHAR(100)  | Tipo de tratamento    |
| `description`     | TEXT          | Descrição             |
| `performed_by`    | UUID          | FK para auth.users    |
| `performed_at`    | TIMESTAMP     | Data de realização    |
| `cost`            | DECIMAL(10,2) | Custo                 |
| `notes`           | TEXT          | Observações           |

**Tipos de tratamento:** 'extraction', 'filling', 'root_canal', 'crown', 'cleaning', etc.

**Índices:**

- `idx_tooth_treatment_history_tooth`
- `idx_tooth_treatment_history_performed_by`

---

## 4️⃣ Tabelas Financeiras

### `transactions`

Transações financeiras (receitas e despesas).

| Coluna                   | Tipo               | Descrição                   |
| ------------------------ | ------------------ | --------------------------- |
| `id`                     | UUID               | Chave primária              |
| `client_id`              | UUID               | FK para clients             |
| `appointment_id`         | UUID               | FK para appointments        |
| `professional_id`        | INTEGER            | FK para professionals       |
| `type`                   | transaction_type   | 'receita' ou 'despesa'      |
| `category`               | TEXT               | Categoria da transação      |
| `description`            | TEXT               | Descrição                   |
| `amount`                 | DECIMAL(10,2)      | Valor                       |
| `payment_method`         | payment_method     | Método de pagamento         |
| `status`                 | transaction_status | Status                      |
| `due_date`               | DATE               | Data de vencimento          |
| `paid_date`              | DATE               | Data de pagamento           |
| `notes`                  | TEXT               | Observações                 |
| `mercadopago_payment_id` | TEXT               | ID do pagamento MercadoPago |
| `mercadopago_status`     | TEXT               | Status MercadoPago          |
| `created_at`             | TIMESTAMP          | Data de criação             |
| `updated_at`             | TIMESTAMP          | Data de atualização         |

**Índices:**

- `idx_transactions_client_id`
- `idx_transactions_appointment_id`
- `idx_transactions_status`
- `idx_transactions_due_date`

---

### `payment_plans`

Planos de pagamento (parcelamentos).

| Coluna              | Tipo                | Descrição           |
| ------------------- | ------------------- | ------------------- |
| `id`                | UUID                | Chave primária      |
| `client_id`         | UUID                | FK para clients     |
| `description`       | TEXT                | Descrição           |
| `total_amount`      | DECIMAL(10,2)       | Valor total         |
| `installments`      | INTEGER             | Número de parcelas  |
| `paid_installments` | INTEGER             | Parcelas pagas      |
| `status`            | payment_plan_status | Status              |
| `created_at`        | TIMESTAMP           | Data de criação     |
| `updated_at`        | TIMESTAMP           | Data de atualização |

**Índices:**

- `idx_payment_plans_client_id`

---

### `installments`

Parcelas dos planos de pagamento.

| Coluna               | Tipo               | Descrição             |
| -------------------- | ------------------ | --------------------- |
| `id`                 | UUID               | Chave primária        |
| `payment_plan_id`    | UUID               | FK para payment_plans |
| `installment_number` | INTEGER            | Número da parcela     |
| `amount`             | DECIMAL(10,2)      | Valor                 |
| `due_date`           | DATE               | Data de vencimento    |
| `paid_date`          | DATE               | Data de pagamento     |
| `status`             | transaction_status | Status                |
| `payment_method`     | payment_method     | Método de pagamento   |
| `notes`              | TEXT               | Observações           |
| `created_at`         | TIMESTAMP          | Data de criação       |
| `updated_at`         | TIMESTAMP          | Data de atualização   |

**Índices:**

- `idx_installments_payment_plan_id`
- `idx_installments_status`

---

### `expenses`

Despesas da clínica.

| Coluna           | Tipo               | Descrição           |
| ---------------- | ------------------ | ------------------- |
| `id`             | UUID               | Chave primária      |
| `category`       | TEXT               | Categoria           |
| `description`    | TEXT               | Descrição           |
| `amount`         | DECIMAL(10,2)      | Valor               |
| `payment_method` | payment_method     | Método de pagamento |
| `due_date`       | DATE               | Data de vencimento  |
| `paid_date`      | DATE               | Data de pagamento   |
| `status`         | transaction_status | Status              |
| `notes`          | TEXT               | Observações         |
| `created_at`     | TIMESTAMP          | Data de criação     |
| `updated_at`     | TIMESTAMP          | Data de atualização |

**Índices:**

- `idx_expenses_status`

---

## 5️⃣ Tabelas de Prontuário Médico

### `medical_records`

Registros médicos/prontuários (sistema SOAP).

| Coluna            | Tipo      | Descrição                |
| ----------------- | --------- | ------------------------ |
| `id`              | UUID      | Chave primária           |
| `client_id`       | INTEGER   | FK para clientes         |
| `professional_id` | INTEGER   | FK para professionals    |
| `appointment_id`  | INTEGER   | FK para appointments     |
| `date`            | DATE      | Data do registro         |
| `clinical_notes`  | TEXT      | Notas clínicas           |
| `observations`    | TEXT      | Observações              |
| `soap_subjective` | TEXT      | SOAP - Subjetivo         |
| `soap_objective`  | TEXT      | SOAP - Objetivo          |
| `soap_assessment` | TEXT      | SOAP - Avaliação         |
| `soap_plan`       | TEXT      | SOAP - Plano             |
| `vital_signs`     | JSONB     | Sinais vitais (JSON)     |
| `prescriptions`   | JSONB     | Prescrições (JSON array) |
| `attachments`     | JSONB     | Anexos (JSON array)      |
| `created_by`      | UUID      | FK para auth.users       |
| `created_at`      | TIMESTAMP | Data de criação          |
| `updated_at`      | TIMESTAMP | Data de atualização      |

**Índices:**

- `idx_medical_records_client`
- `idx_medical_records_professional`
- `idx_medical_records_appointment`
- `idx_medical_records_date`
- `idx_medical_records_created_by`

---

## 6️⃣ Tabelas de Auditoria

### `audit_logs`

Logs de auditoria do sistema.

| Coluna       | Tipo      | Descrição                    |
| ------------ | --------- | ---------------------------- |
| `id`         | UUID      | Chave primária               |
| `user_id`    | UUID      | FK para auth.users           |
| `user_email` | TEXT      | Email do usuário             |
| `user_role`  | TEXT      | Role do usuário              |
| `action`     | TEXT      | 'INSERT', 'UPDATE', 'DELETE' |
| `table_name` | TEXT      | Nome da tabela afetada       |
| `record_id`  | TEXT      | ID do registro afetado       |
| `old_data`   | JSONB     | Dados antigos (JSON)         |
| `new_data`   | JSONB     | Dados novos (JSON)           |
| `ip_address` | TEXT      | Endereço IP                  |
| `user_agent` | TEXT      | User agent                   |
| `created_at` | TIMESTAMP | Data de criação              |

**Índices:**

- `idx_audit_logs_user_id`
- `idx_audit_logs_table_name`
- `idx_audit_logs_action`
- `idx_audit_logs_created_at`

**Nota:** Logs de auditoria são **imutáveis** (não podem ser editados ou deletados).

---

## 7️⃣ Tipos ENUM

### `transaction_type`

```sql
CREATE TYPE transaction_type AS ENUM ('receita', 'despesa');
```

### `transaction_status`

```sql
CREATE TYPE transaction_status AS ENUM ('pendente', 'pago', 'cancelado', 'atrasado');
```

### `payment_method`

```sql
CREATE TYPE payment_method AS ENUM (
  'dinheiro',
  'cartao_credito',
  'cartao_debito',
  'pix',
  'boleto',
  'transferencia'
);
```

### `payment_plan_status`

```sql
CREATE TYPE payment_plan_status AS ENUM ('ativo', 'concluido', 'cancelado');
```

---

## 8️⃣ Funções e Triggers Importantes

### Funções de Atualização Automática

#### `update_updated_at_column()`

Atualiza automaticamente o campo `updated_at` em várias tabelas:

- `odontograms`
- `tooth_records`
- `transactions`
- `payment_plans`
- `installments`
- `expenses`
- `medical_records`
- `user_profiles`

### Funções de Odontograma

#### `initialize_default_teeth(p_odontogram_id UUID)`

Inicializa todos os dentes permanentes (11-48) com status 'healthy' quando um novo odontograma é criado.

#### `auto_initialize_teeth()`

Trigger que chama automaticamente `initialize_default_teeth()` após inserção em `odontograms`.

### Funções de Auditoria

#### `audit_trigger_function()`

Registra automaticamente todas as operações (INSERT, UPDATE, DELETE) nas tabelas auditadas:

- `transactions`
- `user_profiles`
- `clientes`
- `professionals`

### Funções de Usuário

#### `handle_new_user()`

Cria automaticamente um perfil em `user_profiles` quando um novo usuário é registrado em `auth.users`.

#### `get_user_role()`

Retorna a role do usuário autenticado atual.

#### `get_user_professional_id()`

Retorna o ID do profissional associado ao usuário autenticado.

### Funções de Consulta

#### `get_audit_logs_for_record(p_table_name TEXT, p_record_id TEXT)`

Retorna todos os logs de auditoria para um registro específico.

---

## 9️⃣ Views

### `professional_patients`

View que mostra os pacientes de cada profissional com estatísticas.

**Colunas:**

- `professional_id` - ID do profissional
- `client_id` - ID do cliente
- `client_name` - Nome do cliente
- `client_phone` - Telefone do cliente
- `last_appointment` - Data do último agendamento
- `total_appointments` - Total de agendamentos
- `total_records` - Total de prontuários

---

## 🔒 Row Level Security (RLS)

Todas as tabelas têm **RLS habilitado** com políticas baseadas em roles:

### Níveis de Acesso:

1. **Admin**
   - Acesso total a todas as tabelas
   - Pode visualizar logs de auditoria

2. **Recepcionista**
   - Pode gerenciar clientes, agendamentos e serviços
   - Acesso limitado a prontuários

3. **Dentista/Médico**
   - Pode visualizar e editar apenas seus próprios pacientes
   - Acesso completo a odontogramas de seus pacientes
   - Pode criar e editar prontuários de seus pacientes

4. **Authenticated Users**
   - Acesso básico conforme políticas específicas de cada tabela

---

## 📊 Estatísticas do Banco

- **Total de Tabelas:** 17
- **Total de ENUMs:** 4
- **Total de Funções:** 8+
- **Total de Triggers:** 10+
- **Total de Views:** 1

---

## 🔗 Relacionamentos Principais

```
auth.users (Supabase Auth)
    ↓
user_profiles (roles)
    ↓
professionals ←→ professional_services ←→ services
    ↓                     ↓
appointments ←→ clientes
    ↓                     ↓
transactions          odontograms
    ↓                     ↓
payment_plans      tooth_records
    ↓                     ↓
installments    tooth_surface_conditions
                          ↓
                tooth_treatment_history
```

---

## 📝 Notas Importantes

1. **Timezone:** Todos os timestamps usam UTC
2. **Soft Delete:** Não implementado - usa CASCADE em foreign keys
3. **Auditoria:** Ativada para tabelas críticas (transactions, user_profiles, clientes, professionals)
4. **Backup:** Recomenda-se backup diário via Supabase Dashboard
5. **Migrations:** Todos os scripts SQL estão em `/supabase-migrations/`

---

## 🚀 Como Usar Este Documento

- **Desenvolvimento:** Consulte este documento ao criar queries ou novos recursos
- **Onboarding:** Use como referência para novos desenvolvedores
- **Documentação:** Mantenha atualizado conforme o schema evolui
- **Troubleshooting:** Verifique constraints e índices ao debugar problemas de performance

---

**Gerado automaticamente em:** 22/01/2026  
**Versão do Sistema:** OdontoVida CRM v1.0

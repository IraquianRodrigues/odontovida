# Sistema de Associação Profissional-Serviço

## Descrição

Este sistema permite que cada profissional tenha durações específicas para cada serviço que pode realizar, proporcionando maior flexibilidade no gerenciamento da clínica.

## Como Aplicar

### 1. Criar a Tabela no Banco de Dados

**Via Supabase Dashboard:**
1. Acesse o [Dashboard do Supabase](https://supabase.com)
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Copie e cole o conteúdo de `create-professional-services-table.sql`
5. Clique em **Run**

## Como Usar

### 1. Configurar Serviços para um Profissional

1. Acesse **Dashboard → Profissionais**
2. Clique em **Editar** no profissional desejado
3. Role até a seção **"Serviços do Profissional"**
4. Para cada serviço:
   - Clique em **Adicionar** para ativar o serviço
   - Defina a duração customizada (padrão: duração do serviço)
   - Clique em **Editar** para alterar a duração
   - Clique em **Desativar** para remover temporariamente
   - Clique no ícone de lixeira para deletar permanentemente

### 2. Exemplo de Configuração

**Dr. João Silva - Cardiologista:**
- Consulta Geral: 30 minutos ✅ Ativo
- Exame Rotina: 45 minutos ✅ Ativo
- Procedimento Especial: 90 minutos ✅ Ativo

**Dra. Maria Santos - Dermatologista:**
- Consulta Geral: 45 minutos ✅ Ativo
- Avaliação: 60 minutos ✅ Ativo

## Benefícios

### 1. Flexibilidade
Cada profissional pode ter durações diferentes para o mesmo serviço, refletindo sua experiência e especialidade.

### 2. Gestão Centralizada
Administradores podem ativar/desativar serviços por profissional de forma rápida.

### 3. Precisão nos Agendamentos
O sistema calcula automaticamente o horário de término baseado na duração específica do profissional.

### 4. Escalabilidade
Fácil adicionar novos profissionais e serviços sem conflitos.

## Estrutura de Dados

```
professional_services
├── id (chave primária)
├── professional_id (FK → professionals)
├── service_id (FK → services)
├── custom_duration_minutes (duração customizada)
├── is_active (ativo/inativo)
└── created_at (data de criação)
```

## Migração de Dados Existentes

Os agendamentos antigos continuam funcionando normalmente. O sistema usa:
1. **Com associação**: Duração customizada do professional_services
2. **Sem associação**: Duração padrão da tabela services

## Rollback

Se precisar reverter:

```sql
DROP TABLE IF EXISTS professional_services CASCADE;
```

**Atenção:** Isso removerá todas as associações configuradas.

## Próximos Passos

Após configurar as associações:
1. Teste criar um agendamento
2. Verifique se os serviços são filtrados corretamente
3. Confirme se as durações estão corretas


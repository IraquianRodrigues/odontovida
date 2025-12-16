# Migração: Adicionar Campo de Especialidade aos Profissionais

## Descrição
Esta migração adiciona o campo `specialty` (especialidade) à tabela `professionals` no banco de dados.

## Como Aplicar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o dashboard do seu projeto no [Supabase](https://supabase.com)
2. Vá para **SQL Editor** no menu lateral
3. Clique em **New Query**
4. Copie e cole o conteúdo do arquivo `add-specialty-column.sql`
5. Clique em **Run** para executar

### Opção 2: Via CLI do Supabase

Se você tiver o Supabase CLI instalado:

```bash
supabase db execute -f scripts/add-specialty-column.sql
```

## Verificação

Após aplicar a migração, você pode verificar se a coluna foi criada executando:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'professionals' 
AND column_name = 'specialty';
```

## Rollback

Se precisar reverter a migração:

```sql
ALTER TABLE professionals DROP COLUMN IF EXISTS specialty;
```

## Alterações no Código

As seguintes alterações foram feitas no código para suportar este campo:

- ✅ `src/types/database.types.ts` - Tipo atualizado
- ✅ `src/app/dashboard/profissionais/_components/professionals-table.tsx` - Coluna adicionada
- ✅ `src/components/professional-details-modal.tsx` - Campo no formulário
- ✅ `src/services/professionals/professionals.service.ts` - Serviço atualizado
- ✅ `src/services/professionals/use-professionals.ts` - Hooks atualizados


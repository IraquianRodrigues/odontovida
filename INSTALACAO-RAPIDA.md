# 📦 INSTALAÇÃO RÁPIDA

## Passo 1: Executar SQL no Supabase

Execute os scripts SQL na ordem:

1. **01-create-tables.sql** - Cria as 4 tabelas
2. **02-create-policies.sql** - Configura permissões
3. **03-seed-data.sql** - Dados iniciais (opcional)

## Passo 2: Copiar Arquivos

### Estrutura de Diretórios:

```
seu-projeto/
├── src/
│   ├── components/
│   │   ├── business-hours-settings.tsx
│   │   ├── weekly-schedule-editor.tsx
│   │   ├── breaks-manager.tsx
│   │   ├── holidays-manager.tsx
│   │   └── blocked-slots-manager.tsx
│   │
│   ├── services/
│   │   └── business-hours/
│   │       ├── business-hours.service.ts
│   │       ├── use-business-hours.ts
│   │       └── index.ts
│   │
│   ├── app/
│   │   ├── api/
│   │   │   └── business-hours/
│   │   │       └── route.ts
│   │   │
│   │   └── dashboard/
│   │       └── configuracoes/
│   │           └── page.tsx
│   │
│   └── types/
│       └── database.types.ts (adicionar os tipos)
```

## Passo 3: Adicionar Rota no Menu

```tsx
{
  title: "Configurações",
  url: "/dashboard/configuracoes",
  icon: Settings,
}
```

## Passo 4: Testar

Acesse: `http://localhost:3000/dashboard/configuracoes`

## API para N8N

```
GET /api/business-hours?date=2024-01-27&duration=30
```

---

✅ **Pronto!** O sistema está funcionando.

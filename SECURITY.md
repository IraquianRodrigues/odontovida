# Security Policy - OdontoVida CRM

## 🔒 Segurança do Sistema

Este documento descreve as práticas de segurança implementadas no sistema OdontoVida e como reportar vulnerabilidades.

## 📋 Índice

- [Reportando Vulnerabilidades](#reportando-vulnerabilidades)
- [Controle de Acesso e Roles](#controle-de-acesso-e-roles)
- [Autenticação](#autenticação)
- [Proteção de Dados](#proteção-de-dados)
- [Auditoria](#auditoria)
- [Melhores Práticas](#melhores-práticas)

---

## 🚨 Reportando Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança no OdontoVida, por favor:

1. **NÃO** abra uma issue pública
2. Entre em contato diretamente com a equipe de desenvolvimento
3. Forneça detalhes sobre a vulnerabilidade, incluindo:
   - Descrição do problema
   - Passos para reproduzir
   - Impacto potencial
   - Sugestões de correção (se houver)

Agradecemos sua contribuição para manter o sistema seguro!

---

## 👥 Controle de Acesso e Roles

O sistema implementa três níveis de acesso:

### 1. **Admin** (Administrador)

- ✅ Acesso total ao sistema
- ✅ Gerenciar usuários e alterar roles
- ✅ Acesso completo ao módulo financeiro
- ✅ Criar, editar e deletar profissionais
- ✅ Criar, editar e deletar serviços
- ✅ Visualizar logs de auditoria

### 2. **Recepcionista**

- ✅ Gerenciar clientes (criar, editar, visualizar)
- ✅ Gerenciar agendamentos (criar, editar, visualizar)
- ✅ Visualizar transações financeiras (apenas leitura)
- ❌ Não pode editar valores financeiros
- ❌ Não pode alterar roles de usuários
- ❌ Não pode deletar profissionais ou serviços

### 3. **Dentista**

- ✅ Visualizar seus próprios agendamentos
- ✅ Atualizar status de seus agendamentos
- ✅ Visualizar transações relacionadas aos seus atendimentos
- ❌ Não pode visualizar agendamentos de outros dentistas
- ❌ Não pode acessar dados financeiros completos
- ❌ Não pode gerenciar usuários

---

## 🔐 Autenticação

### Proteção de Rotas

Todas as rotas do dashboard (`/dashboard/*`) são protegidas por middleware Next.js que:

1. Verifica se o usuário está autenticado
2. Valida o token de sessão
3. Renova tokens expirados automaticamente
4. Redireciona usuários não autenticados para a página de login

### Rate Limiting

O sistema implementa rate limiting para prevenir ataques de força bruta:

- **Login**: Máximo de 5 tentativas por minuto
- **APIs**: Máximo de 100 requisições por minuto
- **Criação de transações**: Máximo de 20 por minuto

Quando o limite é excedido, o usuário recebe um erro 429 (Too Many Requests) e deve aguardar antes de tentar novamente.

### Sessões

- Sessões são gerenciadas pelo Supabase Auth
- Tokens são armazenados em cookies HTTP-only
- Renovação automática de tokens antes da expiração
- Logout limpa todos os tokens e cookies

---

## 🛡️ Proteção de Dados

### Row Level Security (RLS)

Todas as tabelas do banco de dados implementam políticas RLS baseadas em roles:

#### Transações Financeiras

- **Admins**: Acesso total
- **Dentistas**: Apenas transações relacionadas aos seus atendimentos
- **Recepcionistas**: Apenas visualização (sem edição)

#### Clientes

- Todos os usuários autenticados podem visualizar e editar
- Apenas admins podem deletar

#### Agendamentos

- **Admins e Recepcionistas**: Acesso total
- **Dentistas**: Apenas seus próprios agendamentos

#### Profissionais e Serviços

- Todos podem visualizar
- Apenas admins podem criar, editar ou deletar

### Validação de Entrada

Todos os formulários implementam validação em duas camadas:

1. **Client-side**: Validação imediata com Zod + React Hook Form
2. **Server-side**: Validação adicional antes de salvar no banco

Validações incluem:

- Tipos de dados corretos
- Valores dentro de limites aceitáveis
- Formatos válidos (CPF, telefone, email, etc.)
- Prevenção de SQL injection
- Sanitização de inputs

### Security Headers

O sistema implementa os seguintes headers de segurança:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: [política restritiva]
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Esses headers protegem contra:

- Clickjacking
- MIME sniffing
- Cross-Site Scripting (XSS)
- Man-in-the-middle attacks
- Acesso não autorizado a APIs do navegador

---

## 📊 Auditoria

### Logs de Auditoria

O sistema registra automaticamente todas as ações sensíveis:

- ✅ Criação, edição e exclusão de transações financeiras
- ✅ Mudanças de roles de usuários
- ✅ Exclusão de clientes
- ✅ Criação, edição e exclusão de profissionais

Cada log contém:

- ID do usuário que realizou a ação
- Email e role do usuário
- Tipo de ação (INSERT, UPDATE, DELETE)
- Tabela afetada
- ID do registro
- Dados antigos e novos (para UPDATE)
- Timestamp da ação

### Acesso aos Logs

- Apenas **admins** podem visualizar logs de auditoria
- Logs não podem ser editados ou deletados
- Logs são armazenados indefinidamente para compliance

---

## 🔧 Melhores Práticas

### Para Desenvolvedores

1. **Nunca exponha credenciais**

   - Use variáveis de ambiente para secrets
   - Nunca commite arquivos `.env.local`
   - Use `.env.example` como template

2. **Sempre valide inputs**

   - Use schemas Zod para validação
   - Valide tanto no client quanto no server
   - Sanitize dados antes de exibir

3. **Respeite as políticas RLS**

   - Sempre use o cliente Supabase autenticado
   - Não tente burlar políticas RLS
   - Teste com diferentes roles

4. **Use helpers de autenticação**
   - `getServerUser()` para obter usuário em Server Components
   - `requireAuth()` para garantir autenticação
   - `requireRole()` para verificar permissões

### Para Administradores

1. **Gerenciamento de Usuários**

   - Conceda apenas as permissões necessárias
   - Revise roles regularmente
   - Desative contas de usuários inativos

2. **Monitoramento**

   - Revise logs de auditoria regularmente
   - Investigue atividades suspeitas
   - Mantenha backups atualizados

3. **Atualizações**
   - Mantenha o sistema atualizado
   - Aplique patches de segurança prontamente
   - Teste atualizações em ambiente de staging

### Para Usuários

1. **Senhas Fortes**

   - Use senhas únicas e complexas
   - Não compartilhe suas credenciais
   - Troque senhas periodicamente

2. **Segurança da Sessão**
   - Sempre faça logout ao terminar
   - Não deixe sessões abertas em computadores compartilhados
   - Reporte atividades suspeitas

---

## 📞 Contato

Para questões relacionadas à segurança, entre em contato com a equipe de desenvolvimento.

**Última atualização**: Janeiro 2026

import { createClient } from "@/lib/supabase/client";

/**
 * Script de debug para testar o sistema de notificações
 * Execute no console do navegador (F12)
 */

async function debugNotifications() {
  const supabase = createClient();
  
  console.log("🔍 Iniciando diagnóstico do sistema de notificações...\n");
  
  // 1. Verificar autenticação
  console.log("1️⃣ Verificando autenticação...");
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    console.error("❌ Erro ao buscar usuário:", authError);
    return;
  }
  
  if (!user) {
    console.error("❌ Usuário não autenticado!");
    return;
  }
  
  console.log("✅ Usuário autenticado:", user.email);
  console.log("   User ID:", user.id);
  
  // 2. Verificar notificações no banco
  console.log("\n2️⃣ Verificando notificações no banco...");
  const { data: notifications, error: notifError } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);
  
  if (notifError) {
    console.error("❌ Erro ao buscar notificações:", notifError);
  } else {
    console.log(`✅ Encontradas ${notifications?.length || 0} notificações`);
    if (notifications && notifications.length > 0) {
      console.table(notifications.map(n => ({
        id: n.id.substring(0, 8) + "...",
        title: n.title,
        read: n.read_at ? "Sim" : "Não",
        created: new Date(n.created_at).toLocaleString("pt-BR")
      })));
    }
  }
  
  // 3. Contar não lidas
  console.log("\n3️⃣ Contando notificações não lidas...");
  const { count, error: countError } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);
  
  if (countError) {
    console.error("❌ Erro ao contar:", countError);
  } else {
    console.log(`✅ Notificações não lidas: ${count || 0}`);
  }
  
  // 4. Testar Realtime
  console.log("\n4️⃣ Testando conexão Realtime...");
  const channel = supabase
    .channel("test-notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        console.log("🎉 REALTIME FUNCIONANDO! Nova notificação recebida:", payload);
      }
    )
    .subscribe((status) => {
      console.log("📡 Status da subscrição Realtime:", status);
      
      if (status === "SUBSCRIBED") {
        console.log("✅ Realtime conectado com sucesso!");
        console.log("\n💡 Agora crie um agendamento e veja se a notificação aparece aqui.");
      } else if (status === "CHANNEL_ERROR") {
        console.error("❌ Erro ao conectar no Realtime!");
        console.error("   Verifique se o Realtime está habilitado no Supabase Dashboard");
        console.error("   Dashboard → Database → Replication → notifications");
      }
    });
  
  // 5. Verificar profissionais
  console.log("\n5️⃣ Verificando profissionais...");
  const { data: professionals, error: profError } = await supabase
    .from("professionals")
    .select("code, name, user_id");
  
  if (profError) {
    console.error("❌ Erro ao buscar profissionais:", profError);
  } else {
    console.log(`✅ Encontrados ${professionals?.length || 0} profissionais`);
    if (professionals) {
      console.table(professionals.map(p => ({
        code: p.code,
        name: p.name,
        has_user_id: p.user_id ? "✅ Sim" : "❌ Não"
      })));
      
      const withoutUserId = professionals.filter(p => !p.user_id);
      if (withoutUserId.length > 0) {
        console.warn(`⚠️ ${withoutUserId.length} profissional(is) sem user_id!`);
        console.warn("   Notificações NÃO serão criadas para estes profissionais.");
      }
    }
  }
  
  console.log("\n✅ Diagnóstico completo!");
  console.log("\n📝 Resumo:");
  console.log("   - Usuário autenticado:", user.email);
  console.log("   - Notificações no banco:", notifications?.length || 0);
  console.log("   - Não lidas:", count || 0);
  console.log("   - Profissionais:", professionals?.length || 0);
  
  // Retornar função para limpar o canal
  return () => {
    console.log("🧹 Limpando canal Realtime...");
    supabase.removeChannel(channel);
  };
}

// Executar automaticamente
debugNotifications().then((cleanup) => {
  console.log("\n💡 Para parar o monitoramento Realtime, execute: cleanup()");
  (window as any).cleanupNotifications = cleanup;
});

export {};

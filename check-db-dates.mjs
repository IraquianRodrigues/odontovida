import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseDates() {
  console.log("=== CHECKING DATABASE DATES ===\n");
  
  // Get the most recent transaction
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error:", error);
    return;
  }

  if (data && data.length > 0) {
    const transaction = data[0];
    console.log("Most recent transaction:");
    console.log("  ID:", transaction.id);
    console.log("  due_date (raw):", transaction.due_date);
    console.log("  due_date (type):", typeof transaction.due_date);
    console.log("  paid_date (raw):", transaction.paid_date);
    console.log("  paid_date (type):", typeof transaction.paid_date);
    console.log("  created_at:", transaction.created_at);
    
    // Test date parsing
    console.log("\n=== DATE PARSING TEST ===");
    const dueDate = new Date(transaction.due_date);
    console.log("  new Date(due_date):", dueDate.toString());
    console.log("  toLocaleDateString:", dueDate.toLocaleDateString("pt-BR"));
    console.log("  toISOString:", dueDate.toISOString());
  }
}

checkDatabaseDates();

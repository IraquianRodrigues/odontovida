import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTransactionDates() {
  console.log("=== CHECKING TRANSACTION DATES ===\n");
  
  const { data, error } = await supabase
    .from("transactions")
    .select("id, due_date, paid_date, payment_method, created_at, status")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Latest 10 transactions:");
  console.table(data);
  
  console.log("\n=== DATE ANALYSIS ===");
  data?.forEach((t, i) => {
    console.log(`\nTransaction ${i + 1}:`);
    console.log(`  ID: ${t.id}`);
    console.log(`  Due Date: ${t.due_date}`);
    console.log(`  Paid Date: ${t.paid_date || 'N/A'}`);
    console.log(`  Payment Method: ${t.payment_method || 'N/A'}`);
    console.log(`  Status: ${t.status}`);
    console.log(`  Created At: ${t.created_at}`);
  });
}

checkTransactionDates();

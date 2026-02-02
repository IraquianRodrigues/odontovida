const now = new Date();

console.log("=== TESTING DATE GENERATION ===");
console.log("Current time:", now.toString());

// Method 1: toLocaleDateString (what we're using)
const localDate = now.toLocaleDateString("pt-BR", { 
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const [day, month, year] = localDate.split("/");
const result = `${year}-${month}-${day}`;

console.log("\nMethod 1 (toLocaleDateString):");
console.log("  localDate:", localDate);
console.log("  Parsed:", { day, month, year });
console.log("  Result:", result);

// Method 2: toISOString (old buggy way)
const isoResult = now.toISOString().split('T')[0];
console.log("\nMethod 2 (toISOString - OLD):");
console.log("  Result:", isoResult);

console.log("\n=== COMPARISON ===");
console.log("New method:", result);
console.log("Old method:", isoResult);
console.log("Match?", result === isoResult ? "YES" : "NO - DIFFERENT!");

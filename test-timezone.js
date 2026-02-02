const now = new Date();

console.log("=== DEBUGGING TIMEZONE ===");
console.log("Current time:", now.toString());
console.log("ISO String:", now.toISOString());
console.log("ISO Split:", now.toISOString().split('T')[0]);

// Test toLocaleString approach
const year = now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", year: "numeric" });
const month = now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", month: "2-digit" });
const day = now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit" });

console.log("\n=== toLocaleString Parts ===");
console.log("Year:", year, typeof year);
console.log("Month:", month, typeof month);
console.log("Day:", day, typeof day);
console.log("Result:", `${year}-${month}-${day}`);

// Test alternative approach using toLocaleDateString
const localDate = now.toLocaleDateString("pt-BR", { 
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});
console.log("\n=== toLocaleDateString ===");
console.log("Full date:", localDate);

// Parse and convert
const [d, m, y] = localDate.split("/");
console.log("Parsed:", { day: d, month: m, year: y });
console.log("Formatted:", `${y}-${m}-${d}`);

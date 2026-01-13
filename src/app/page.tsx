import type React from "react";

import { LoginContent } from "@/components/login-content";
import { AuthServerService } from "@/services/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await AuthServerService.getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LoginContent />;

console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("SUPABASE KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

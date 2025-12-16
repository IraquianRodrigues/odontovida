import { AuthServerService } from "@/services/auth";
import ClientesContent from "./_components/clientes-content";
import { redirect } from "next/navigation";

export default async function ClientesPage() {
  const user = await AuthServerService.getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return <ClientesContent />;
}

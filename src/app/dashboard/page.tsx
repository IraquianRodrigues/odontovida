import { redirect } from "next/navigation";
import { AuthServerService } from "@/services/auth/server.service";
import DashboardContent from "./_components/content";

export default async function DashboardPage() {
  const user = await AuthServerService.getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return <DashboardContent />;
}

import { AuthServerService } from "@/services/auth";
import ProfessionalsContent from "./_components/professionals-content";
import { redirect } from "next/navigation";

export default async function ProfessionalsPage() {
  const user = await AuthServerService.getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return <ProfessionalsContent />;
}

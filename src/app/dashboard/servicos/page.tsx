import { AuthServerService } from "@/services/auth";
import ServicesContent from "./_components/services-content";
import { redirect } from "next/navigation";

export default async function ServicesPage() {
  const user = await AuthServerService.getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return <ServicesContent />;
}


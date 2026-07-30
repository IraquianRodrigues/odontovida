import { redirect } from "next/navigation";
import { AuthServerService } from "@/services/auth";
import CrmPipelineContent from "./_components/crm-pipeline-content";

export default async function CrmPage() {
  const user = await AuthServerService.getCurrentUser();

  if (!user) redirect("/");

  return <CrmPipelineContent />;
}

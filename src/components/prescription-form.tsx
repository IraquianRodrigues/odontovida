import { Card } from "@/components/ui/card";
export function PrescriptionForm({ recordId: _recordId }: { recordId: string | null }) { return <Card className="p-6 text-sm text-muted-foreground">Prescrições não estão disponíveis: o esquema conectado não possui prontuários ou prescrições.</Card>; }

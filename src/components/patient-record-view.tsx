"use client";
import { Button } from "@/components/ui/button";
export function PatientRecordView({ onBack }: { patientId: number; onBack: () => void }) { return <div className="space-y-4 p-6"><Button variant="outline" onClick={onBack}>Voltar</Button><p className="text-muted-foreground">Prontuários não estão disponíveis no esquema conectado.</p></div>; }

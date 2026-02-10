"use client";

import { Button } from "@/components/ui/button";
import { Eye, History, Calendar } from "lucide-react";
import type { MedicalRecord } from "@/services/medical-records/medical-records.service";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

interface RecordHistoryExpandableProps {
  history: MedicalRecord[];
}

const VITAL_LABELS: Record<string, { label: string; unit: string }> = {
  blood_pressure: { label: "Pressão Arterial", unit: "mmHg" },
  heart_rate: { label: "Freq. Cardíaca", unit: "bpm" },
  temperature: { label: "Temperatura", unit: "°C" },
  oxygen_saturation: { label: "Saturação O₂", unit: "%" },
  weight: { label: "Peso", unit: "kg" },
  height: { label: "Altura", unit: "cm" },
  bmi: { label: "IMC", unit: "" },
};

function VitalSignsDisplay({ vitals }: { vitals: any }) {
  if (!vitals || Object.keys(vitals).length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm">Sinais Vitais</h4>
      <div className="bg-background rounded-md p-3 grid grid-cols-2 md:grid-cols-3 gap-3">
        {vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic && (
          <div>
            <p className="text-xs text-muted-foreground">Pressão Arterial</p>
            <p className="text-sm font-medium">{vitals.blood_pressure_systolic}/{vitals.blood_pressure_diastolic} mmHg</p>
          </div>
        )}
        {(['heart_rate', 'temperature', 'oxygen_saturation', 'weight', 'height', 'bmi'] as const).map(key => {
          if (!vitals[key]) return null;
          const config = VITAL_LABELS[key];
          return (
            <div key={key}>
              <p className="text-xs text-muted-foreground">{config.label}</p>
              <p className="text-sm font-medium">{vitals[key]}{config.unit ? ` ${config.unit}` : ''}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SoapSection({ label, content }: { label: string; content: string | null }) {
  if (!content) return null;
  return (
    <div className="bg-background rounded-md p-3">
      <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
      <p className="text-sm whitespace-pre-wrap">{content}</p>
    </div>
  );
}

export function RecordHistoryExpandable({ history }: RecordHistoryExpandableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Nenhum prontuário anterior encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((record) => {
        const isExpanded = expandedId === record.id;
        return (
          <div key={record.id} className="border border-border rounded-lg overflow-hidden">
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  {format(new Date(record.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Dr(a). {record.professional?.name || "Não informado"}
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => setExpandedId(isExpanded ? null : record.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    {isExpanded ? "Ocultar" : "Ver Detalhes"}
                  </Button>
                </div>
              </div>

              {!isExpanded && (
                <>
                  {record.soap_subjective && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Subjetivo:</p>
                      <p className="text-sm line-clamp-2">{record.soap_subjective}</p>
                    </div>
                  )}
                  {record.soap_assessment && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Avaliação:</p>
                      <p className="text-sm line-clamp-2">{record.soap_assessment}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {isExpanded && (
              <div className="border-t border-border bg-muted/30 p-4 space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Método SOAP</h4>
                  <SoapSection label="S - Subjetivo" content={record.soap_subjective} />
                  <SoapSection label="O - Objetivo" content={record.soap_objective} />
                  <SoapSection label="A - Avaliação" content={record.soap_assessment} />
                  <SoapSection label="P - Plano" content={record.soap_plan} />
                </div>

                <VitalSignsDisplay vitals={record.vital_signs} />

                {record.observations && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Observações</h4>
                    <div className="bg-background rounded-md p-3">
                      <p className="text-sm whitespace-pre-wrap">{record.observations}</p>
                    </div>
                  </div>
                )}

                {record.clinical_notes && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Notas Clínicas</h4>
                    <div className="bg-background rounded-md p-3">
                      <p className="text-sm whitespace-pre-wrap">{record.clinical_notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SoapFormData {
  soap_subjective: string;
  soap_objective: string;
  soap_assessment: string;
  soap_plan: string;
}

interface SoapFormProps {
  formData: SoapFormData;
  onFieldChange: (field: keyof SoapFormData, value: string) => void;
}

const SOAP_FIELDS: { key: keyof SoapFormData; label: string; description: string; placeholder: string }[] = [
  {
    key: "soap_subjective",
    label: "S - Subjetivo",
    description: "Queixa principal, sintomas, história da doença atual, antecedentes",
    placeholder: "Ex: Paciente relata dor de cabeça há 3 dias, localizada na região frontal...",
  },
  {
    key: "soap_objective",
    label: "O - Objetivo",
    description: "Exame físico, resultados de exames, achados clínicos",
    placeholder: "Ex: Paciente consciente, orientado. PA: 120/80 mmHg. Ausculta pulmonar sem alterações...",
  },
  {
    key: "soap_assessment",
    label: "A - Avaliação",
    description: "Hipótese diagnóstica, diagnóstico diferencial, raciocínio clínico",
    placeholder: "Ex: Hipótese diagnóstica: Cefaleia tensional. Diagnóstico diferencial: Enxaqueca...",
  },
  {
    key: "soap_plan",
    label: "P - Plano",
    description: "Condutas, medicações, exames solicitados, orientações, retorno",
    placeholder: "Ex: Prescrever analgésico. Solicitar hemograma completo. Orientar repouso. Retorno em 7 dias...",
  },
];

export function SoapForm({ formData, onFieldChange }: SoapFormProps) {
  return (
    <div className="space-y-6">
      {SOAP_FIELDS.map(({ key, label, description, placeholder }) => (
        <div key={key}>
          <Label
            htmlFor={key}
            className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2"
          >
            <div className="h-1 w-8 bg-primary rounded-full" />
            {label}
          </Label>
          <p className="text-xs text-muted-foreground mb-3 pl-10">{description}</p>
          <Textarea
            id={key}
            placeholder={placeholder}
            value={formData[key]}
            onChange={(e) => onFieldChange(key, e.target.value)}
            className="rounded-sm border-border/50 bg-card focus:border-primary/50 focus:ring-primary/20 focus:shadow-sm min-h-[140px] resize-y transition-all duration-300"
          />
        </div>
      ))}
    </div>
  );
}

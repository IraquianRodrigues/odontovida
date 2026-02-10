"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import type { VitalSigns } from "@/services/medical-records";

interface VitalSignsFormProps {
  value: VitalSigns;
  onChange: (value: VitalSigns) => void;
}

// Validation functions
const validateBloodPressure = (systolic?: number, diastolic?: number) => {
  if (!systolic || !diastolic) return null;
  
  // Crise Hipertensiva (≥180/≥120) - CRÍTICO
  if (systolic >= 180 || diastolic >= 120) {
    return { status: "critical", message: "Crise Hipertensiva", color: "bg-red-500" };
  }
  
  // Hipertensão Estágio 2 (≥140/≥90) - CRÍTICO
  if (systolic >= 140 || diastolic >= 90) {
    return { status: "critical", message: "Hipertensão Estágio 2", color: "bg-red-500" };
  }
  
  // Hipertensão Estágio 1 (130-139/80-89) - ATENÇÃO
  if ((systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) {
    return { status: "warning", message: "Hipertensão Estágio 1", color: "bg-yellow-500" };
  }
  
  // Pré-hipertensão (120-129/<80 ou 130-139/80-89) - ATENÇÃO
  if ((systolic >= 120 && systolic < 130 && diastolic < 80) || 
      (systolic >= 130 && systolic < 140 && diastolic >= 80 && diastolic < 90)) {
    return { status: "warning", message: "Pré-hipertensão", color: "bg-yellow-500" };
  }
  
  // Hipotensão (<90/60) - ATENÇÃO
  if (systolic < 90 || diastolic < 60) {
    return { status: "warning", message: "Hipotensão", color: "bg-yellow-500" };
  }
  
  // Normal (<120/80)
  return { status: "normal", message: "Normal", color: "bg-green-500" };
};

const validateHeartRate = (rate?: number) => {
  if (!rate) return null;
  
  if (rate > 120 || rate < 40) {
    return { status: "critical", message: "Crítico", color: "bg-red-500" };
  }
  if (rate > 100 || rate < 60) {
    return { status: "warning", message: "Atenção", color: "bg-yellow-500" };
  }
  return { status: "normal", message: "Normal", color: "bg-green-500" };
};

const validateTemperature = (temp?: number) => {
  if (!temp) return null;
  
  if (temp >= 39 || temp < 35) {
    return { status: "critical", message: "Crítico", color: "bg-red-500" };
  }
  if (temp >= 37.5 || temp < 35.5) {
    return { status: "warning", message: "Febre/Hipotermia", color: "bg-yellow-500" };
  }
  return { status: "normal", message: "Normal", color: "bg-green-500" };
};

const validateOxygenSaturation = (sat?: number) => {
  if (!sat) return null;
  
  if (sat < 90) {
    return { status: "critical", message: "Crítico", color: "bg-red-500" };
  }
  if (sat < 95) {
    return { status: "warning", message: "Baixa", color: "bg-yellow-500" };
  }
  return { status: "normal", message: "Normal", color: "bg-green-500" };
};

const validateBMI = (bmi?: number) => {
  if (!bmi) return null;
  
  if (bmi < 16 || bmi >= 35) {
    return { status: "critical", label: bmi < 16 ? "Magreza Grave" : "Obesidade Grave", color: "bg-red-500" };
  }
  if (bmi < 18.5 || bmi >= 30) {
    return { status: "warning", label: bmi < 18.5 ? "Abaixo do peso" : "Obesidade", color: "bg-yellow-500" };
  }
  if (bmi >= 25) {
    return { status: "warning", label: "Sobrepeso", color: "bg-yellow-500" };
  }
  return { status: "normal", label: "Peso normal", color: "bg-green-500" };
};

export function VitalSignsForm({ value, onChange }: VitalSignsFormProps) {
  const [localValue, setLocalValue] = useState<VitalSigns>(value || {});

  // Calcular IMC automaticamente
  useEffect(() => {
    if (localValue.weight && localValue.height) {
      const heightInMeters = localValue.height / 100;
      const bmi = localValue.weight / (heightInMeters * heightInMeters);
      setLocalValue((prev) => ({ ...prev, bmi: Math.round(bmi * 10) / 10 }));
    }
  }, [localValue.weight, localValue.height]);

  // Propagar mudanças para o componente pai
  useEffect(() => {
    onChange(localValue);
  }, [localValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field: keyof VitalSigns, value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    setLocalValue((prev) => ({ ...prev, [field]: numValue }));
  };

  const bpValidation = validateBloodPressure(
    localValue.blood_pressure_systolic,
    localValue.blood_pressure_diastolic
  );
  const hrValidation = validateHeartRate(localValue.heart_rate);
  const tempValidation = validateTemperature(localValue.temperature);
  const o2Validation = validateOxygenSaturation(localValue.oxygen_saturation);
  const bmiValidation = validateBMI(localValue.bmi);

  const ValidationBadge = ({ validation }: { validation: any }) => {
    if (!validation) return null;
    
    const Icon = validation.status === "critical" ? AlertCircle : 
                 validation.status === "warning" ? AlertTriangle : CheckCircle;
    
    return (
      <Badge 
        variant="outline" 
        className={`${validation.color} text-white border-0 flex items-center gap-1.5 mt-2`}
      >
        <Icon className="h-3 w-3" />
        {validation.message || validation.label}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Pressão Arterial */}
      <div className="space-y-2">
        <Label>Pressão Arterial (mmHg)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Sistólica"
            value={localValue.blood_pressure_systolic || ""}
            onChange={(e) =>
              handleChange("blood_pressure_systolic", e.target.value)
            }
            className={bpValidation?.status === "critical" ? "border-red-500" : 
                      bpValidation?.status === "warning" ? "border-yellow-500" : ""}
          />
          <span className="text-muted-foreground">/</span>
          <Input
            type="number"
            placeholder="Diastólica"
            value={localValue.blood_pressure_diastolic || ""}
            onChange={(e) =>
              handleChange("blood_pressure_diastolic", e.target.value)
            }
            className={bpValidation?.status === "critical" ? "border-red-500" : 
                      bpValidation?.status === "warning" ? "border-yellow-500" : ""}
          />
        </div>
        <ValidationBadge validation={bpValidation} />
      </div>

      {/* Frequência Cardíaca */}
      <div className="space-y-2">
        <Label htmlFor="heart_rate">Frequência Cardíaca (bpm)</Label>
        <Input
          id="heart_rate"
          type="number"
          placeholder="Ex: 72"
          value={localValue.heart_rate || ""}
          onChange={(e) => handleChange("heart_rate", e.target.value)}
          className={hrValidation?.status === "critical" ? "border-red-500" : 
                    hrValidation?.status === "warning" ? "border-yellow-500" : ""}
        />
        <ValidationBadge validation={hrValidation} />
      </div>

      {/* Temperatura */}
      <div className="space-y-2">
        <Label htmlFor="temperature">Temperatura (°C)</Label>
        <Input
          id="temperature"
          type="number"
          step="0.1"
          placeholder="Ex: 36.5"
          value={localValue.temperature || ""}
          onChange={(e) => handleChange("temperature", e.target.value)}
          className={tempValidation?.status === "critical" ? "border-red-500" : 
                    tempValidation?.status === "warning" ? "border-yellow-500" : ""}
        />
        <ValidationBadge validation={tempValidation} />
      </div>

      {/* Saturação O2 */}
      <div className="space-y-2">
        <Label htmlFor="oxygen_saturation">Saturação O₂ (%)</Label>
        <Input
          id="oxygen_saturation"
          type="number"
          placeholder="Ex: 98"
          value={localValue.oxygen_saturation || ""}
          onChange={(e) => handleChange("oxygen_saturation", e.target.value)}
          className={o2Validation?.status === "critical" ? "border-red-500" : 
                    o2Validation?.status === "warning" ? "border-yellow-500" : ""}
        />
        <ValidationBadge validation={o2Validation} />
      </div>

      {/* Peso */}
      <div className="space-y-2">
        <Label htmlFor="weight">Peso (kg)</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          placeholder="Ex: 70.5"
          value={localValue.weight || ""}
          onChange={(e) => handleChange("weight", e.target.value)}
        />
      </div>

      {/* Altura */}
      <div className="space-y-2">
        <Label htmlFor="height">Altura (cm)</Label>
        <Input
          id="height"
          type="number"
          placeholder="Ex: 175"
          value={localValue.height || ""}
          onChange={(e) => handleChange("height", e.target.value)}
        />
      </div>

      {/* IMC (calculado automaticamente) */}
      {localValue.bmi && (
        <div className="md:col-span-2 p-4 bg-muted/30 rounded-sm border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">Índice de Massa Corporal (IMC)</Label>
              <p className="text-3xl font-bold mt-2 tabular-nums">{localValue.bmi}</p>
            </div>
            <div className="text-right">
              <ValidationBadge validation={bmiValidation} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

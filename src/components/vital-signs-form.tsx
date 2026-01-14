"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VitalSigns } from "@/services/medical-records.service";

interface VitalSignsFormProps {
  value: VitalSigns;
  onChange: (value: VitalSigns) => void;
}

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
          />
          <span className="text-muted-foreground">/</span>
          <Input
            type="number"
            placeholder="Diastólica"
            value={localValue.blood_pressure_diastolic || ""}
            onChange={(e) =>
              handleChange("blood_pressure_diastolic", e.target.value)
            }
          />
        </div>
        {localValue.blood_pressure_systolic && localValue.blood_pressure_diastolic && (
          <p className="text-sm text-muted-foreground">
            {localValue.blood_pressure_systolic}/{localValue.blood_pressure_diastolic} mmHg
          </p>
        )}
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
        />
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
        />
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
        />
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
        <div className="md:col-span-2 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Índice de Massa Corporal (IMC)</Label>
              <p className="text-2xl font-bold mt-1">{localValue.bmi}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {localValue.bmi < 18.5 && "Abaixo do peso"}
                {localValue.bmi >= 18.5 && localValue.bmi < 25 && "Peso normal"}
                {localValue.bmi >= 25 && localValue.bmi < 30 && "Sobrepeso"}
                {localValue.bmi >= 30 && "Obesidade"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

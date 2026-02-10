"use client";

import { useState, useEffect } from "react";
import { useAnamnesisByRecordId, useCreateAnamnesis, useUpdateAnamnesis } from "@/services/anamnesis/use-anamnesis";
import type { SmokingStatus, YesNo } from "@/services/anamnesis";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface AnamnesisFormProps {
  recordId: string | null;
  onChange?: (data: any) => void;
}

export function AnamnesisForm({ recordId, onChange }: AnamnesisFormProps) {
  const { data: existingAnamnesis } = useAnamnesisByRecordId(recordId);
  
  const [formData, setFormData] = useState({
    chief_complaint: "",
    history_present_illness: "",
    onset: "",
    evolution: "",
    intensity: "",
    aggravating_factors: "",
    relieving_factors: "",
    associated_symptoms: "",
    previous_treatments: "",
    surgical_history: "",
    hospitalizations: "",
    chronic_diseases: "",
    smoking: "no" as SmokingStatus,
    alcohol: "no" as YesNo,
    drugs: "no" as YesNo,
    sleep_quality: "",
    diet_quality: "",
    physical_activity: "",
    vaccination_status: "",
  });

  useEffect(() => {
    if (existingAnamnesis) {
      setFormData({
        chief_complaint: existingAnamnesis.chief_complaint || "",
        history_present_illness: existingAnamnesis.history_present_illness || "",
        onset: existingAnamnesis.onset || "",
        evolution: existingAnamnesis.evolution || "",
        intensity: existingAnamnesis.intensity || "",
        aggravating_factors: existingAnamnesis.aggravating_factors || "",
        relieving_factors: existingAnamnesis.relieving_factors || "",
        associated_symptoms: existingAnamnesis.associated_symptoms || "",
        previous_treatments: existingAnamnesis.previous_treatments || "",
        surgical_history: existingAnamnesis.surgical_history || "",
        hospitalizations: existingAnamnesis.hospitalizations || "",
        chronic_diseases: existingAnamnesis.chronic_diseases || "",
        smoking: existingAnamnesis.smoking || "no",
        alcohol: existingAnamnesis.alcohol || "no",
        drugs: existingAnamnesis.drugs || "no",
        sleep_quality: existingAnamnesis.sleep_quality || "",
        diet_quality: existingAnamnesis.diet_quality || "",
        physical_activity: existingAnamnesis.physical_activity || "",
        vaccination_status: existingAnamnesis.vaccination_status || "",
      });
    }
  }, [existingAnamnesis]);

  useEffect(() => {
    onChange?.(formData);
  }, [formData, onChange]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Accordion type="multiple" className="w-full" defaultValue={["complaint", "history"]}>
      {/* Queixa Principal e HDA */}
      <AccordionItem value="complaint">
        <AccordionTrigger className="text-base font-semibold">
          Queixa Principal e História da Doença Atual
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-4">
          <div>
            <Label htmlFor="chief_complaint">Queixa Principal</Label>
            <Textarea
              id="chief_complaint"
              value={formData.chief_complaint}
              onChange={(e) => handleChange("chief_complaint", e.target.value)}
              placeholder="Motivo da consulta, sintoma principal..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="history_present_illness">História da Doença Atual</Label>
            <Textarea
              id="history_present_illness"
              value={formData.history_present_illness}
              onChange={(e) => handleChange("history_present_illness", e.target.value)}
              placeholder="Como começou, quando começou, evolução..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="onset">Início</Label>
              <Textarea
                id="onset"
                value={formData.onset}
                onChange={(e) => handleChange("onset", e.target.value)}
                placeholder="Quando começou..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="evolution">Evolução</Label>
              <Textarea
                id="evolution"
                value={formData.evolution}
                onChange={(e) => handleChange("evolution", e.target.value)}
                placeholder="Como evoluiu..."
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="intensity">Intensidade</Label>
              <Textarea
                id="intensity"
                value={formData.intensity}
                onChange={(e) => handleChange("intensity", e.target.value)}
                placeholder="Leve, moderada, intensa..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="associated_symptoms">Sintomas Associados</Label>
              <Textarea
                id="associated_symptoms"
                value={formData.associated_symptoms}
                onChange={(e) => handleChange("associated_symptoms", e.target.value)}
                placeholder="Outros sintomas..."
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="aggravating_factors">Fatores de Piora</Label>
              <Textarea
                id="aggravating_factors"
                value={formData.aggravating_factors}
                onChange={(e) => handleChange("aggravating_factors", e.target.value)}
                placeholder="O que piora os sintomas..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="relieving_factors">Fatores de Melhora</Label>
              <Textarea
                id="relieving_factors"
                value={formData.relieving_factors}
                onChange={(e) => handleChange("relieving_factors", e.target.value)}
                placeholder="O que melhora os sintomas..."
                rows={2}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="previous_treatments">Tratamentos Anteriores</Label>
            <Textarea
              id="previous_treatments"
              value={formData.previous_treatments}
              onChange={(e) => handleChange("previous_treatments", e.target.value)}
              placeholder="Tratamentos já realizados..."
              rows={2}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Antecedentes */}
      <AccordionItem value="history">
        <AccordionTrigger className="text-base font-semibold">
          Antecedentes Pessoais
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-4">
          <div>
            <Label htmlFor="surgical_history">Cirurgias Anteriores</Label>
            <Textarea
              id="surgical_history"
              value={formData.surgical_history}
              onChange={(e) => handleChange("surgical_history", e.target.value)}
              placeholder="Cirurgias realizadas..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="hospitalizations">Internações</Label>
            <Textarea
              id="hospitalizations"
              value={formData.hospitalizations}
              onChange={(e) => handleChange("hospitalizations", e.target.value)}
              placeholder="Internações hospitalares..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="chronic_diseases">Doenças Crônicas</Label>
            <Textarea
              id="chronic_diseases"
              value={formData.chronic_diseases}
              onChange={(e) => handleChange("chronic_diseases", e.target.value)}
              placeholder="Hipertensão, diabetes, etc..."
              rows={2}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Hábitos de Vida */}
      <AccordionItem value="habits">
        <AccordionTrigger className="text-base font-semibold">
          Hábitos de Vida
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="smoking">Tabagismo</Label>
              <Select
                value={formData.smoking}
                onValueChange={(value) => handleChange("smoking", value as SmokingStatus)}
              >
                <SelectTrigger id="smoking">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Não</SelectItem>
                  <SelectItem value="yes">Sim</SelectItem>
                  <SelectItem value="former">Ex-fumante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="alcohol">Etilismo</Label>
              <Select
                value={formData.alcohol}
                onValueChange={(value) => handleChange("alcohol", value as YesNo)}
              >
                <SelectTrigger id="alcohol">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Não</SelectItem>
                  <SelectItem value="yes">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="drugs">Drogas</Label>
              <Select
                value={formData.drugs}
                onValueChange={(value) => handleChange("drugs", value as YesNo)}
              >
                <SelectTrigger id="drugs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Não</SelectItem>
                  <SelectItem value="yes">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sleep_quality">Qualidade do Sono</Label>
              <Textarea
                id="sleep_quality"
                value={formData.sleep_quality}
                onChange={(e) => handleChange("sleep_quality", e.target.value)}
                placeholder="Boa, ruim, insônia..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="diet_quality">Alimentação</Label>
              <Textarea
                id="diet_quality"
                value={formData.diet_quality}
                onChange={(e) => handleChange("diet_quality", e.target.value)}
                placeholder="Balanceada, irregular..."
                rows={2}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="physical_activity">Atividade Física</Label>
            <Textarea
              id="physical_activity"
              value={formData.physical_activity}
              onChange={(e) => handleChange("physical_activity", e.target.value)}
              placeholder="Sedentário, ativo, tipo de atividade..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="vaccination_status">Situação Vacinal</Label>
            <Textarea
              id="vaccination_status"
              value={formData.vaccination_status}
              onChange={(e) => handleChange("vaccination_status", e.target.value)}
              placeholder="Vacinas em dia, pendentes..."
              rows={2}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

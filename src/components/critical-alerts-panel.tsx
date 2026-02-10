"use client";

import { useState } from "react";
import { useActiveCriticalAlerts, useCreateCriticalAlert, useDeactivateCriticalAlert } from "@/services/critical-alerts/use-critical-alerts";
import type { AlertType, AlertSeverity } from "@/services/critical-alerts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Plus, X, AlertCircle, Info, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CriticalAlertsPanelProps {
  clientId: number;
}

export function CriticalAlertsPanel({ clientId }: CriticalAlertsPanelProps) {
  const { toast } = useToast();
  const { data: alerts = [], isLoading } = useActiveCriticalAlerts(clientId);
  const createMutation = useCreateCriticalAlert();
  const deactivateMutation = useDeactivateCriticalAlert();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    alert_type: "allergy" as AlertType,
    description: "",
    severity: "moderate" as AlertSeverity,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMutation.mutateAsync({
        client_id: clientId,
        ...formData,
      });

      toast({
        title: "Alerta criado",
        description: "O alerta crítico foi adicionado com sucesso.",
      });

      setFormData({
        alert_type: "allergy",
        description: "",
        severity: "moderate",
        notes: "",
      });
      setShowForm(false);
    } catch (error: any) {
      toast({
        title: "Erro ao criar alerta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateMutation.mutateAsync(id);
      toast({
        title: "Alerta desativado",
        description: "O alerta foi desativado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao desativar alerta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getSeverityConfig = (severity: AlertSeverity) => {
    const configs = {
      low: {
        bg: "bg-blue-50 dark:bg-blue-950/30",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-900 dark:text-blue-100",
        icon: Info,
        label: "Baixa",
      },
      moderate: {
        bg: "bg-yellow-50 dark:bg-yellow-950/30",
        border: "border-yellow-200 dark:border-yellow-800",
        text: "text-yellow-900 dark:text-yellow-100",
        icon: AlertCircle,
        label: "Moderada",
      },
      high: {
        bg: "bg-orange-50 dark:bg-orange-950/30",
        border: "border-orange-200 dark:border-orange-800",
        text: "text-orange-900 dark:text-orange-100",
        icon: AlertTriangle,
        label: "Alta",
      },
      critical: {
        bg: "bg-red-50 dark:bg-red-950/30",
        border: "border-red-200 dark:border-red-800",
        text: "text-red-900 dark:text-red-100",
        icon: ShieldAlert,
        label: "Crítica",
      },
    };
    return configs[severity];
  };

  const getAlertTypeLabel = (type: AlertType) => {
    const labels = {
      allergy: "Alergia",
      medication: "Medicamento",
      condition: "Condição",
      restriction: "Restrição",
    };
    return labels[type];
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Carregando alertas...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const config = getSeverityConfig(alert.severity);
            const Icon = config.icon;

            return (
              <Card
                key={alert.id}
                className={cn(
                  "p-4 border-2",
                  config.bg,
                  config.border
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-sm", config.bg)}>
                    <Icon className={cn("h-5 w-5", config.text)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("text-xs font-semibold uppercase", config.text)}>
                            {getAlertTypeLabel(alert.alert_type)}
                          </span>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", config.bg, config.text)}>
                            {config.label}
                          </span>
                        </div>
                        <p className={cn("font-semibold", config.text)}>
                          {alert.description}
                        </p>
                        {alert.notes && (
                          <p className={cn("text-sm mt-1", config.text, "opacity-80")}>
                            {alert.notes}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeactivate(alert.id)}
                        disabled={deactivateMutation.isPending}
                        className={cn("shrink-0", config.text)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Alert Button */}
      {!showForm && (
        <Button
          variant="outline"
          onClick={() => setShowForm(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Alerta Crítico
        </Button>
      )}

      {/* Add Alert Form */}
      {showForm && (
        <Card className="p-4 border-2 border-primary/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Novo Alerta Crítico</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="alert_type">Tipo</Label>
                <Select
                  value={formData.alert_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, alert_type: value as AlertType })
                  }
                >
                  <SelectTrigger id="alert_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allergy">Alergia</SelectItem>
                    <SelectItem value="medication">Medicamento</SelectItem>
                    <SelectItem value="condition">Condição</SelectItem>
                    <SelectItem value="restriction">Restrição</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="severity">Severidade</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) =>
                    setFormData({ ...formData, severity: value as AlertSeverity })
                  }
                >
                  <SelectTrigger id="severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="moderate">Moderada</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ex: Alergia a Dipirona"
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Informações adicionais sobre o alerta..."
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? "Salvando..." : "Salvar Alerta"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Empty State */}
      {alerts.length === 0 && !showForm && (
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum alerta crítico registrado</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import type { AppointmentWithRelations } from "@/types/database.types";
import { formatTimeBR } from "@/lib/date-utils";

interface AppointmentActionsProps {
  appointment: AppointmentWithRelations;
  onComplete: (appointment: AppointmentWithRelations) => void;
  onUncomplete: (appointmentId: number) => void;
  onViewDetails: (appointment: AppointmentWithRelations) => void;
  isUncompleting?: boolean;
  variant?: "mobile" | "desktop";
}

export function AppointmentActions({
  appointment, onComplete, onUncomplete, onViewDetails, isUncompleting, variant = "desktop",
}: AppointmentActionsProps) {
  const isCompleted = appointment.completed_at !== null;
  const isMobile = variant === "mobile";

  return (
    <div className={`flex ${isMobile ? "gap-2" : "items-center gap-2"}`}>
      {isCompleted ? (
        <Button
          variant="default"
          size="sm"
          onClick={() => onUncomplete(appointment.id)}
          disabled={isUncompleting}
          className={`bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white shadow-none border border-transparent ${
            isMobile ? "flex-1 h-9 text-xs" : "h-8 px-3 text-xs"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
          Concluído
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onComplete(appointment)}
          className={`border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-800 dark:hover:text-green-300 transition-colors ${
            isMobile ? "flex-1 h-9 text-xs" : "h-8 px-3 text-xs"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
          Concluir
        </Button>
      )}
      <Button
        variant={isMobile ? "outline" : "ghost"}
        size="sm"
        onClick={() => onViewDetails(appointment)}
        className={isMobile
          ? "flex-1 h-9 text-xs rounded-xl border-input hover:bg-muted hover:text-foreground transition-all font-medium"
          : "h-8 px-3 text-xs text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        }
      >
        Ver Detalhes
      </Button>
    </div>
  );
}

interface AppointmentMobileCardProps {
  appointment: AppointmentWithRelations;
  onComplete: (appointment: AppointmentWithRelations) => void;
  onUncomplete: (appointmentId: number) => void;
  onViewDetails: (appointment: AppointmentWithRelations) => void;
  isUncompleting?: boolean;
}

export function AppointmentMobileCard({
  appointment, onComplete, onUncomplete, onViewDetails, isUncompleting,
}: AppointmentMobileCardProps) {
  const isCompleted = appointment.completed_at !== null;

  return (
    <div className={`p-4 border rounded-2xl transition-all ${
      isCompleted ? "bg-green-50/30 border-green-100 dark:bg-green-900/20 dark:border-green-900/50" : "bg-card border-border"
    }`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold text-base truncate ${
                isCompleted ? "text-green-700 dark:text-green-400" : "text-card-foreground"
              }`}>
                {appointment.customer_name}
              </h3>
              {isCompleted && (
                <Badge variant="outline" className="bg-green-100/50 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-[10px] px-1.5 py-0 h-5">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Concluído
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-mono">{appointment.customer_phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Médico</p>
            <p className="font-medium text-foreground">{appointment.professional?.name || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Procedimento</p>
            <p className="font-medium text-foreground truncate">{appointment.service?.code || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Início</p>
            <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted/80 border-0 font-mono font-medium">
              {formatTimeBR(appointment.start_time)}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Fim</p>
            <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted/80 border-0 font-mono font-medium">
              {formatTimeBR(appointment.end_time)}
            </Badge>
          </div>
        </div>

        <div className="pt-2">
          <AppointmentActions
            appointment={appointment}
            onComplete={onComplete}
            onUncomplete={onUncomplete}
            onViewDetails={onViewDetails}
            isUncompleting={isUncompleting}
            variant="mobile"
          />
        </div>
      </div>
    </div>
  );
}

interface AppointmentTableRowProps {
  appointment: AppointmentWithRelations;
  onComplete: (appointment: AppointmentWithRelations) => void;
  onUncomplete: (appointmentId: number) => void;
  onViewDetails: (appointment: AppointmentWithRelations) => void;
  isUncompleting?: boolean;
}

export function AppointmentTableRow({
  appointment, onComplete, onUncomplete, onViewDetails, isUncompleting,
}: AppointmentTableRowProps) {
  const isCompleted = appointment.completed_at !== null;

  return (
    <tr className={`group transition-colors hover:bg-muted/50 ${isCompleted ? "bg-green-50/30 dark:bg-green-900/10" : ""}`}>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className={`font-medium transition-colors ${
            isCompleted ? "text-green-700 dark:text-green-400" : "text-foreground group-hover:text-primary"
          }`}>
            {appointment.customer_name}
          </span>
          {isCompleted && (
            <Badge variant="outline" className="bg-green-100/50 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-[10px] px-1.5 py-0 h-5">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Concluído
            </Badge>
          )}
        </div>
      </td>
      <td className="p-4">
        <span className="text-sm text-muted-foreground font-mono">{appointment.customer_phone}</span>
      </td>
      <td className="p-4">
        <span className="text-sm text-foreground font-medium">{appointment.professional?.name || "N/A"}</span>
      </td>
      <td className="p-4">
        <span className="text-sm text-foreground">{appointment.service?.code || "N/A"}</span>
      </td>
      <td className="p-4">
        <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted/80 border-0 font-mono font-medium">
          {formatTimeBR(appointment.start_time)}
        </Badge>
      </td>
      <td className="p-4">
        <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted/80 border-0 font-mono font-medium">
          {formatTimeBR(appointment.end_time)}
        </Badge>
      </td>
      <td className="p-4">
        <AppointmentActions
          appointment={appointment}
          onComplete={onComplete}
          onUncomplete={onUncomplete}
          onViewDetails={onViewDetails}
          isUncompleting={isUncompleting}
          variant="desktop"
        />
      </td>
    </tr>
  );
}

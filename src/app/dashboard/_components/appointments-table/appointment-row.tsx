"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import type { AppointmentWithRelations } from "@/types/database.types";
import { formatTimeBR } from "@/lib/date-utils";

interface AppointmentActionsProps {
  appointment: AppointmentWithRelations;
  onComplete: (appointment: AppointmentWithRelations) => void;
  onUncomplete: (appointmentId: string | number) => void;
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
          variant="secondary"
          size="sm"
          onClick={() => onUncomplete(appointment.id)}
          disabled={isUncompleting}
          className={`border border-primary/15 bg-primary/10 text-primary shadow-none hover:bg-primary/15 ${
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
          className={`border-primary/25 text-primary hover:bg-primary/10 hover:text-primary ${
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
          ? "h-9 flex-1 rounded-lg border-input text-xs font-medium hover:bg-muted hover:text-foreground"
          : "h-8 rounded-lg px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
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
  onUncomplete: (appointmentId: string | number) => void;
  onViewDetails: (appointment: AppointmentWithRelations) => void;
  isUncompleting?: boolean;
}

export function AppointmentMobileCard({
  appointment, onComplete, onUncomplete, onViewDetails, isUncompleting,
}: AppointmentMobileCardProps) {
  const isCompleted = appointment.completed_at !== null;

  return (
    <div className={`rounded-xl border p-4 ${
      isCompleted ? "border-primary/20 bg-primary/5" : "border-border bg-card"
    }`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold text-base truncate ${
                isCompleted ? "text-primary" : "text-card-foreground"
              }`}>
                {appointment.customer_name}
              </h3>
              {isCompleted && (
                <Badge variant="outline" className="h-5 border-primary/20 bg-primary/10 px-1.5 py-0 text-[10px] text-primary">
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
            <p className="truncate font-medium text-foreground">
              {appointment.service?.description || appointment.service?.code || "N/A"}
            </p>
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
  onUncomplete: (appointmentId: string | number) => void;
  onViewDetails: (appointment: AppointmentWithRelations) => void;
  isUncompleting?: boolean;
}

export function AppointmentTableRow({
  appointment, onComplete, onUncomplete, onViewDetails, isUncompleting,
}: AppointmentTableRowProps) {
  const isCompleted = appointment.completed_at !== null;

  return (
    <tr className={`group transition-colors hover:bg-muted/40 ${isCompleted ? "bg-primary/[0.03]" : ""}`}>
      <td className="px-5 py-4">
        <p className="font-mono text-sm font-semibold text-foreground">
          {formatTimeBR(appointment.start_time)}
        </p>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
          até {formatTimeBR(appointment.end_time)}
        </p>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <span className={`font-medium ${
            isCompleted ? "text-primary" : "text-foreground"
          }`}>
            {appointment.customer_name}
          </span>
          {isCompleted && (
            <Badge variant="outline" className="h-5 border-primary/20 bg-primary/10 px-1.5 py-0 text-[10px] text-primary">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Concluído
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {appointment.customer_phone}
        </p>
      </td>
      <td className="px-5 py-4">
        <span className="text-sm text-foreground">
          {appointment.service?.description || appointment.service?.code || "N/A"}
        </span>
      </td>
      <td className="px-5 py-4">
        <span className="text-sm font-medium text-foreground">
          {appointment.professional?.name || "N/A"}
        </span>
      </td>
      <td className="px-5 py-4">
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

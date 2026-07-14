"use client";

import { useMemo, useState } from "react";
import { AppointmentWithRelations } from "@/types/database.types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Tag, Ghost } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    DragEndEvent,
    DragStartEvent,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { useUpdateAppointmentStatus } from "@/services/appointments/use-appointments";
import { toast } from "sonner";

interface AppointmentsKanbanProps {
    appointments: AppointmentWithRelations[];
    isLoading: boolean;
}

// Definição das colunas do Kanban
const COLUMNS = [
    { id: "pending", title: "Agendado", color: "bg-blue-500", lightColor: "bg-blue-50" },
    { id: "confirmed", title: "Confirmado", color: "bg-indigo-500", lightColor: "bg-indigo-50" },
    { id: "in_progress", title: "Em Atendimento", color: "bg-amber-500", lightColor: "bg-amber-50" },
    { id: "completed", title: "Finalizado", color: "bg-green-500", lightColor: "bg-green-50" },
];

/**
 * Componente Droppable (Coluna)
 */
function KanbanColumn({ id, title, color, lightColor, children, count }: any) {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div className="min-w-[300px] max-w-[350px] flex flex-col h-full rounded-xl bg-gray-50/50 border border-gray-100">
            {/* Header da Coluna */}
            <div className={`p-3 rounded-t-xl border-b ${lightColor} border-gray-100 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <h3 className="font-semibold text-gray-700">{title}</h3>
                </div>
                <span className="bg-white px-2 py-0.5 rounded-md text-xs font-bold text-gray-500 shadow-sm border border-gray-100">
                    {count}
                </span>
            </div>

            {/* Área de Cards */}
            <div ref={setNodeRef} className="flex-1 p-2 overflow-y-auto space-y-3 min-h-[100px]">
                {children}
                {count === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm opacity-50 min-h-[100px]">
                        <p>Arraste para cá</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Componente Draggable (Card)
 */
function KanbanCard({ appointment, isOverlay = false }: { appointment: AppointmentWithRelations, isOverlay?: boolean }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: appointment.id.toString(),
        data: { appointment },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}js, ${transform.y}px, 0)`,
    } : undefined;

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="opacity-30 grayscale">
                <Card className="bg-white shadow-sm border-gray-100">
                    <CardContent className="p-3 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`bg-white shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing border-gray-100 group ${isOverlay ? 'rotate-3 scale-105 shadow-xl ring-2 ring-primary ring-opacity-50' : ''}`}
        >
            <CardContent className="p-3 space-y-3">
                {/* Cabeçalho do Card */}
                <div className="flex justify-between items-start">
                    <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold font-mono">
                        {appointment.start_time.slice(0, 5)} - {appointment.end_time.slice(0, 5)}
                    </div>
                    <Badge variant="outline" className="text-[10px] text-gray-400 border-gray-100">
                        #{appointment.id}
                    </Badge>
                </div>

                {/* Info Principal */}
                <div className="space-y-1">
                    <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{appointment.customer_name}</h4>
                    {appointment.service && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Tag className="w-3 h-3" />
                            <span className="line-clamp-1">{appointment.service.code}</span>
                        </div>
                    )}
                </div>

                <Separator className="bg-gray-50" />

                {/* Info Profissional */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="truncate max-w-[120px]">
                            {appointment.professional ? appointment.professional.name : "Sem profissional"}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function AppointmentsKanban({ appointments, isLoading }: AppointmentsKanbanProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const updateStatusMutation = useUpdateAppointmentStatus();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Movimento mínimo de 8px para ativar drag (evita cliques acidentais)
            },
        })
    );

    const columns = useMemo(() => {
        const cols: Record<string, AppointmentWithRelations[]> = {
            pending: [],
            confirmed: [],
            in_progress: [],
            completed: [],
            canceled: [],
        };

        appointments.forEach((apt) => {
            // Prioridade: Status explícito do banco -> completed_at -> default pending
            let status = apt.status || (apt.completed_at ? 'completed' : 'pending');

            // Fallback seguro se vier um status desconhecido
            if (!cols[status]) status = 'pending';

            cols[status].push(apt);
        });

        return cols;
    }, [appointments]);

    const activeAppointment = useMemo(() => {
        if (!activeId) return null;
        return appointments.find(a => a.id.toString() === activeId);
    }, [activeId, appointments]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const appointmentId = String(active.id);
        const newStatus = over.id as string;

        const appointment = appointments.find(a => a.id === appointmentId);
        if (!appointment) return;

        const oldStatus = appointment.status || (appointment.completed_at ? 'completed' : 'pending');

        if (oldStatus !== newStatus) {
            // Optimistic UI update logic could go here, but rely on React Query invalidation for safety first
            try {
                await updateStatusMutation.mutateAsync({ id: appointmentId, status: newStatus });
                toast.success(`Agendamento movido para ${COLUMNS.find(c => c.id === newStatus)?.title}`);
            } catch (error) {
                toast.error("Erro ao mover agendamento");
            }
        }
    };

    if (isLoading) {
        return <div className="p-10 text-center">Carregando quadro...</div>;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-280px)] min-h-[500px] items-start">
                {COLUMNS.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        color={col.color}
                        lightColor={col.lightColor}
                        count={columns[col.id]?.length || 0}
                    >
                        {columns[col.id]?.map((apt) => (
                            <KanbanCard key={apt.id} appointment={apt} />
                        ))}
                    </KanbanColumn>
                ))}
            </div>

            <DragOverlay>
                {activeAppointment ? (
                    <KanbanCard appointment={activeAppointment} isOverlay />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

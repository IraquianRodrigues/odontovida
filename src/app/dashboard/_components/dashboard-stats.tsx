"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Users, CalendarClock, DollarSign } from "lucide-react";
import { useDashboardStats } from "@/services/appointments/use-appointments";
import { startOfMonth, endOfMonth, isSameDay } from "date-fns";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

interface DashboardStatsProps {
    currentDate: Date;
}

export function DashboardStats({ currentDate }: DashboardStatsProps) {
    // Define o período: Mês atual
    const startDate = useMemo(() => startOfMonth(currentDate), [currentDate]);
    const endDate = useMemo(() => endOfMonth(currentDate), [currentDate]);

    const { data: appointments = [], isLoading } = useDashboardStats(startDate, endDate);

    // Cálculos
    const stats = useMemo(() => {
        // Filtrar apenas concluídos para receita
        const completedApps = appointments.filter(
            (a) => a.status === "completed" || a.completed_at
        );

        const totalRevenue = completedApps.reduce(
            (acc, curr) => acc + (curr.service?.price || 0),
            0
        );

        const totalAppointments = appointments.length;
        const completedCount = completedApps.length;

        // Ticket Médio
        const averageTicket = completedCount > 0 ? totalRevenue / completedCount : 0;

        // Receita por dia (para o gráfico)
        const dailyRevenue: Record<string, number> = {};
        const daysInMonth = endDate.getDate();

        // Inicializa todos os dias com 0
        for (let i = 1; i <= daysInMonth; i++) {
            dailyRevenue[i] = 0;
        }

        completedApps.forEach(app => {
            const day = new Date(app.start_time).getDate();
            const price = app.service?.price || 0;
            dailyRevenue[day] = (dailyRevenue[day] || 0) + price;
        });

        const chartData = Object.keys(dailyRevenue).map(day => ({
            day: day,
            revenue: dailyRevenue[day]
        }));

        return {
            totalRevenue,
            totalAppointments,
            completedCount,
            averageTicket,
            chartData
        };
    }, [appointments, endDate]);

    if (isLoading) {
        return <div className="grid gap-6 sm:grid-cols-4 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-3xl" />)}
        </div>;
    }

    return (
        <div className="space-y-8">
            {/* Cards de Métricas */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Receita Total */}
                <div className="p-6 bg-card text-card-foreground rounded-3xl border border-border shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-24 h-24 text-primary -rotate-12 transform translate-x-4 -translate-y-4" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <DollarSign className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Faturamento (Mês)</span>
                        </div>
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">
                            {formatCurrency(stats.totalRevenue)}
                        </h3>
                        <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Baseado em atendimentos concluídos
                        </p>
                    </div>
                </div>

                {/* Total Agendamentos */}
                <div className="p-6 bg-card text-card-foreground rounded-3xl border border-border shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-secondary rounded-xl">
                                <CalendarClock className="w-5 h-5 text-foreground" />
                            </div>
                            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Agendamentos</span>
                        </div>
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">
                            {stats.totalAppointments}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.completedCount} concluídos / {stats.totalAppointments - stats.completedCount} pendentes
                        </p>
                    </div>
                </div>

                {/* Ticket Médio */}
                <div className="p-6 bg-card text-card-foreground rounded-3xl border border-border shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ticket Médio</span>
                        </div>
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">
                            {formatCurrency(stats.averageTicket)}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Média por atendimento
                        </p>
                    </div>
                </div>
            </div>

            {/* Gráfico de Receita */}
            <div className="bg-card p-6 rounded-3xl border border-border shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] h-[300px]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-foreground">Evolução de Faturamento</h3>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                            tickMargin={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                            tickFormatter={(value) => `R$ ${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'var(--muted)' }}
                            contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any) => [formatCurrency(Number(value || 0)), 'Receita']}
                            labelFormatter={(label) => `Dia ${label}`}
                        />
                        <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                            {stats.chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.revenue > 0 ? 'var(--primary)' : 'var(--border)'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Coffee, CalendarOff, Ban } from "lucide-react";
import { WeeklyScheduleEditor } from "./weekly-schedule-editor";
import { BreaksManager } from "./breaks-manager";
import { HolidaysManager } from "./holidays-manager";
import { BlockedSlotsManager } from "./blocked-slots-manager";

export function BusinessHoursSettings() {
  const [activeTab, setActiveTab] = useState("schedule");

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Horários de Funcionamento
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure os horários de atendimento, intervalos, feriados e bloqueios
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="schedule" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Horários</span>
          </TabsTrigger>
          <TabsTrigger value="breaks" className="gap-2">
            <Coffee className="h-4 w-4" />
            <span className="hidden sm:inline">Intervalos</span>
          </TabsTrigger>
          <TabsTrigger value="holidays" className="gap-2">
            <CalendarOff className="h-4 w-4" />
            <span className="hidden sm:inline">Feriados</span>
          </TabsTrigger>
          <TabsTrigger value="blocked" className="gap-2">
            <Ban className="h-4 w-4" />
            <span className="hidden sm:inline">Bloqueios</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Horários da Semana</CardTitle>
              <CardDescription>
                Configure os horários de abertura e fechamento para cada dia da semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyScheduleEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breaks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intervalos</CardTitle>
              <CardDescription>
                Gerencie os horários de almoço e pausas durante o expediente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BreaksManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holidays" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feriados e Fechamentos</CardTitle>
              <CardDescription>
                Cadastre feriados e dias especiais em que não haverá atendimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HolidaysManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bloqueios Pontuais</CardTitle>
              <CardDescription>
                Bloqueie horários específicos para manutenção, reuniões ou eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BlockedSlotsManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

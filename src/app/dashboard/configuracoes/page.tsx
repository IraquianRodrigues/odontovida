"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Coffee, Calendar, Ban } from "lucide-react";
import { WeeklyHoursEditor } from "@/app/dashboard/configuracoes/_components/weekly-hours-editor";
import { BreaksManager } from "@/app/dashboard/configuracoes/_components/breaks-manager";
import { HolidaysManager } from "@/app/dashboard/configuracoes/_components/holidays-manager";
import { BlockedSlotsManager } from "@/app/dashboard/configuracoes/_components/blocked-slots-manager";

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("horarios");

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configurações de Horários</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="horarios" className="gap-2">
            <Clock className="h-4 w-4" />
            Horários
          </TabsTrigger>
          <TabsTrigger value="intervalos" className="gap-2">
            <Coffee className="h-4 w-4" />
            Intervalos
          </TabsTrigger>
          <TabsTrigger value="feriados" className="gap-2">
            <Calendar className="h-4 w-4" />
            Feriados
          </TabsTrigger>
          <TabsTrigger value="bloqueios" className="gap-2">
            <Ban className="h-4 w-4" />
            Bloqueios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="horarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Horários de Funcionamento</CardTitle>
              <CardDescription>
                Configure os horários de abertura e fechamento para cada dia da semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyHoursEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intervalos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intervalos</CardTitle>
              <CardDescription>
                Gerencie os intervalos (pausas, almoço, etc.) durante o expediente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BreaksManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feriados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feriados</CardTitle>
              <CardDescription>
                Cadastre feriados e dias em que a clínica não funcionará
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HolidaysManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bloqueios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bloqueios de Horários</CardTitle>
              <CardDescription>
                Bloqueie horários específicos temporariamente
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

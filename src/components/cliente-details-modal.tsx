"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Phone, Lock, MessageCircle, DollarSign, CalendarClock, Star, FileText, TrendingUp, Activity, Clock, CheckCircle2, Calendar } from "lucide-react";
import type { ClienteRow } from "@/types/database.types";
import { formatDateTimeBR } from "@/lib/date-utils";
import { toast } from "sonner";
import {
  useClienteByTelefone,
  useUpdateClienteTrava,
} from "@/services/clientes/use-clientes";
import { useAppointmentsByPhone } from "@/services/appointments/use-appointments";
import { Textarea } from "@/components/ui/textarea";
import { useMemo, useState } from "react";
import { useUpdateClienteNotes } from "@/services/clientes/use-clientes";
import { useLatestMedicalRecord, useCreateMedicalRecord, useUpdateMedicalRecord } from "@/services/medical-records/use-medical-records";
import { useMedicalRecords } from "@/services/medical-records/use-medical-records";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";

interface ClienteDetailsModalProps {
  cliente: ClienteRow | null;
  onClose: () => void;
}

export function ClienteDetailsModal({
  cliente,
  onClose,
}: ClienteDetailsModalProps) {
  const updateClienteTravaMutation = useUpdateClienteTrava();
  const updateClienteNotesMutation = useUpdateClienteNotes();

  // Busca o cliente atualizado em tempo real
  const { data: clienteAtualizado } = useClienteByTelefone(
    cliente?.telefone || null
  );

  const { data: appointmentsHistory = [], isLoading: isLoadingHistory } = useAppointmentsByPhone(cliente?.telefone || null);

  // Estatísticas avançadas
  const stats = useMemo(() => {
    const completed = appointmentsHistory.filter(a => a.completed_at);
    const totalInvestido = completed.reduce((acc, apt) => acc + (apt.service?.price || 0), 0);
    const avgTicket = completed.length > 0 ? totalInvestido / completed.length : 0;
    const lastVisit = completed.length > 0 ? new Date(completed[0].created_at) : null;
    const nextAppointment = appointmentsHistory.find(a => !a.completed_at && new Date(a.start_time) > new Date());
    
    return {
      totalInvestido,
      totalVisitas: appointmentsHistory.length,
      visitasConcluidas: completed.length,
      avgTicket,
      lastVisit,
      nextAppointment,
    };
  }, [appointmentsHistory]);

  const [activeTab, setActiveTab] = useState("overview");
  const [notes, setNotes] = useState(cliente?.notes || "");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [observations, setObservations] = useState("");
  const [professionalId, setProfessionalId] = useState<number | null>(null);

  // Fetch medical records
  const { data: latestRecord, isLoading: isLoadingRecord } = useLatestMedicalRecord(cliente?.id || null);
  const { data: medicalRecords = [], isLoading: isLoadingMedicalRecords } = useMedicalRecords(cliente?.id || null);
  const createRecordMutation = useCreateMedicalRecord();
  const updateRecordMutation = useUpdateMedicalRecord();

  // Update local notes state when client data updates from server
  useMemo(() => {
    if (clienteAtualizado?.notes !== undefined) {
      setNotes(clienteAtualizado.notes || "");
    } else if (cliente?.notes) {
      setNotes(cliente.notes);
    }
  }, [clienteAtualizado, cliente]);

  // Update medical record state when data loads
  useMemo(() => {
    if (latestRecord) {
      setClinicalNotes(latestRecord.clinical_notes || "");
      setObservations(latestRecord.observations || "");
    }
  }, [latestRecord]);

  // Fetch professional ID for current user
  useMemo(() => {
    const fetchProfessionalId = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: professional } = await supabase
          .from('professionals')
          .select('id')
          .eq('user_id', user.id)
          .single();
        if (professional) {
          setProfessionalId(professional.id);
        }
      }
    };
    fetchProfessionalId();
  }, []);

  if (!cliente) return null;

  // Usa o cliente atualizado se disponível, senão usa o prop
  const clienteAtual = clienteAtualizado || cliente;
  const isLocked = clienteAtual.trava;

  const handleNotesBlur = async () => {
    if (notes !== (clienteAtual.notes || "")) {
      try {
        await updateClienteNotesMutation.mutateAsync({
          telefone: clienteAtual.telefone,
          notes: notes
        });
        toast.success("Anotações salvas com sucesso");
      } catch (error) {
        toast.error("Erro ao salvar anotações");
      }
    }
  };

  const handleWhatsApp = () => {
    const phoneNumber = clienteAtual.telefone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá ${clienteAtual.nome}, tudo bem? Aqui é da clínica. Estamos entrando em contato.`
    );
    window.open(
      `https://web.whatsapp.com/send?phone=55${phoneNumber}&text=${message}`,
      "_blank"
    );
  };

  const handleToggleLock = async () => {
    try {
      const newTravaValue = !isLocked;

      await updateClienteTravaMutation.mutateAsync({
        telefone: clienteAtual.telefone,
        trava: newTravaValue,
      });

      toast.success(
        newTravaValue
          ? "Cliente bloqueado com sucesso"
          : "Cliente desbloqueado com sucesso"
      );
    } catch (error) {
      toast.error("Erro ao atualizar bloqueio do cliente");
    }
  };

  return (
    <Dialog open={!!cliente} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] p-0 flex flex-col bg-background overflow-hidden shadow-2xl border rounded-2xl">
        {/* Header Clean e Neutro */}
        <div className="relative overflow-hidden bg-muted/30 dark:bg-muted/20 px-6 sm:px-8 pt-8 pb-20 flex-shrink-0 border-b">
          {/* Subtle Pattern */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
          </div>

          <div className="relative z-10">
            {/* Avatar e Info Principal */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
              <div className="relative">
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-muted border-2 border-border flex items-center justify-center text-4xl sm:text-5xl font-bold shadow-sm">
                  <span className="text-foreground">{clienteAtual.nome.charAt(0).toUpperCase()}</span>
                </div>
                {isLocked && (
                  <div className="absolute -bottom-2 -right-2 bg-red-500 rounded-full p-2 shadow-lg">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-left space-y-2">
                <DialogTitle className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
                  {clienteAtual.nome}
                </DialogTitle>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
                    <Phone className="w-3.5 h-3.5 mr-1.5" />
                    {clienteAtual.telefone}
                  </Badge>
                  <Badge className={`px-3 py-1 text-sm font-bold ${isLocked ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white border-0`}>
                    {isLocked ? 'Bloqueado' : 'Ativo'}
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    Desde {format(new Date(clienteAtual.created_at), 'MMM yyyy', { locale: ptBR })}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Floating sobre o header */}
        <div className="px-6 sm:px-8 -mt-12 relative z-20 flex-shrink-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Investido */}
            <div className="bg-card rounded-2xl p-4 shadow-xl border border-border hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Investido</p>
                  <p className="text-xl font-bold text-foreground truncate">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(stats.totalInvestido)}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Visitas */}
            <div className="bg-card rounded-2xl p-4 shadow-xl border border-border hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Visitas</p>
                  <p className="text-xl font-bold text-foreground">{stats.totalVisitas}</p>
                </div>
              </div>
            </div>

            {/* Ticket Médio */}
            <div className="bg-card rounded-2xl p-4 shadow-xl border border-border hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ticket Médio</p>
                  <p className="text-xl font-bold text-foreground truncate">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(stats.avgTicket)}
                  </p>
                </div>
              </div>
            </div>

            {/* Última Visita */}
            <div className="bg-card rounded-2xl p-4 shadow-xl border border-border hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Última Visita</p>
                  <p className="text-sm font-bold text-foreground truncate">
                    {stats.lastVisit ? formatDistanceToNow(stats.lastVisit, { addSuffix: true, locale: ptBR }) : 'Nunca'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogHeader className="sr-only">
          <DialogTitle>{clienteAtual.nome}</DialogTitle>
        </DialogHeader>

        {/* Content Area com Tabs */}
        <div className="flex-1 overflow-hidden flex flex-col mt-6">
          {/* Tabs Navigation */}
          <div className="px-6 sm:px-8 mb-4 flex justify-center sm:justify-start">
            <div className="inline-flex bg-muted/50 p-1.5 rounded-2xl gap-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap ${activeTab === 'overview'
                  ? 'bg-background text-foreground shadow-md ring-1 ring-black/5 dark:ring-white/10 scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                  }`}
              >
                <User className="w-4 h-4 inline mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Visão Geral</span>
                <span className="xs:hidden">Geral</span>
              </button>
              <button
                onClick={() => setActiveTab("timeline")}
                className={`px-4 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap ${activeTab === 'timeline'
                  ? 'bg-background text-foreground shadow-md ring-1 ring-black/5 dark:ring-white/10 scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                  }`}
              >
                <Activity className="w-4 h-4 inline mr-1 sm:mr-2" />
                Timeline
              </button>

            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6 sm:px-8 space-y-6 pb-8">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Quick Info */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Status da Conta</p>
                          <div className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${isLocked ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                            <span className="font-bold text-foreground">{isLocked ? 'Bloqueado' : 'Ativo e Regular'}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Cliente desde {format(new Date(clienteAtual.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {stats.nextAppointment && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-5 rounded-2xl border border-green-100 dark:border-green-900/50">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-green-100 dark:bg-green-900/50 rounded-xl">
                            <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Próxima Consulta</p>
                            <p className="font-bold text-foreground">{format(new Date(stats.nextAppointment.start_time), "dd/MM/yyyy 'às' HH:mm")}</p>
                            <p className="text-xs text-muted-foreground mt-1">{stats.nextAppointment.service?.code || 'Procedimento'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Anotações */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Anotações Importantes</h3>
                    </div>
                    <div className="relative group">
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onBlur={handleNotesBlur}
                        placeholder="Adicione observações importantes sobre o paciente..."
                        className="min-h-[140px] bg-card border-2 border-border hover:border-amber-300 dark:hover:border-amber-700 focus:border-amber-400 dark:focus:border-amber-600 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/30 resize-none text-foreground leading-relaxed p-5 rounded-2xl text-sm transition-all duration-300 shadow-sm"
                      />
                      <div className="absolute bottom-4 right-4 pointer-events-none">
                        {updateClienteNotesMutation.isPending ? (
                          <Badge className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 animate-pulse">
                            <div className="h-2 w-2 rounded-full bg-amber-500 mr-1.5 animate-ping" />
                            Salvando...
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Salvo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "timeline" && (
                <div className="space-y-4">
                  {isLoadingHistory ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent mb-3" />
                      <p className="font-medium">Carregando histórico...</p>
                    </div>
                  ) : appointmentsHistory.length === 0 ? (
                    <div className="text-center py-20 px-4 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
                      <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-bold text-foreground mb-1">Nenhum histórico encontrado</p>
                      <p className="text-sm text-muted-foreground">Este paciente ainda não realizou consultas.</p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-20" />
                      
                      {/* Timeline Items */}
                      <div className="space-y-6">
                        {appointmentsHistory.map((apt: any, index) => {
                          const isCompleted = apt.completed_at !== null;
                          return (
                            <div key={apt.id} className="relative pl-16">
                              {/* Timeline Dot */}
                              <div className={`absolute left-3.5 top-3 w-5 h-5 rounded-full border-4 border-background ${
                                isCompleted 
                                  ? 'bg-green-500 shadow-lg shadow-green-500/50' 
                                  : 'bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse'
                              }`} />
                              
                              {/* Content Card */}
                              <div className={`group p-5 rounded-2xl border-2 transition-all hover:shadow-lg ${
                                isCompleted
                                  ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50 hover:border-green-300 dark:hover:border-green-800'
                                  : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 hover:border-blue-300 dark:hover:border-blue-800'
                              }`}>
                                <div className="flex items-start justify-between gap-4 mb-3">
                                  <div className="flex-1">
                                    <h4 className="font-bold text-lg text-foreground mb-1">
                                      {apt.service?.code || "Procedimento"}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <User className="w-3.5 h-3.5" />
                                        Dr(a). {apt.professional?.name || "N/A"}
                                      </span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {format(new Date(apt.start_time), "dd/MM/yyyy 'às' HH:mm")}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    <Badge className={`font-bold ${
                                      isCompleted
                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}>
                                      {isCompleted ? (
                                        <><CheckCircle2 className="w-3 h-3 mr-1" /> Concluído</>
                                      ) : (
                                        <><Clock className="w-3 h-3 mr-1" /> Agendado</>
                                      )}
                                    </Badge>
                                    {apt.service?.price && (
                                      <span className="font-mono text-lg font-bold text-foreground">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(apt.service.price)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {isCompleted && apt.completed_at && (
                                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                                    Concluído {formatDistanceToNow(new Date(apt.completed_at), { addSuffix: true, locale: ptBR })}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}


            </div>
          </div>
        </div>

        {/* Footer com Actions */}
        <div className="p-5 sm:px-8 sm:py-6 bg-muted/40 border-t border-border flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <Button 
            onClick={handleWhatsApp} 
            className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white border-0 h-12 text-base font-bold shadow-lg shadow-green-500/30 rounded-xl transition-all hover:scale-105"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Enviar WhatsApp
          </Button>
          <div className="flex flex-1 gap-3">
            <Button 
              onClick={handleToggleLock} 
              variant={isLocked ? "secondary" : "destructive"} 
              className={`flex-1 h-12 rounded-xl font-bold transition-all hover:scale-105 ${
                isLocked 
                  ? 'bg-muted hover:bg-muted/80 text-foreground' 
                  : 'shadow-lg shadow-red-500/30'
              }`}
            >
              <Lock className="h-4 w-4 mr-2" />
              {isLocked ? "Desbloquear" : "Bloquear"}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="px-8 h-12 border-2 border-border hover:bg-background hover:border-foreground rounded-xl font-bold transition-all"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


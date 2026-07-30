// Tipos do banco de dados Supabase

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string;
          created_at: string;
          service_code: number;
          professional_code: number;
          customer_name: string;
          customer_phone: string;
          start_time: string;
          end_time: string;
          status: string;
          cancelled_at: string | null;
          rescheduled_at: string | null;
          previous_start_time: string | null;
          previous_end_time: string | null;
          reminder_48h_sent_at: string | null;
          reminder_24h_sent_at: string | null;
          reminder_2h_sent_at: string | null;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["appointments"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
      };
      services: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          duration_minutes: number;
          description: string | null;
          active: boolean;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["services"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
      };
      professionals: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          specialty: string | null;
          active: boolean;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["professionals"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["professionals"]["Insert"]
        >;
      };
      clientes: {
        Row: {
          id: number;
          created_at: string;
          nome: string;
          telefone: string;
          trava: boolean;
          ia_ativa: boolean;
          motivo_trava_humano: string | null;
          trava_humano_ate: string | null;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["clientes"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["clientes"]["Insert"]>;
      };
      crm_leads: {
        Row: {
          id: string;
          cliente_id: number;
          appointment_id: string | null;
          stage: CrmLeadStage;
          source: string | null;
          assigned_to: string | null;
          last_stage_actor: CrmLeadActor;
          first_contact_at: string | null;
          follow_up_at: string | null;
          qualified_at: string | null;
          appointment_confirmed_at: string | null;
          human_takeover_at: string | null;
          closed_at: string | null;
          lost_reason: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cliente_id: number;
          appointment_id?: string | null;
          stage?: CrmLeadStage;
          source?: string | null;
          assigned_to?: string | null;
          last_stage_actor?: CrmLeadActor;
          first_contact_at?: string | null;
          follow_up_at?: string | null;
          qualified_at?: string | null;
          appointment_confirmed_at?: string | null;
          human_takeover_at?: string | null;
          closed_at?: string | null;
          lost_reason?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["crm_leads"]["Insert"]>;
      };
      crm_lead_history: {
        Row: {
          id: string;
          lead_id: string;
          from_stage: CrmLeadStage | null;
          to_stage: CrmLeadStage;
          actor_type: CrmLeadActor;
          actor_id: string | null;
          source: string;
          note: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          from_stage?: CrmLeadStage | null;
          to_stage: CrmLeadStage;
          actor_type: CrmLeadActor;
          actor_id?: string | null;
          source?: string;
          note?: string | null;
          metadata?: Record<string, unknown>;
        };
        Update: never;
      };
      professional_services: {
        Row: {
          id: number;
          created_at: string;
          professional_id: number;
          service_id: number;
          custom_duration_minutes: number;
          is_active: boolean;
        };
        Insert: Omit<
          Database["public"]["Tables"]["professional_services"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["professional_services"]["Insert"]
        >;
      };
      business_hours: {
        Row: {
          id: string;
          day_of_week: number;
          is_open: boolean;
          open_time: string;
          close_time: string;
          created_at: string;
          updated_at: string;
          professional_code?: number;
        };
        Insert: Omit<
          Database["public"]["Tables"]["business_hours"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["business_hours"]["Insert"]
        >;
      };
      business_breaks: {
        Row: {
          id: number;
          day_of_week: number;
          break_start: string;
          break_end: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["business_breaks"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["business_breaks"]["Insert"]
        >;
      };
      business_holidays: {
        Row: {
          id: string;
          date: string;
          name: string;
          is_recurring: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["business_holidays"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["business_holidays"]["Insert"]
        >;
      };
      business_blocked_slots: {
        Row: {
          id: string;
          start_time: string;
          end_time: string;
          reason: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["business_blocked_slots"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["business_blocked_slots"]["Insert"]
        >;
      };
      professional_schedules: {
        Row: {
          id: string;
          professional_id: number;
          professional_code: number;
          day_of_week: number;
          is_available: boolean;
          is_open: boolean;
          start_time: string;
          end_time: string;
          open_time: string;
          close_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["professional_schedules"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["professional_schedules"]["Insert"]
        >;
      };
    };
  };
}

export type CrmLeadStage =
  | "novo_lead"
  | "primeiro_contato"
  | "follow_up"
  | "qualificado"
  | "agendamento_confirmado"
  | "compareceu"
  | "nao_compareceu"
  | "atendimento_humano"
  | "fechado"
  | "perdido";

export type CrmLeadActor = "ai" | "human" | "system";

// Tipos para uso na aplicação
export type AppointmentRow =
  Database["public"]["Tables"]["appointments"]["Row"];
type ServiceDatabaseRow = Database["public"]["Tables"]["services"]["Row"];
type ProfessionalDatabaseRow = Database["public"]["Tables"]["professionals"]["Row"];
type ClienteDatabaseRow = Database["public"]["Tables"]["clientes"]["Row"];

// Campos de compatibilidade usados pela interface legada. Eles sÃ£o derivados
// no cliente e nunca sÃ£o enviados ao Supabase.
export type ServiceRow = ServiceDatabaseRow & { code: string; price: null };
export type ProfessionalRow = ProfessionalDatabaseRow & { code: string };
export type ClienteRow = ClienteDatabaseRow & {
  email?: string | null;
  notes: string | null;
  endereco: string | null;
  cidade: string | null;
  bairro: string | null;
  estado?: string | null;
  data_nascimento: string | null;
};
export type CrmLeadRow = Database["public"]["Tables"]["crm_leads"]["Row"];
export type CrmLeadHistoryRow = Database["public"]["Tables"]["crm_lead_history"]["Row"];
export type CrmLeadWithCliente = CrmLeadRow & {
  cliente: Pick<ClienteRow, "id" | "nome" | "telefone"> | null;
};
export type ProfessionalServiceRow =
  Database["public"]["Tables"]["professional_services"]["Row"];
export type BusinessHoursRow =
  Database["public"]["Tables"]["business_hours"]["Row"];
export type BusinessBreakRow =
  Database["public"]["Tables"]["business_breaks"]["Row"];
export type BusinessHolidayRow =
  Database["public"]["Tables"]["business_holidays"]["Row"];
export type BusinessBlockedSlotRow =
  Database["public"]["Tables"]["business_blocked_slots"]["Row"];
export type ProfessionalScheduleRow =
  Database["public"]["Tables"]["professional_schedules"]["Row"];

export interface ProfessionalBlockedDateRow {
  id: string;
  professional_code: number;
  date: string;
  end_date: string | null;
  reason: string | null;
  type: string;
  active: boolean;
  created_at: string;
}

// Tipo de appointment com dados relacionados
export interface AppointmentWithRelations extends AppointmentRow {
  completed_at: string | null;
  customer_name: string;
  customer_phone: string;
  professional_id?: number;
  professional?: {
    id: number;
    name: string;
    code: string;
  } | null;
  service?: {
    id: number;
    code: string;
    duration_minutes: number;
    price: null;
    description?: string | null;
  } | null;
}

// Tipo de professional_service com dados relacionados
export interface ProfessionalServiceWithRelations
  extends ProfessionalServiceRow {
  professional: ProfessionalRow | null;
  service: ServiceRow | null;
}

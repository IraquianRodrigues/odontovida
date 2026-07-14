/**
 * Modelos usados pela interface.
 *
 * O Supabase deste projeto usa nomes em português e UUIDs. Alguns componentes
 * antigos ainda consomem os nomes legados em inglês; os serviços fazem essa
 * conversão explicitamente, sem exigir alterações no banco.
 */

export interface AppointmentRow {
  id: string;
  created_at: string;
  updated_at?: string;
  cliente_id?: string | null;
  service_code: number;
  professional_code: number;
  customer_name: string;
  customer_phone: string;
  start_time: string;
  end_time: string;
  status: string;
  completed_at?: string | null;
  payment_status?: string;
  payment_method?: string | null;
  payment_value?: number | null;
  notes?: string | null;
}
export interface ServiceRow {
  id: number;
  database_id: string;
  created_at: string;
  code: string;
  duration_minutes: number;
  price: number | null;
  description: string | null;
  active?: boolean;
}

export interface ProfessionalRow {
  id: number;
  database_id: string;
  created_at: string;
  code: string;
  name: string;
  specialty: string | null;
  email?: string | null;
  phone?: string | null;
  active?: boolean;
}

export interface ClienteRow {
  id: string;
  created_at: string;
  updated_at?: string;
  nome: string;
  telefone: string;
  email?: string | null;
  trava: boolean;
  notes: string | null;
  endereco: string | null;
  cidade: string | null;
  bairro: string | null;
  estado?: string | null;
  data_nascimento: string | null;
}

export interface BusinessHoursRow {
  id: string;
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
  created_at: string;
  updated_at: string;
  professional_code?: number;
}

export interface BusinessBreakRow {
  id: string;
  day_of_week: number;
  break_start: string;
  break_end: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface BusinessHolidayRow {
  id: string;
  date: string;
  name: string;
  is_recurring: boolean;
  created_at: string;
}

export interface BusinessBlockedSlotRow {
  id: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  created_at: string;
}

export interface ProfessionalScheduleRow extends BusinessHoursRow {
  professional_id: number;
  is_available: boolean;
  start_time: string;
  end_time: string;
}

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

export interface ProfessionalServiceRow {
  id: number;
  created_at: string;
  professional_id: number;
  service_id: number;
  custom_duration_minutes: number;
  is_active: boolean;
}

export interface AppointmentWithRelations extends AppointmentRow {
  professional?: ProfessionalRow;
  service?: ServiceRow;
}

export interface ProfessionalServiceWithRelations extends ProfessionalServiceRow {
  professional: ProfessionalRow | null;
  service: ServiceRow | null;
}

// Mantido para imports e para tipar o client Supabase.
// Para tipos gerados automaticamente, use: npm run db:types
export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: AppointmentRow;
        Insert: Omit<AppointmentRow, "id" | "created_at">;
        Update: Partial<Omit<AppointmentRow, "id" | "created_at">>;
      };
      clientes: {
        Row: ClienteRow;
        Insert: Omit<ClienteRow, "id" | "created_at">;
        Update: Partial<Omit<ClienteRow, "id" | "created_at">>;
      };
      professionals: {
        Row: ProfessionalRow;
        Insert: Omit<ProfessionalRow, "id" | "created_at">;
        Update: Partial<Omit<ProfessionalRow, "id" | "created_at">>;
      };
      services: {
        Row: ServiceRow;
        Insert: Omit<ServiceRow, "id" | "created_at">;
        Update: Partial<Omit<ServiceRow, "id" | "created_at">>;
      };
      availability_rules: { Row: unknown; Insert: unknown; Update: unknown };
      blocked_dates: { Row: unknown; Insert: unknown; Update: unknown };
    };
  };
}

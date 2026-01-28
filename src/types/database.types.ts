// Tipos do banco de dados Supabase

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: number;
          created_at: string;
          service_code: number;
          professional_code: number;
          customer_name: string;
          customer_phone: string;
          start_time: string;
          end_time: string;
          completed_at: string | null;
          status: string;
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
          code: string;
          duration_minutes: number;
          price: number | null;
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
          code: string;
          name: string;
          specialty: string | null;
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
          notes: string | null;
          endereco: string | null;
          cidade: string | null;
          bairro: string | null;
          data_nascimento: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["clientes"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["clientes"]["Insert"]>;
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
          id: number;
          day_of_week: number;
          is_open: boolean;
          open_time: string;
          close_time: string;
          created_at: string;
          updated_at: string;
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
          id: number;
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
          id: number;
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
          id: number;
          professional_id: number;
          day_of_week: number;
          is_available: boolean;
          start_time: string;
          end_time: string;
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

// Tipos para uso na aplicação
export type AppointmentRow =
  Database["public"]["Tables"]["appointments"]["Row"];
export type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
export type ProfessionalRow =
  Database["public"]["Tables"]["professionals"]["Row"];
export type ClienteRow = Database["public"]["Tables"]["clientes"]["Row"];
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

// Tipo de appointment com dados relacionados
export interface AppointmentWithRelations extends AppointmentRow {
  customer_name: string;
  customer_phone: string;
  professional_id?: number;
  professional?: {
    id: number;
    name: string;
    code: string;
  };
  service?: {
    id: number;
    code: string;
    duration_minutes: number;
    price: number | null;
  };
}

// Tipo de professional_service com dados relacionados
export interface ProfessionalServiceWithRelations
  extends ProfessionalServiceRow {
  professional: ProfessionalRow | null;
  service: ServiceRow | null;
}

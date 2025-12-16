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

// Tipo de appointment com dados relacionados
export interface AppointmentWithRelations extends AppointmentRow {
  service: ServiceRow | null;
  professional: ProfessionalRow | null;
}

// Tipo de professional_service com dados relacionados
export interface ProfessionalServiceWithRelations
  extends ProfessionalServiceRow {
  professional: ProfessionalRow | null;
  service: ServiceRow | null;
}

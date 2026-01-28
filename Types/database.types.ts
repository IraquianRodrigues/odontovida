// ============================================
// TYPESCRIPT TYPES - BUSINESS HOURS MODULE
// ============================================
// Adicione estes tipos ao seu arquivo database.types.ts
// ============================================

export interface Database {
  public: {
    Tables: {
      // ... suas outras tabelas ...
      
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
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["business_breaks"]["Row"],
          "id" | "created_at" | "updated_at"
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
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["business_holidays"]["Row"],
          "id" | "created_at" | "updated_at"
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
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["business_blocked_slots"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["business_blocked_slots"]["Insert"]
        >;
      };
    };
  };
}

// ============================================
// EXPORT TYPES
// ============================================

export type BusinessHoursRow =
  Database["public"]["Tables"]["business_hours"]["Row"];
export type BusinessBreakRow =
  Database["public"]["Tables"]["business_breaks"]["Row"];
export type BusinessHolidayRow =
  Database["public"]["Tables"]["business_holidays"]["Row"];
export type BusinessBlockedSlotRow =
  Database["public"]["Tables"]["business_blocked_slots"]["Row"];

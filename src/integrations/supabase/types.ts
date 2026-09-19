export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          buffer_minutes: number
          created_at: string
          full_name: string
          home_address: string | null
          home_lat: number | null
          home_lng: number | null
          id: string
          updated_at: string
          vehicle: Database["public"]["Enums"]["vehicle_mode"]
        }
        Insert: {
          buffer_minutes?: number
          created_at?: string
          full_name?: string
          home_address?: string | null
          home_lat?: number | null
          home_lng?: number | null
          id: string
          updated_at?: string
          vehicle?: Database["public"]["Enums"]["vehicle_mode"]
        }
        Update: {
          buffer_minutes?: number
          created_at?: string
          full_name?: string
          home_address?: string | null
          home_lat?: number | null
          home_lng?: number | null
          id?: string
          updated_at?: string
          vehicle?: Database["public"]["Enums"]["vehicle_mode"]
        }
        Relationships: []
      }
      schedule_items: {
        Row: {
          address: string | null
          created_at: string
          day_of_week: number
          end_time: string | null
          id: string
          lat: number | null
          lng: number | null
          note: string | null
          place_name: string | null
          room: string | null
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          day_of_week?: number
          end_time?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          note?: string | null
          place_name?: string | null
          room?: string | null
          start_time: string
          title: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          day_of_week?: number
          end_time?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          note?: string | null
          place_name?: string | null
          room?: string | null
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      trip_feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          schedule_item_id: string | null
          trip_date: string
          user_id: string
          vehicle: Database["public"]["Enums"]["vehicle_mode"] | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          schedule_item_id?: string | null
          trip_date?: string
          user_id: string
          vehicle?: Database["public"]["Enums"]["vehicle_mode"] | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          schedule_item_id?: string | null
          trip_date?: string
          user_id?: string
          vehicle?: Database["public"]["Enums"]["vehicle_mode"] | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_feedback_schedule_item_id_fkey"
            columns: ["schedule_item_id"]
            isOneToOne: false
            referencedRelation: "schedule_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      vehicle_mode: "motorbike" | "car" | "bus" | "walk"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      vehicle_mode: ["motorbike", "car", "bus", "walk"],
    },
  },
} as const

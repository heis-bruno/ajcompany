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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_devices: {
        Row: {
          admin_id: string
          created_at: string | null
          device_name: string | null
          device_type: string | null
          fcm_token: string
          id: string
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          fcm_token: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          fcm_token?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_reminder_logs: {
        Row: {
          email_type: string
          error_message: string | null
          id: string
          loan_id: string | null
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string
        }
        Insert: {
          email_type: string
          error_message?: string | null
          id?: string
          loan_id?: string | null
          recipient_email: string
          sent_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          email_type?: string
          error_message?: string | null
          id?: string
          loan_id?: string | null
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_reminder_logs_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
          created_at: string | null
          from_email: string
          from_name: string | null
          id: string
          max_overdue_reminders: number | null
          reminder_days_before: number | null
          smtp_host: string
          smtp_password: string | null
          smtp_port: number
          smtp_username: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_email: string
          from_name?: string | null
          id?: string
          max_overdue_reminders?: number | null
          reminder_days_before?: number | null
          smtp_host?: string
          smtp_password?: string | null
          smtp_port?: number
          smtp_username?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_email?: string
          from_name?: string | null
          id?: string
          max_overdue_reminders?: number | null
          reminder_days_before?: number | null
          smtp_host?: string
          smtp_password?: string | null
          smtp_port?: number
          smtp_username?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      loans: {
        Row: {
          amount: number
          borrower_email: string | null
          borrower_name: string
          borrower_phone: string | null
          created_at: string | null
          currency: string
          due_date: string
          id: string
          interest_rate: number
          interest_type: string
          last_reminder_sent_at: string | null
          late_fee: number | null
          notes: string | null
          payment_status: string
          reminder_count: number | null
          reminders_enabled: boolean | null
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          borrower_email?: string | null
          borrower_name: string
          borrower_phone?: string | null
          created_at?: string | null
          currency?: string
          due_date: string
          id?: string
          interest_rate?: number
          interest_type?: string
          last_reminder_sent_at?: string | null
          late_fee?: number | null
          notes?: string | null
          payment_status?: string
          reminder_count?: number | null
          reminders_enabled?: boolean | null
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          borrower_email?: string | null
          borrower_name?: string
          borrower_phone?: string | null
          created_at?: string | null
          currency?: string
          due_date?: string
          id?: string
          interest_rate?: number
          interest_type?: string
          last_reminder_sent_at?: string | null
          late_fee?: number | null
          notes?: string | null
          payment_status?: string
          reminder_count?: number | null
          reminders_enabled?: boolean | null
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          body: string
          device_id: string | null
          error_message: string | null
          id: string
          notification_type: string
          payment_id: string | null
          sent_at: string | null
          status: string | null
          title: string
        }
        Insert: {
          body: string
          device_id?: string | null
          error_message?: string | null
          id?: string
          notification_type: string
          payment_id?: string | null
          sent_at?: string | null
          status?: string | null
          title: string
        }
        Update: {
          body?: string
          device_id?: string | null
          error_message?: string | null
          id?: string
          notification_type?: string
          payment_id?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "admin_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string | null
          currency: string | null
          due_date: string
          id: string
          last_notification_sent_at: string | null
          notes: string | null
          reminder_count: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string | null
          currency?: string | null
          due_date: string
          id?: string
          last_notification_sent_at?: string | null
          notes?: string | null
          reminder_count?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string | null
          currency?: string | null
          due_date?: string
          id?: string
          last_notification_sent_at?: string | null
          notes?: string | null
          reminder_count?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_records: {
        Row: {
          buyer_name: string
          created_at: string | null
          currency: string
          id: string
          money_paid: number
          service_fee: number
          ticket_number: string | null
          total_amount: number | null
          updated_at: string | null
          visa_destination: string | null
        }
        Insert: {
          buyer_name: string
          created_at?: string | null
          currency?: string
          id?: string
          money_paid?: number
          service_fee?: number
          ticket_number?: string | null
          total_amount?: number | null
          updated_at?: string | null
          visa_destination?: string | null
        }
        Update: {
          buyer_name?: string
          created_at?: string | null
          currency?: string
          id?: string
          money_paid?: number
          service_fee?: number
          ticket_number?: string | null
          total_amount?: number | null
          updated_at?: string | null
          visa_destination?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      device_owners: {
        Row: {
          device_owner: string | null
          device_uuid: string
          id: number
        }
        Insert: {
          device_owner?: string | null
          device_uuid: string
          id?: number
        }
        Update: {
          device_owner?: string | null
          device_uuid?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_device_owners_device_owner_fkey"
            columns: ["device_owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      issue_tickets: {
        Row: {
          created_at: string
          created_by: string | null
          id: number
          priority: Database["public"]["Enums"]["ticket_priority"] | null
          title: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: number
          priority?: Database["public"]["Enums"]["ticket_priority"] | null
          title?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: number
          priority?: Database["public"]["Enums"]["ticket_priority"] | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_issue_tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      issue_tickets_messages: {
        Row: {
          created_by: string | null
          id: number
          message_text: string | null
          reactions: Json | null
          ticket_id: number
        }
        Insert: {
          created_by?: string | null
          id?: number
          message_text?: string | null
          reactions?: Json | null
          ticket_id: number
        }
        Update: {
          created_by?: string | null
          id?: number
          message_text?: string | null
          reactions?: Json | null
          ticket_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_issue_tickets_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "issue_tickets"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          first_name: string | null
          id: string
          last_name: string | null
          profile_photo: string | null
        }
        Insert: {
          first_name?: string | null
          id: string
          last_name?: string | null
          profile_photo?: string | null
        }
        Update: {
          first_name?: string | null
          id?: string
          last_name?: string | null
          profile_photo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      site_plans: {
        Row: {
          created_at: string
          device_uuid: string | null
          id: number
          site_plan_data: Json | null
        }
        Insert: {
          created_at?: string
          device_uuid?: string | null
          id?: number
          site_plan_data?: Json | null
        }
        Update: {
          created_at?: string
          device_uuid?: string | null
          id?: number
          site_plan_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "public_site_plans_device_uuid_fkey"
            columns: ["device_uuid"]
            isOneToOne: false
            referencedRelation: "device_owners"
            referencedColumns: ["device_uuid"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_claim: {
        Args: {
          uid: string
          claim: string
        }
        Returns: string
      }
      get_claim: {
        Args: {
          uid: string
          claim: string
        }
        Returns: Json
      }
      get_claims: {
        Args: {
          uid: string
        }
        Returns: Json
      }
      get_my_claim: {
        Args: {
          claim: string
        }
        Returns: Json
      }
      get_my_claims: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_claims_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_claim: {
        Args: {
          uid: string
          claim: string
          value: Json
        }
        Returns: string
      }
    }
    Enums: {
      ticket_priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

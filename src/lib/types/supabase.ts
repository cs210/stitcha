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
      education: {
        Row: {
          description: string
          duration: number
          id: string
          name: string
          thumbnail_url: string
          video_url: string
        }
        Insert: {
          description: string
          duration: number
          id?: string
          name: string
          thumbnail_url: string
          video_url: string
        }
        Update: {
          description?: string
          duration?: number
          id?: string
          name?: string
          thumbnail_url?: string
          video_url?: string
        }
        Relationships: []
      }
      labor_types: {
        Row: {
          cost_per_minute: number
          task: string
          task_id: string
        }
        Insert: {
          cost_per_minute: number
          task: string
          task_id?: string
        }
        Update: {
          cost_per_minute?: number
          task?: string
          task_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          client: string
          contact: string
          due_date: string
          id: string
          logo_url: string | null
          order_quantity: number
          product_ids: string[] | null
          progress_level: Database["public"]["Enums"]["progress_level"] | null
        }
        Insert: {
          client: string
          contact: string
          due_date: string
          id?: string
          logo_url?: string | null
          order_quantity: number
          product_ids?: string[] | null
          progress_level?: Database["public"]["Enums"]["progress_level"] | null
        }
        Update: {
          client?: string
          contact?: string
          due_date?: string
          id?: string
          logo_url?: string | null
          order_quantity?: number
          product_ids?: string[] | null
          progress_level?: Database["public"]["Enums"]["progress_level"] | null
        }
        Relationships: []
      }
      packaging_materials: {
        Row: {
          packaging_id: string
          packaging_material_code: string
          packaging_material_name: string
          purchase_price: number
          units: string | null
        }
        Insert: {
          packaging_id?: string
          packaging_material_code: string
          packaging_material_name: string
          purchase_price?: number
          units?: string | null
        }
        Update: {
          packaging_id?: string
          packaging_material_code?: string
          packaging_material_name?: string
          purchase_price?: number
          units?: string | null
        }
        Relationships: []
      }
      product_costs: {
        Row: {
          general_expenses: number
          id: string
          margin: number
          packaging_cost: number
          product_id: string
          raw_material_cost: number
          royalties: number
          selling_price: number
          total_cost: number
          total_labor_cost: number
          total_material_cost: number
        }
        Insert: {
          general_expenses?: number
          id?: string
          margin?: number
          packaging_cost?: number
          product_id: string
          raw_material_cost?: number
          royalties?: number
          selling_price?: number
          total_cost?: number
          total_labor_cost?: number
          total_material_cost?: number
        }
        Update: {
          general_expenses?: number
          id?: string
          margin?: number
          packaging_cost?: number
          product_id?: string
          raw_material_cost?: number
          royalties?: number
          selling_price?: number
          total_cost?: number
          total_labor_cost?: number
          total_material_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_costs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_parts: {
        Row: {
          part_id: string | null
          part_name: string | null
          seamstress_id: string | null
          total_units: number | null
          units_completed: number | null
        }
        Insert: {
          part_id?: string | null
          part_name?: string | null
          seamstress_id?: string | null
          total_units?: number | null
          units_completed?: number | null
        }
        Update: {
          part_id?: string | null
          part_name?: string | null
          seamstress_id?: string | null
          total_units?: number | null
          units_completed?: number | null
        }
        Relationships: []
      }
      product_progress: {
        Row: {
          product_id: string
          progress_id: string
        }
        Insert: {
          product_id: string
          progress_id: string
        }
        Update: {
          product_id?: string
          progress_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_progress_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_progress_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "progress"
            referencedColumns: ["id"]
          },
        ]
      }
      product_users: {
        Row: {
          product_id: string
          user_id: string
        }
        Insert: {
          product_id: string
          user_id: string
        }
        Update: {
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_users_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          description: string | null
          height: number
          id: string
          image_urls: Json | null
          inmetro_cert_number: string | null
          name: string
          order_id: string | null
          parts: string[] | null
          percent_pieces_lost: number | null
          product_type: string | null
          progress_level: Database["public"]["Enums"]["progress_level"]
          system_code: string
          weight: number
          width: number
        }
        Insert: {
          barcode?: string | null
          description?: string | null
          height?: number
          id?: string
          image_urls?: Json | null
          inmetro_cert_number?: string | null
          name?: string
          order_id?: string | null
          parts?: string[] | null
          percent_pieces_lost?: number | null
          product_type?: string | null
          progress_level: Database["public"]["Enums"]["progress_level"]
          system_code?: string
          weight?: number
          width?: number
        }
        Update: {
          barcode?: string | null
          description?: string | null
          height?: number
          id?: string
          image_urls?: Json | null
          inmetro_cert_number?: string | null
          name?: string
          order_id?: string | null
          parts?: string[] | null
          percent_pieces_lost?: number | null
          product_type?: string | null
          progress_level?: Database["public"]["Enums"]["progress_level"]
          system_code?: string
          weight?: number
          width?: number
        }
        Relationships: []
      }
      products_and_labor: {
        Row: {
          conversion: number
          id: string
          product_id: string
          rework: number
          task_id: string | null
          time_per_unit: number
          total_cost: number
        }
        Insert: {
          conversion?: number
          id?: string
          product_id: string
          rework?: number
          task_id?: string | null
          time_per_unit?: number
          total_cost?: number
        }
        Update: {
          conversion?: number
          id?: string
          product_id?: string
          rework?: number
          task_id?: string | null
          time_per_unit?: number
          total_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_and_labor_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_and_labor_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: true
            referencedRelation: "labor_types"
            referencedColumns: ["task_id"]
          },
        ]
      }
      products_and_packaging_materials: {
        Row: {
          id: string
          material_code: string | null
          product_id: string | null
          total_cost: number
          unit_consumption: number
        }
        Insert: {
          id?: string
          material_code?: string | null
          product_id?: string | null
          total_cost?: number
          unit_consumption?: number
        }
        Update: {
          id?: string
          material_code?: string | null
          product_id?: string | null
          total_cost?: number
          unit_consumption?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_and_packaging_materials_material_code_fkey"
            columns: ["material_code"]
            isOneToOne: false
            referencedRelation: "packaging_materials"
            referencedColumns: ["packaging_id"]
          },
          {
            foreignKeyName: "products_and_packaging_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products_and_raw_materials: {
        Row: {
          id: string
          material_code: string | null
          product_id: string
          total_cost: number
          unit_consumption: number
        }
        Insert: {
          id?: string
          material_code?: string | null
          product_id: string
          total_cost: number
          unit_consumption: number
        }
        Update: {
          id?: string
          material_code?: string | null
          product_id?: string
          total_cost?: number
          unit_consumption?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_and_materials_material_code_fkey"
            columns: ["material_code"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["material_id"]
          },
          {
            foreignKeyName: "products_and_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      progress: {
        Row: {
          created_at: string
          description: string
          emotion: string | null
          id: string
          image_urls: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          emotion?: string | null
          id?: string
          image_urls?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          emotion?: string | null
          id?: string
          image_urls?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_materials: {
        Row: {
          material_code: string
          material_id: string
          material_name: string
          purchase_price: number
          units: string | null
          validated: boolean | null
        }
        Insert: {
          material_code: string
          material_id?: string
          material_name: string
          purchase_price?: number
          units?: string | null
          validated?: boolean | null
        }
        Update: {
          material_code?: string
          material_id?: string
          material_name?: string
          purchase_price?: number
          units?: string | null
          validated?: boolean | null
        }
        Relationships: []
      }
      technical_sheets: {
        Row: {
          id: number
          product_id: string
          technical_sheet: string | null
        }
        Insert: {
          id?: number
          product_id: string
          technical_sheet?: string | null
        }
        Update: {
          id?: number
          product_id?: string
          technical_sheet?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technical_sheets_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          email: string
          first_name: string
          id: string
          image_url: string | null
          last_name: string
          location: string | null
          phone_number: number | null
          username: string
        }
        Insert: {
          email: string
          first_name: string
          id: string
          image_url?: string | null
          last_name: string
          location?: string | null
          phone_number?: number | null
          username: string
        }
        Update: {
          email?: string
          first_name?: string
          id?: string
          image_url?: string | null
          last_name?: string
          location?: string | null
          phone_number?: number | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      requesting_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      progress_level: "Not Started" | "In Progress" | "Done"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      progress_level: ["Not Started", "In Progress", "Done"],
    },
  },
} as const

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
      education_videos: {
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
          order_quantity: number
          product_id: string
        }
        Insert: {
          client: string
          contact: string
          due_date: string
          id?: string
          order_quantity: number
          product_id: string
        }
        Update: {
          client?: string
          contact?: string
          due_date?: string
          id?: string
          order_quantity?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      packaging_materials: {
        Row: {
          packaging_id: string
          packaging_material_code: string | null
          packaging_material_name: string | null
          purchase_price: number | null
          unit: string | null
        }
        Insert: {
          packaging_id: string
          packaging_material_code?: string | null
          packaging_material_name?: string | null
          purchase_price?: number | null
          unit?: string | null
        }
        Update: {
          packaging_id?: string
          packaging_material_code?: string | null
          packaging_material_name?: string | null
          purchase_price?: number | null
          unit?: string | null
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
          total_labour_cost: number
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
          total_labour_cost?: number
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
          total_labour_cost?: number
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
          image_url: string | null
          img_urls: Json | null
          inmetro_cert_number: string | null
          name: string
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
          image_url?: string | null
          img_urls?: Json | null
          inmetro_cert_number?: string | null
          name?: string
          percent_pieces_lost?: number | null
          product_type?: string | null
          progress_level?: Database["public"]["Enums"]["progress_level"]
          system_code?: string
          weight?: number
          width?: number
        }
        Update: {
          barcode?: string | null
          description?: string | null
          height?: number
          id?: string
          image_url?: string | null
          img_urls?: Json | null
          inmetro_cert_number?: string | null
          name?: string
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
          number_of_pieces: number
          product_id: string | null
          rework: number
          task_id: string
          time_per_unit: number
        }
        Insert: {
          conversion: number
          id?: string
          number_of_pieces: number
          product_id?: string | null
          rework: number
          task_id: string
          time_per_unit: number
        }
        Update: {
          conversion?: number
          id?: string
          number_of_pieces?: number
          product_id?: string | null
          rework?: number
          task_id?: string
          time_per_unit?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_and_labor_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_and_labor_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "labor_types"
            referencedColumns: ["task_id"]
          },
        ]
      }
      products_and_packaging_materials: {
        Row: {
          amount_of_materials: number
          id: string
          material_code: string | null
          product_id: string | null
          total_cost: number
        }
        Insert: {
          amount_of_materials?: number
          id?: string
          material_code?: string | null
          product_id?: string | null
          total_cost?: number
        }
        Update: {
          amount_of_materials?: number
          id?: string
          material_code?: string | null
          product_id?: string | null
          total_cost?: number
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
          amount_of_materials: number
          id: string
          material_code: string
          product_id: string
          total_cost: number
        }
        Insert: {
          amount_of_materials: number
          id?: string
          material_code: string
          product_id: string
          total_cost: number
        }
        Update: {
          amount_of_materials?: number
          id?: string
          material_code?: string
          product_id?: string
          total_cost?: number
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
          material_code: string | null
          material_id: string
          material_name: string | null
          purchase_price: number | null
          unit: string | null
        }
        Insert: {
          material_code?: string | null
          material_id?: string
          material_name?: string | null
          purchase_price?: number | null
          unit?: string | null
        }
        Update: {
          material_code?: string | null
          material_id?: string
          material_name?: string | null
          purchase_price?: number | null
          unit?: string | null
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

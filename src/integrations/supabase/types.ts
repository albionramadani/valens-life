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
      admin_secrets: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          currency: string
          device_fingerprint: string | null
          expires_at: string
          id: string
          status: string
          token: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          device_fingerprint?: string | null
          expires_at?: string
          id?: string
          status?: string
          token?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          device_fingerprint?: string | null
          expires_at?: string
          id?: string
          status?: string
          token?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          odoo_id: number | null
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          odoo_id?: number | null
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          odoo_id?: number | null
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_blocks: {
        Row: {
          block_type: string
          content: string | null
          created_at: string
          id: string
          is_published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          block_type?: string
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          block_type?: string
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_order_amount: number | null
          start_date: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_amount?: number | null
          start_date?: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_amount?: number | null
          start_date?: string
          used_count?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      feed_config: {
        Row: {
          allowed_ips: string[]
          created_at: string
          id: string
          is_active: boolean
          token: string
          updated_at: string
        }
        Insert: {
          allowed_ips?: string[]
          created_at?: string
          id?: string
          is_active?: boolean
          token: string
          updated_at?: string
        }
        Update: {
          allowed_ips?: string[]
          created_at?: string
          id?: string
          is_active?: boolean
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_banners: {
        Row: {
          bg_color: string | null
          btn1_bg: string | null
          btn1_text: string | null
          btn2_bg: string | null
          btn2_text: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link_label: string | null
          link_url: string | null
          secondary_link_label: string | null
          secondary_link_url: string | null
          section_type: string
          sort_order: number
          subtitle: string | null
          text_color: string | null
          title: string
          updated_at: string
        }
        Insert: {
          bg_color?: string | null
          btn1_bg?: string | null
          btn1_text?: string | null
          btn2_bg?: string | null
          btn2_text?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_label?: string | null
          link_url?: string | null
          secondary_link_label?: string | null
          secondary_link_url?: string | null
          section_type?: string
          sort_order?: number
          subtitle?: string | null
          text_color?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          bg_color?: string | null
          btn1_bg?: string | null
          btn1_text?: string | null
          btn2_bg?: string | null
          btn2_text?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_label?: string | null
          link_url?: string | null
          secondary_link_label?: string | null
          secondary_link_url?: string | null
          section_type?: string
          sort_order?: number
          subtitle?: string | null
          text_color?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_payload_cache: {
        Row: {
          cache_key: string
          payload: Json
          updated_at: string
        }
        Insert: {
          cache_key?: string
          payload: Json
          updated_at?: string
        }
        Update: {
          cache_key?: string
          payload?: Json
          updated_at?: string
        }
        Relationships: []
      }
      mfa_recovery_codes: {
        Row: {
          attempts: number
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean
        }
        Insert: {
          attempts?: number
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean
        }
        Update: {
          attempts?: number
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      odoo_config: {
        Row: {
          api_key: string | null
          created_at: string
          database_name: string
          id: string
          is_active: boolean
          last_prices_sync_at: string | null
          last_products_sync_at: string | null
          last_qty_sync_at: string | null
          last_sync_at: string | null
          prices_interval_minutes: number
          products_interval_minutes: number
          qty_interval_minutes: number
          server_url: string
          sync_customers: boolean
          sync_orders: boolean
          sync_prices_enabled: boolean
          sync_products: boolean
          sync_products_enabled: boolean
          sync_qty_enabled: boolean
          updated_at: string
          username: string
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          database_name: string
          id?: string
          is_active?: boolean
          last_prices_sync_at?: string | null
          last_products_sync_at?: string | null
          last_qty_sync_at?: string | null
          last_sync_at?: string | null
          prices_interval_minutes?: number
          products_interval_minutes?: number
          qty_interval_minutes?: number
          server_url: string
          sync_customers?: boolean
          sync_orders?: boolean
          sync_prices_enabled?: boolean
          sync_products?: boolean
          sync_products_enabled?: boolean
          sync_qty_enabled?: boolean
          updated_at?: string
          username: string
        }
        Update: {
          api_key?: string | null
          created_at?: string
          database_name?: string
          id?: string
          is_active?: boolean
          last_prices_sync_at?: string | null
          last_products_sync_at?: string | null
          last_qty_sync_at?: string | null
          last_sync_at?: string | null
          prices_interval_minutes?: number
          products_interval_minutes?: number
          qty_interval_minutes?: number
          server_url?: string
          sync_customers?: boolean
          sync_orders?: boolean
          sync_prices_enabled?: boolean
          sync_products?: boolean
          sync_products_enabled?: boolean
          sync_qty_enabled?: boolean
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string | null
          id: string
          is_active: boolean
          min_order_amount: number | null
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          min_order_amount?: number | null
          name: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          min_order_amount?: number | null
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total: number
          unit_price: number
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          total?: number
          unit_price?: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total?: number
          unit_price?: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          notes: string | null
          order_number: string
          payment_status: string
          shipping_address: string | null
          shipping_cost: number
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_status?: string
          shipping_address?: string | null
          shipping_cost?: number
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_status?: string
          shipping_address?: string | null
          shipping_cost?: number
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateway: {
        Row: {
          api_key: string | null
          created_at: string
          gateway_name: string
          id: string
          is_active: boolean
          merchant_id: string
          mode: string
          secret_key: string | null
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          gateway_name: string
          id?: string
          is_active?: boolean
          merchant_id: string
          mode?: string
          secret_key?: string | null
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          created_at?: string
          gateway_name?: string
          id?: string
          is_active?: boolean
          merchant_id?: string
          mode?: string
          secret_key?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          notes: string | null
          order_id: string | null
          reference: string | null
          status: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          notes?: string | null
          order_id?: string | null
          reference?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          notes?: string | null
          order_id?: string | null
          reference?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_collections: {
        Row: {
          collection_id: string
          product_id: string
        }
        Insert: {
          collection_id: string
          product_id: string
        }
        Update: {
          collection_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_collections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          color: string | null
          created_at: string
          id: string
          odoo_field: string | null
          odoo_model: string | null
          odoo_ref: string | null
          odoo_src_id: number | null
          product_id: string
          slot: number
          sort_order: number
          url: string
          variant_id: string | null
        }
        Insert: {
          alt?: string | null
          color?: string | null
          created_at?: string
          id?: string
          odoo_field?: string | null
          odoo_model?: string | null
          odoo_ref?: string | null
          odoo_src_id?: number | null
          product_id: string
          slot?: number
          sort_order?: number
          url?: string
          variant_id?: string | null
        }
        Update: {
          alt?: string | null
          color?: string | null
          created_at?: string
          id?: string
          odoo_field?: string | null
          odoo_model?: string | null
          odoo_ref?: string | null
          odoo_src_id?: number | null
          product_id?: string
          slot?: number
          sort_order?: number
          url?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          attributes: Json | null
          barcode: string | null
          brand: string | null
          color_hex: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          odoo_id: number | null
          price: number
          product_id: string
          sku: string
          stock: number
          updated_at: string
        }
        Insert: {
          attributes?: Json | null
          barcode?: string | null
          brand?: string | null
          color_hex?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          odoo_id?: number | null
          price?: number
          product_id: string
          sku: string
          stock?: number
          updated_at?: string
        }
        Update: {
          attributes?: Json | null
          barcode?: string | null
          brand?: string | null
          color_hex?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          odoo_id?: number | null
          price?: number
          product_id?: string
          sku?: string
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          base_price: number
          brand: string | null
          category_id: string | null
          created_at: string
          description: string | null
          featured_on_homepage: boolean
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          odoo_id: number | null
          sale_price: number | null
          slug: string
          stock_status: string
          subcategory: string | null
          updated_at: string
          vat_rate: number | null
        }
        Insert: {
          barcode?: string | null
          base_price?: number
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured_on_homepage?: boolean
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          odoo_id?: number | null
          sale_price?: number | null
          slug: string
          stock_status?: string
          subcategory?: string | null
          updated_at?: string
          vat_rate?: number | null
        }
        Update: {
          barcode?: string | null
          base_price?: number
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured_on_homepage?: boolean
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          odoo_id?: number | null
          sale_price?: number | null
          slug?: string
          stock_status?: string
          subcategory?: string | null
          updated_at?: string
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          id: string
          product_id: string | null
          rating: number
          status: string
          title: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          id?: string
          product_id?: string | null
          rating?: number
          status?: string
          title?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          id?: string
          product_id?: string | null
          rating?: number
          status?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_methods: {
        Row: {
          created_at: string
          description: string | null
          estimated_days: string | null
          id: string
          is_active: boolean
          name: string
          price: number
          zones: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_days?: string | null
          id?: string
          is_active?: boolean
          name: string
          price?: number
          zones?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_days?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          zones?: string | null
        }
        Relationships: []
      }
      smtp_settings: {
        Row: {
          admin_notification_email: string
          created_at: string
          from_email: string
          from_name: string
          host: string
          id: string
          password: string
          port: number
          secure: boolean
          updated_at: string
          username: string
        }
        Insert: {
          admin_notification_email?: string
          created_at?: string
          from_email?: string
          from_name?: string
          host?: string
          id?: string
          password?: string
          port?: number
          secure?: boolean
          updated_at?: string
          username?: string
        }
        Update: {
          admin_notification_email?: string
          created_at?: string
          from_email?: string
          from_name?: string
          host?: string
          id?: string
          password?: string
          port?: number
          secure?: boolean
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      store_categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          is_active: boolean
          link_url: string | null
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          link_url?: string | null
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          link_url?: string | null
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      store_sessions: {
        Row: {
          category: string
          created_at: string
          date_text: string
          id: string
          image_url: string | null
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          date_text?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          date_text?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          category: string
          id: string
          is_public: boolean
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          category?: string
          id?: string
          is_public?: boolean
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          category?: string
          id?: string
          is_public?: boolean
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      storefront_page_cache: {
        Row: {
          cache_key: string
          payload: Json
          updated_at: string
        }
        Insert: {
          cache_key: string
          payload: Json
          updated_at?: string
        }
        Update: {
          cache_key?: string
          payload?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_pricelist_prices: { Args: { p: Json }; Returns: number }
      apply_variant_stock: { Args: { p: Json }; Returns: number }
      build_homepage_payload: { Args: never; Returns: Json }
      get_homepage_payload: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      rebuild_storefront_page_cache: { Args: never; Returns: undefined }
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

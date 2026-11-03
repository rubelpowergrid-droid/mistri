export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'customer' | 'mistri' | 'admin';
export type MistriStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended' | 'blocked';
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
export type AdminRole = 'super_admin' | 'verification_admin' | 'booking_manager' | 'support_admin' | 'report_viewer';
export type ComplaintStatus = 'open' | 'under_investigation' | 'resolved' | 'dismissed';
export type NotificationType = 'booking' | 'verification' | 'system' | 'reminder' | 'dispute';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone: string
          email: string | null
          role: UserRole
          preferred_language: string
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id: string
          phone: string
          email?: string | null
          role?: UserRole
          preferred_language?: string
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          phone?: string
          email?: string | null
          role?: UserRole
          preferred_language?: string
          avatar_url?: string | null
          is_active?: boolean
          updated_at?: string
          deleted_at?: string | null
        }
      }
      districts: {
        Row: {
          id: string
          name_bn: string
          name_en: string
          is_active: boolean
          created_at: string
        }
      }
      upazilas: {
        Row: {
          id: string
          district_id: string
          name_bn: string
          name_en: string
          is_active: boolean
          created_at: string
        }
      }
      areas: {
        Row: {
          id: string
          upazila_id: string
          name_bn: string
          name_en: string
          is_active: boolean
          created_at: string
        }
      }
      categories: {
        Row: {
          id: string
          name_bn: string
          name_en: string
          slug: string
          icon_url: string | null
          display_order: number
          is_active: boolean
          created_at: string
        }
      }
      subcategories: {
        Row: {
          id: string
          category_id: string
          name_bn: string
          name_en: string
          slug: string
          icon_url: string | null
          display_order: number
          is_active: boolean
          created_at: string
        }
      }
      customer_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          district_id: string | null
          upazila_id: string | null
          area_id: string | null
          default_address: string | null
          default_location_point: unknown | null
          created_at: string
          updated_at: string
        }
      }
      mistri_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          professional_title: string
          bio: string | null
          date_of_birth: string | null
          gender: string | null
          district_id: string
          upazila_id: string
          area_id: string | null
          street_address: string | null
          location_point: unknown
          max_service_distance_km: number
          experience_years: number
          approval_status: MistriStatus
          is_available: boolean
          charge_type: string
          base_charge: number | null
          average_rating: number
          total_reviews: number
          total_completed_jobs: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
      }
      mistri_documents: {
        Row: {
          id: string
          mistri_profile_id: string
          nid_number: string
          nid_front_storage_path: string
          nid_back_storage_path: string
          verification_notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
      }
      mistri_services: {
        Row: {
          id: string
          mistri_profile_id: string
          category_id: string
          subcategory_id: string
          custom_charge: number | null
          created_at: string
        }
      }
      mistri_portfolio: {
        Row: {
          id: string
          mistri_profile_id: string
          image_url: string
          title: string | null
          description: string | null
          created_at: string
        }
      }
      bookings: {
        Row: {
          id: string
          booking_number: string
          customer_id: string
          mistri_id: string
          category_id: string
          subcategory_id: string
          status: BookingStatus
          work_description: string
          job_address: string
          job_location_point: unknown
          contact_phone: string
          preferred_date: string
          preferred_time: string
          estimated_budget: number | null
          agreed_price: number | null
          work_photos: string[] | null
          cancellation_reason: string | null
          cancelled_by: string | null
          accepted_at: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
      }
      booking_status_logs: {
        Row: {
          id: string
          booking_id: string
          previous_status: BookingStatus | null
          new_status: BookingStatus
          changed_by: string
          notes: string | null
          created_at: string
        }
      }
      location_shares: {
        Row: {
          id: string
          booking_id: string
          mistri_id: string
          customer_id: string
          is_active: boolean
          last_latitude: number | null
          last_longitude: number | null
          last_heading: number | null
          last_speed: number | null
          last_ping_at: string | null
          authorized_at: string
          terminated_at: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          customer_id: string
          mistri_id: string
          rating_work_quality: number
          rating_behaviour: number
          rating_punctuality: number
          rating_pricing: number
          rating_overall: number
          comment: string
          photos: string[] | null
          is_visible: boolean
          moderation_flagged: boolean
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          customer_id: string
          mistri_id: string
          rating_work_quality: number
          rating_behaviour: number
          rating_punctuality: number
          rating_pricing: number
          rating_overall: number
          comment: string
          photos?: string[] | null
          is_visible?: boolean
          moderation_flagged?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          customer_id?: string
          mistri_id?: string
          rating_work_quality?: number
          rating_behaviour?: number
          rating_punctuality?: number
          rating_pricing?: number
          rating_overall?: number
          comment?: string
          photos?: string[] | null
          is_visible?: boolean
          moderation_flagged?: boolean
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          customer_id: string
          mistri_id: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          mistri_id: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          mistri_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string
          type: NotificationType
          reference_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body: string
          type?: NotificationType
          reference_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          body?: string
          type?: NotificationType
          reference_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      device_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          platform: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          platform?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          platform?: string
          updated_at?: string
        }
      }
      complaints: {
        Row: {
          id: string
          booking_id: string
          complainant_user_id: string
          accused_user_id: string
          title: string
          description: string
          status: ComplaintStatus
          resolution_notes: string | null
          resolved_by: string | null
          resolved_at: string | null
          created_at: string
        }
      }
      admin_users: {
        Row: {
          id: string
          user_id: string
          role: AdminRole
          is_active: boolean
          created_at: string
        }
      }
      admin_activity_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          target_entity: string
          target_id: string | null
          details: Json | null
          ip_address: string | null
          created_at: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}


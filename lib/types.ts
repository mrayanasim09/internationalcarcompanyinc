export interface Car {
  id: string
  title: string
  make: string
  model: string
  year: number
  mileage: number
  price: number
  description: string
  location: string
  vin?: string
  engine?: string
  transmission?: string
  exteriorColor?: string
  interiorColor?: string
  driveType?: string
  fuelType?: string
  features?: string[]
  documents?: { name: string; url: string }[]
  images: string[]
  contact: {
    phone: string
    whatsapp: string
  }
  rating: number
  reviews: Review[]
  approved: boolean
  listedAt: Date
  createdAt?: Date
  isFeatured?: boolean
  isInventory?: boolean
}

export interface CarImage {
  id: string
  carId: string
  url: string
  alt: string
  order: number
  createdAt: Date
}

export interface Review {
  id?: string
  carId?: string
  name: string
  comment: string
  stars: number
  createdAt: Date
}

// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          role: 'super_admin' | 'admin' | 'editor' | 'viewer'
          permissions: string[]
          is_active: boolean
          email_verified: boolean
          verification_code?: string | null
          verification_code_expires_at?: string | null
          created_at: string
          updated_at: string
          created_by?: string
          last_login_at?: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          role: 'super_admin' | 'admin' | 'editor' | 'viewer'
          permissions?: string[]
          is_active?: boolean
          email_verified?: boolean
          verification_code?: string | null
          verification_code_expires_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
          last_login_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          role?: 'super_admin' | 'admin' | 'editor' | 'viewer'
          permissions?: string[]
          is_active?: boolean
          email_verified?: boolean
          verification_code?: string | null
          verification_code_expires_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
          last_login_at?: string
        }
      }
      cars: {
        Row: {
          id: string
          title: string
          make: string
          model: string
          year: number
          mileage: number
          price: number
          description: string
          location: string
          vin?: string
          engine?: string
          transmission?: string
          exterior_color?: string
          interior_color?: string
          drive_type?: string
          fuel_type?: string
          features?: string[]
          images: string[]
          contact: {
            phone: string
            whatsapp: string
          }
          rating: number
          approved: boolean
          listed_at: string
          created_at?: string
          updated_at?: string
          created_by?: string
          is_featured?: boolean
          is_inventory?: boolean
        }
        Insert: {
          id?: string
          title: string
          make: string
          model: string
          year: number
          mileage: number
          price: number
          description: string
          location: string
          vin?: string
          engine?: string
          transmission?: string
          exterior_color?: string
          interior_color?: string
          drive_type?: string
          fuel_type?: string
          features?: string[]
          images: string[]
          contact: {
            phone: string
            whatsapp: string
          }
          rating?: number
          approved?: boolean
          listed_at?: string
          created_at?: string
          updated_at?: string
          created_by?: string
          is_featured?: boolean
          is_inventory?: boolean
        }
        Update: {
          id?: string
          title?: string
          make?: string
          model?: string
          year?: number
          mileage?: number
          price?: number
          description?: string
          location?: string
          vin?: string
          engine?: string
          transmission?: string
          exterior_color?: string
          interior_color?: string
          drive_type?: string
          fuel_type?: string
          features?: string[]
          images?: string[]
          contact?: {
            phone: string
            whatsapp: string
          }
          rating?: number
          approved?: boolean
          listed_at?: string
          created_at?: string
          updated_at?: string
          created_by?: string
          is_featured?: boolean
          is_inventory?: boolean
        }
      }
      reviews: {
        Row: {
          id: string
          car_id: string
          name: string
          comment: string
          stars: number
          created_at: string
          approved?: boolean
        }
        Insert: {
          id?: string
          car_id: string
          name: string
          comment: string
          stars: number
          created_at?: string
          approved?: boolean
        }
        Update: {
          id?: string
          car_id?: string
          name?: string
          comment?: string
          stars?: number
          created_at?: string
          approved?: boolean
        }
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          subject: string
          message: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          subject: string
          message: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          subject?: string
          message?: string
          status?: string
          created_at?: string
        }
      }
    }
  }
}

// Admin role types and permissions
export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer'

export interface AdminPermissions {
  // Car management
  canCreateCars: boolean
  canEditCars: boolean
  canDeleteCars: boolean
  canApproveCars: boolean
  canFeatureCars: boolean
  
  // Review management
  canModerateReviews: boolean
  canDeleteReviews: boolean
  
  // User management
  canManageAdmins: boolean
  canViewAnalytics: boolean
  
  // System settings
  canModifySettings: boolean
  canAccessLogs: boolean
}

export interface Admin {
  id: string
  email: string
  role: AdminRole
  passwordHash: string
  permissions: AdminPermissions
  twoFactorEnabled?: boolean
  twoFactorSecret?: string | null
  backupCodes?: string[]
  usedBackupCodes?: string[]
  failedLoginAttempts?: number
  lastLoginAt?: Date
  lockedUntil?: Date | null
  createdAt?: Date
  updatedAt?: Date
  createdBy?: string // ID of admin who created this admin
}

// Role permission presets
export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  super_admin: {
    canCreateCars: true,
    canEditCars: true,
    canDeleteCars: true,
    canApproveCars: true,
    canFeatureCars: true,
    canModerateReviews: true,
    canDeleteReviews: true,
    canManageAdmins: true,
    canViewAnalytics: false,
    canModifySettings: true,
    canAccessLogs: true,
  },
  admin: {
    canCreateCars: true,
    canEditCars: true,
    canDeleteCars: false,
    canApproveCars: true,
    canFeatureCars: true,
    canModerateReviews: true,
    canDeleteReviews: false,
    canManageAdmins: false,
    canViewAnalytics: false,
    canModifySettings: false,
    canAccessLogs: false,
  },
  editor: {
    canCreateCars: false,
    canEditCars: true,
    canDeleteCars: false,
    canApproveCars: false,
    canFeatureCars: false,
    canModerateReviews: true,
    canDeleteReviews: false,
    canManageAdmins: false,
    canViewAnalytics: false,
    canModifySettings: false,
    canAccessLogs: false,
  },
  viewer: {
    canCreateCars: false,
    canEditCars: false,
    canDeleteCars: false,
    canApproveCars: false,
    canFeatureCars: false,
    canModerateReviews: false,
    canDeleteReviews: false,
    canManageAdmins: false,
    canViewAnalytics: false,
    canModifySettings: false,
    canAccessLogs: false,
  },
}


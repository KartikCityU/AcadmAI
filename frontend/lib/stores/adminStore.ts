// frontend/lib/stores/adminStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Admin {
  id: string
  email: string
  name: string
  role: string
  schoolName: string | null
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export interface AdminState {
  admin: Admin | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  hasHydrated: boolean
}

interface AdminStore extends AdminState {
  setAdmin: (admin: Admin) => void
  setToken: (token: string) => void
  login: (admin: Admin, token: string) => void
  logout: () => void
  updateAdmin: (updates: Partial<Admin>) => void
  setLoading: (loading: boolean) => void
  setHasHydrated: (hasHydrated: boolean) => void
  
  // Permission helpers
  hasPermission: (permission: string) => boolean
  hasRole: (roles: string[]) => boolean
  isSuperAdmin: () => boolean
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      // Initial state
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      // Actions
      setAdmin: (admin: Admin) => {
        set({ admin, isAuthenticated: true })
      },

      setToken: (token: string) => {
        set({ token })
      },

      login: (admin: Admin, token: string) => {
        console.log('Admin login called with:', { admin, token })
        set({
          admin,
          token,
          isAuthenticated: true,
          isLoading: false
        })
      },

      logout: () => {
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('edupractice-admin')
        }
      },

      updateAdmin: (updates: Partial<Admin>) => {
        const currentAdmin = get().admin
        if (currentAdmin) {
          set({
            admin: { ...currentAdmin, ...updates }
          })
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ hasHydrated })
      },

      // Permission helpers
      hasPermission: (permission: string) => {
        const { admin } = get()
        if (!admin) return false
        
        // Super admin has all permissions
        if (admin.role === 'super_admin' || 
            (Array.isArray(admin.permissions) && admin.permissions.includes('*'))) {
          return true
        }
        
        // Check if admin has specific permission
        return Array.isArray(admin.permissions) && admin.permissions.includes(permission)
      },

      hasRole: (roles: string[]) => {
        const { admin } = get()
        if (!admin) return false
        return roles.includes(admin.role)
      },

      isSuperAdmin: () => {
        const { admin } = get()
        return admin?.role === 'super_admin'
      }
    }),
    {
      name: 'edupractice-admin',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true)
          // Ensure isAuthenticated is set correctly based on admin/token presence
          if (state.admin && state.token) {
            state.isAuthenticated = true
          }
        }
      },
    }
  )
)
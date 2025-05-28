// frontend/lib/hooks/useHydration.ts
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'

export const useHydration = () => {
  const [hasHydrated, setHasHydrated] = useState(false)
  const authStore = useAuthStore()

  useEffect(() => {
    // Wait for Zustand to hydrate from localStorage
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })
    
    return unsubscribe
  }, [])

  return hasHydrated
}
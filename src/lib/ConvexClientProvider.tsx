import { ReactNode, useEffect } from 'react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { useAuth } from '@clerk/clerk-react'

// @ts-ignore - will be fixed by vite-env.d.ts
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!)

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth()
  
  useEffect(() => {
    convex.setAuth(async () => {
      if (isSignedIn) {
        try {
          const token = await getToken({ template: "convex" })
          return token || null
        } catch (error) {
          // Silently handle auth errors in development
          return null
        }
      }
      return null
    })
  }, [getToken, isSignedIn])

  return <ConvexProvider client={convex}>{children}</ConvexProvider>
} 
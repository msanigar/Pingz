import { ReactNode, useEffect } from 'react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { useAuth } from '@clerk/clerk-react'

// @ts-ignore - will be fixed by vite-env.d.ts
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!)

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn, isLoaded } = useAuth()
  
  useEffect(() => {
    if (!isLoaded) return
    
    console.log('ConvexClientProvider: Setting up auth', { isSignedIn, isLoaded })
    
    convex.setAuth(async () => {
      console.log('ConvexClientProvider: getAuth called', { isSignedIn })
      
              if (isSignedIn) {
        try {
          console.log('ConvexClientProvider: Getting token...')
          // Try with convex template first
          let token = await getToken({ template: "convex" })
          console.log('ConvexClientProvider: Got convex token:', !!token)
          
          // If that fails, try with default template
          if (!token) {
            console.log('ConvexClientProvider: Trying default template...')
            token = await getToken()
            console.log('ConvexClientProvider: Got default token:', !!token)
          }
          
          // Debug: Let's see what's in the token
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]))
              console.log('ConvexClientProvider: JWT payload:', payload)
              console.log('ConvexClientProvider: JWT iss:', payload.iss)
              console.log('ConvexClientProvider: JWT sub:', payload.sub)
            } catch (e) {
              console.log('ConvexClientProvider: Could not decode JWT:', e)
            }
          }
          
          return token || null
        } catch (error) {
          console.error('ConvexClientProvider: Token error:', error)
          return null
        }
      }
      console.log('ConvexClientProvider: Not signed in, returning null')
      return null
    })
  }, [getToken, isSignedIn, isLoaded])

  return <ConvexProvider client={convex}>{children}</ConvexProvider>
} 
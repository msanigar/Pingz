import { SignIn } from '@clerk/clerk-react'

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-chat-bg">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-chat-accent font-mono">
            Pingz
          </h1>
          <p className="mt-2 text-chat-text-muted">
            Real-time IRC-style chat
          </p>
        </div>
        
        <div className="flex justify-center">
          <SignIn 
            routing="hash"
            appearance={{
              variables: {
                colorPrimary: '#00ff00',
                colorBackground: '#1a1a1a',
                colorInputBackground: '#0f0f0f',
                colorInputText: '#ffffff',
                colorText: '#ffffff',
                colorTextSecondary: '#888888',
              },
              elements: {
                socialButtonsIconButton: {
                  backgroundColor: '#333333',
                  border: '1px solid #555555',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#444444',
                  }
                },
                socialButtonsProviderIcon: {
                  filter: 'invert(1) brightness(0.9)',
                },
                providerIcon: {
                  filter: 'invert(1) brightness(0.9)',
                },
                socialButtonsBlockButton: {
                  backgroundColor: '#333333',
                  border: '1px solid #555555',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#444444',
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  )
} 
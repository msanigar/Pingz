import { SignIn } from '@clerk/clerk-react'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-chat-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-primary opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-primary opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/favicon.png" alt="Pingz" className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Pingz</h1>
          <p className="text-chat-text-muted">
            Real-time chat with modern vibes
          </p>
        </div>

        {/* Sign In Component */}
        <div className="bg-chat-surface/80 backdrop-blur-sm rounded-2xl border border-chat-border shadow-2xl p-6">
          <SignIn
            appearance={{
              variables: {
                colorPrimary: '#27abde',
                colorBackground: '#1a1a1a',
                colorInputBackground: '#0f0f0f',
                colorInputText: '#ffffff',
                colorText: '#ffffff',
                colorTextSecondary: '#a0a0a0',
                fontSize: '14px',
                borderRadius: '8px',
              },
              elements: {
                rootBox: {
                  width: '100%',
                },
                card: {
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  border: 'none',
                },
                headerTitle: {
                  background: 'linear-gradient(135deg, #27abde 0%, #00a99e 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  fontSize: '24px',
                  fontWeight: '700',
                },
                headerSubtitle: {
                  color: '#a0a0a0',
                },
                socialButtonsIconButton: {
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #3a3a3a',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#3a3a3a',
                    borderColor: '#27abde',
                  }
                },
                socialButtonsProviderIcon: {
                  filter: 'invert(1) brightness(0.9)',
                },
                providerIcon: {
                  filter: 'invert(1) brightness(0.9)',
                },
                socialButtonsBlockButton: {
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #3a3a3a',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#3a3a3a',
                    borderColor: '#27abde',
                  }
                },
                formButtonPrimary: {
                  background: 'linear-gradient(135deg, #27abde 0%, #00a99e 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2196d6 0%, #009a90 100%)',
                    transform: 'translateY(-1px)',
                  },
                },
                formFieldInput: {
                  backgroundColor: '#0f0f0f',
                  borderColor: '#3a3a3a',
                  color: '#ffffff',
                  '&:focus': {
                    borderColor: '#27abde',
                    boxShadow: '0 0 0 2px rgba(39, 171, 222, 0.1)',
                  },
                },
                footerActionLink: {
                  color: '#27abde',
                  '&:hover': {
                    color: '#00a99e',
                  },
                },
              },
            }}
          />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-chat-text-muted">
          <p>Built with React 19, Convex & Clerk</p>
        </div>
      </div>
    </div>
  )
} 
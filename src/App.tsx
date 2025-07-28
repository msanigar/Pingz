import { SignedIn, SignedOut } from '@clerk/clerk-react'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'

function App() {
  return (
    <div className="min-h-screen bg-chat-bg">
      <SignedOut>
        <AuthPage />
      </SignedOut>
      <SignedIn>
        <ChatPage />
      </SignedIn>
    </div>
  )
}

export default App 
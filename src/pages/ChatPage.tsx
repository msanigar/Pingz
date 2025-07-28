import { useUser, UserButton } from '@clerk/clerk-react'
import { useQuery, useMutation } from 'convex/react'
import { useState, useEffect } from 'react'
import { api } from '../../convex/_generated/api'
import { useAppStore } from '../state/useAppStore'
import MessageList from '../components/MessageList'
import MessageInput from '../components/MessageInput'
import ChannelSidebar from '../components/ChannelSidebar'
import SearchBar from '../components/SearchBar'

export default function ChatPage() {
  const { user } = useUser()
  const { currentChannel, setCurrentChannel, isSidebarOpen, toggleSidebar } = useAppStore()
  
  const messages = useQuery(api.chat.getMessages, { channel: currentChannel })
  const onlineUsersCount = useQuery(api.chat.getOnlineUsersCount)
  const sendMessage = useMutation(api.chat.sendMessage)
  const updateUserPresence = useMutation(api.chat.updateUserPresence)
  
  const [newMessage, setNewMessage] = useState('')

  // Update user presence on mount and periodically
  useEffect(() => {
    if (!user) return

    const updatePresence = () => {
      updateUserPresence({
        username: user.firstName || user.username || 'Anonymous',
        avatarUrl: user.imageUrl,
      })
    }

    // Update immediately
    updatePresence()

    // Update every 2 minutes to stay online
    const interval = setInterval(updatePresence, 2 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user, updateUserPresence])

  const handleSendMessage = async (text: string, fileId?: string, fileName?: string, fileType?: string) => {
    if (!user) return
    
    await sendMessage({ 
      text,
      author: user.firstName || user.username || 'Anonymous',
      channel: currentChannel,
      avatarUrl: user.imageUrl,
      fileId,
      fileName,
      fileType,
    })
  }

  const handleChannelChange = (channel: string) => {
    setCurrentChannel(channel)
  }

  const closeSidebar = () => {
    useAppStore.setState({ isSidebarOpen: false })
  }

  const handleMessageClick = (messageId: string) => {
    // Scroll to message - could implement this later
    console.log('Navigate to message:', messageId)
  }

  return (
    <div className="h-screen flex bg-chat-bg">
      {/* Channel Sidebar */}
      <ChannelSidebar
        currentChannel={currentChannel}
        onChannelChange={handleChannelChange}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-chat-border bg-chat-surface">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="md:hidden text-chat-text-muted hover:text-chat-text"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Channel info */}
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-chat-accent font-mono">
                #{currentChannel}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-chat-text-muted">
                <span>{messages?.length || 0} messages</span>
                <span>{onlineUsersCount || 0} online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden sm:block w-64">
              <SearchBar 
                currentChannel={currentChannel}
                onMessageClick={handleMessageClick}
              />
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-2">
              <span className="text-chat-text-muted text-sm hidden sm:block">
                {user?.firstName || user?.username}
              </span>
              <UserButton 
                appearance={{
                  variables: {
                    colorPrimary: '#00ff00',
                  }
                }}
              />
            </div>
          </div>
        </header>

        {/* Mobile Search (visible when sidebar is closed) */}
        <div className="sm:hidden p-4 border-b border-chat-border bg-chat-surface">
          <SearchBar 
            currentChannel={currentChannel}
            onMessageClick={handleMessageClick}
          />
        </div>

        {/* Chat Messages and Input */}
        <div className="flex-1 flex flex-col min-h-0">
          <MessageList 
            messages={messages || []} 
            currentChannel={currentChannel}
          />
          <MessageInput 
            value={newMessage}
            onChange={setNewMessage}
            onSubmit={handleSendMessage}
            currentChannel={currentChannel}
          />
        </div>
      </div>
    </div>
  )
} 
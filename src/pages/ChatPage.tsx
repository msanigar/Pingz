import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAppStore } from '../state/useAppStore'
import MessageList from '../components/MessageList'
import MessageInput from '../components/MessageInput'
import ChannelSidebar from '../components/ChannelSidebar'
import SearchBar from '../components/SearchBar'
import OnlineUsersDropdown from '../components/OnlineUsersDropdown'

export default function ChatPage() {
  const { user } = useUser()
  const { currentChannel, setCurrentChannel, isSidebarOpen, toggleSidebar } = useAppStore()
  
  const messages = useQuery(api.chat.getMessages, { channel: currentChannel })
  const onlineUsersCount = useQuery(api.chat.getOnlineUsersCount)
  const isAdmin = useQuery(api.chat.isCurrentUserAdmin)
  const sendMessage = useMutation(api.chat.sendMessage)
  const updateUserPresence = useMutation(api.chat.updateUserPresence)

  const [newMessage, setNewMessage] = useState('')

  // Update user presence
  useEffect(() => {
    if (!user) return

    const updatePresence = () => {
      updateUserPresence({
        username: user.firstName || user.username || 'Anonymous',
        avatarUrl: user.imageUrl
      })
    }

    // Update immediately
    updatePresence()

    // Update every 2 minutes
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
    <div className="chat-container h-screen flex">
      {/* Channel Sidebar */}
      <ChannelSidebar
        currentChannel={currentChannel}
        onChannelChange={handleChannelChange}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-chat-border bg-gradient-subtle">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 hover:bg-chat-surface rounded-lg transition-colors"
            >
              <span className="text-chat-text">☰</span>
            </button>
            <div>
              <h1 className="text-xl font-bold gradient-text">#{currentChannel}</h1>
              {onlineUsersCount !== undefined && (
                <OnlineUsersDropdown 
                  onlineCount={onlineUsersCount} 
                  isAdmin={isAdmin || false} 
                />
              )}
            </div>
          </div>
          
          {/* Search Bar */}
          <SearchBar 
            currentChannel={currentChannel} 
            onMessageClick={handleMessageClick}
          />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <MessageList 
            messages={messages || []} 
            currentChannel={currentChannel}
          />
        </div>

        {/* Message Input */}
        <div className="border-t border-chat-border bg-gradient-subtle">
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
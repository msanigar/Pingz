import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

interface OnlineUser {
  id: string
  username: string
  avatarUrl?: string
  lastSeen: number
}

interface OnlineUsersDropdownProps {
  onlineCount: number
  isAdmin: boolean
}

export default function OnlineUsersDropdown({ onlineCount, isAdmin }: OnlineUsersDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Only fetch online users if admin and dropdown is open
  const onlineUsers = useQuery(api.chat.getOnlineUsers, 
    isAdmin && isOpen ? {} : "skip"
  ) as OnlineUser[] | undefined

  const formatLastSeen = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (!isAdmin) {
    // Non-admin just sees the count without dropdown
    return (
      <div className="flex items-center space-x-2 text-sm text-chat-text-muted">
        <div className="online-indicator"></div>
        <span>{onlineCount} online</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <div 
        className="flex items-center space-x-2 text-sm text-chat-text-muted cursor-pointer hover:text-chat-text transition-colors"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="online-indicator"></div>
        <span>{onlineCount} online</span>
        {isAdmin && (
          <span className="text-xs text-chat-primary ml-1">👑</span>
        )}
      </div>

      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 w-64 bg-chat-surface border border-chat-border rounded-lg shadow-xl z-50"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="p-3 border-b border-chat-border">
            <div className="text-sm font-medium text-chat-text">Online Users</div>
            <div className="text-xs text-chat-text-muted">{onlineCount} users active</div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {onlineUsers ? (
              onlineUsers.length > 0 ? (
                <div className="p-2 space-y-1">
                  {onlineUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gradient-subtle transition-colors">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {user.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt={user.username}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-chat-accent flex items-center justify-center text-chat-bg font-bold text-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      {/* User info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-chat-text truncate">
                          {user.username}
                        </div>
                        <div className="text-xs text-chat-text-muted">
                          {formatLastSeen(user.lastSeen)}
                        </div>
                      </div>
                      
                      {/* Online indicator */}
                      <div className="online-indicator"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-chat-text-muted">
                  No users online
                </div>
              )
            ) : (
              <div className="p-4 text-center text-sm text-chat-text-muted">
                Loading users...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 
import { useEffect, useRef } from 'react'
import { useMutation } from 'convex/react'
import { useUser } from '@clerk/clerk-react'
import { api } from '../../convex/_generated/api'

interface Message {
  _id: string
  text: string
  author: string
  _creationTime: number
  avatarUrl?: string
  reactions?: Array<{
    emoji: string
    userId: string
    username: string
  }>
  fileUrl?: string
  fileName?: string
  fileType?: string
}

interface MessageListProps {
  messages: Message[]
  currentChannel: string
}

export default function MessageList({ messages, currentChannel }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useUser()
  const toggleReaction = useMutation(api.chat.toggleReaction)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      // Today - show time only
      return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      })
    } else if (diffDays === 1) {
      // Yesterday
      return `Yesterday ${date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      })}`
    } else if (diffDays < 7) {
      // This week - show day and time
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    } else {
      // Older - show full date
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return
    
    await toggleReaction({
      messageId: messageId as any,
      emoji,
      username: user.firstName || user.username || 'Anonymous'
    })
  }

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🚀']

  const groupReactions = (reactions?: Array<{emoji: string, userId: string, username: string}>) => {
    if (!reactions || reactions.length === 0) return {}
    
    return reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = []
      }
      acc[reaction.emoji].push(reaction)
      return acc
    }, {} as Record<string, Array<{emoji: string, userId: string, username: string}>>)
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.length === 0 ? (
        <div className="text-center text-chat-text-muted py-8">
          <p className="text-lg">Welcome to #{currentChannel}</p>
          <p className="text-sm">No messages yet. Be the first to say something!</p>
        </div>
      ) : (
        messages.map((message) => {
          const groupedReactions = groupReactions(message.reactions)
          
          return (
            <div key={message._id} className="chat-message group hover:bg-chat-surface/30 px-3 py-2 rounded-lg">
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {message.avatarUrl ? (
                    <img 
                      src={message.avatarUrl} 
                      alt={message.author}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-chat-accent flex items-center justify-center text-chat-bg font-bold text-sm">
                      {message.author.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                {/* Message content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-chat-accent font-medium">
                      {message.author}
                    </span>
                    <span className="chat-timestamp text-xs">
                      {formatTime(message._creationTime)}
                    </span>
                  </div>
                  
                  <div className="text-chat-text mt-1 break-words">
                    {message.text}
                  </div>

                  {/* File attachment */}
                  {message.fileUrl && (
                    <div className="mt-2">
                      {message.fileType?.startsWith('image/') ? (
                        <div className="max-w-sm">
                          <img 
                            src={message.fileUrl} 
                            alt={message.fileName || 'Image'}
                            className="rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(message.fileUrl, '_blank')}
                          />
                          {message.fileName && (
                            <div className="text-xs text-chat-text-muted mt-1">{message.fileName}</div>
                          )}
                        </div>
                      ) : (
                        <a 
                          href={message.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-3 py-2 bg-chat-surface border border-chat-border rounded-lg hover:bg-chat-bg transition-colors"
                        >
                          <div className="text-chat-accent">
                            📎
                          </div>
                          <div>
                            <div className="text-sm text-chat-text">
                              {message.fileName || 'Download file'}
                            </div>
                            <div className="text-xs text-chat-text-muted">
                              {message.fileType || 'Unknown type'}
                            </div>
                          </div>
                        </a>
                      )}
                    </div>
                  )}
                  
                  {/* Reactions */}
                  {Object.keys(groupedReactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(groupedReactions).map(([emoji, reactions]) => {
                        const currentUserId = user?.id || `temp_${user?.firstName || user?.username || 'Anonymous'}`
                        const userHasReacted = reactions.some(r => r.userId === currentUserId)
                        
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(message._id, emoji)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border transition-colors ${
                              userHasReacted
                                ? 'bg-chat-accent/20 border-chat-accent text-chat-accent'
                                : 'bg-chat-surface border-chat-border text-chat-text-muted hover:bg-chat-accent/10 hover:border-chat-accent/50'
                            }`}
                            title={reactions.map(r => r.username).join(', ')}
                          >
                            <span>{emoji}</span>
                            <span>{reactions.length}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                  
                  {/* Reaction picker (shown on hover) */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                    <div className="flex space-x-1">
                      {commonEmojis.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(message._id, emoji)}
                          className="w-6 h-6 text-sm hover:bg-chat-surface rounded transition-colors"
                          title={`React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  )
} 
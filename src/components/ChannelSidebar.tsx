import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

interface ChannelSidebarProps {
  currentChannel: string
  onChannelChange: (channel: string) => void
  isOpen: boolean
  onClose: () => void
}

export default function ChannelSidebar({ currentChannel, onChannelChange, isOpen, onClose }: ChannelSidebarProps) {
  const channels = useQuery(api.chat.getChannels)
  const createChannel = useMutation(api.chat.createChannel)
  
  const [isCreating, setIsCreating] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')

  // Default channels if none exist
  const defaultChannels = ['general', 'random', 'dev']
  const allChannels = channels || []

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChannelName.trim()) return

    try {
      await createChannel({
        name: newChannelName.trim().toLowerCase(),
        description: newChannelDescription.trim() || undefined
      })
      setNewChannelName('')
      setNewChannelDescription('')
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to create channel:', error)
    }
  }

  const handleChannelClick = (channelName: string) => {
    onChannelChange(channelName)
    if (window.innerWidth < 768) {
      onClose() // Close sidebar on mobile after selection
    }
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 md:z-0
        w-64 bg-chat-surface border-r border-chat-border
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-chat-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-chat-accent">Channels</h2>
              <button
                onClick={onClose}
                className="md:hidden text-chat-text-muted hover:text-chat-text"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Channel list */}
          <div className="flex-1 overflow-y-auto p-2">
            {/* Default channels first */}
            {defaultChannels.map(channelName => (
              <button
                key={channelName}
                onClick={() => handleChannelClick(channelName)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                  currentChannel === channelName
                    ? 'bg-chat-accent/20 text-chat-accent border border-chat-accent/30'
                    : 'text-chat-text hover:bg-chat-bg/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-chat-text-muted">#</span>
                  <span className="font-medium">{channelName}</span>
                </div>
              </button>
            ))}

            {/* Custom channels */}
            {allChannels
              .filter(channel => !defaultChannels.includes(channel.name))
              .map(channel => (
                <button
                  key={channel._id}
                  onClick={() => handleChannelClick(channel.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                    currentChannel === channel.name
                      ? 'bg-chat-accent/20 text-chat-accent border border-chat-accent/30'
                      : 'text-chat-text hover:bg-chat-bg/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-chat-text-muted">#</span>
                    <span className="font-medium">{channel.name}</span>
                  </div>
                  {channel.description && (
                    <div className="text-xs text-chat-text-muted ml-4 mt-1">
                      {channel.description}
                    </div>
                  )}
                </button>
              ))}

            {/* Create channel button */}
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full text-left px-3 py-2 rounded-lg mb-1 text-chat-text-muted hover:text-chat-text hover:bg-chat-bg/50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span>+</span>
                  <span>Create channel</span>
                </div>
              </button>
            ) : (
              <form onSubmit={handleCreateChannel} className="p-3 bg-chat-bg rounded-lg mb-1">
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="Channel name"
                  className="w-full px-2 py-1 mb-2 bg-chat-surface border border-chat-border rounded text-sm focus:outline-none focus:border-chat-accent"
                  autoFocus
                />
                <input
                  type="text"
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full px-2 py-1 mb-2 bg-chat-surface border border-chat-border rounded text-sm focus:outline-none focus:border-chat-accent"
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={!newChannelName.trim()}
                    className="px-2 py-1 bg-chat-accent text-chat-bg text-xs rounded disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false)
                      setNewChannelName('')
                      setNewChannelDescription('')
                    }}
                    className="px-2 py-1 bg-chat-border text-chat-text text-xs rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 
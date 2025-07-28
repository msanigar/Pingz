import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

// Debug component to show user info
function DebugUserInfo() {
  const testAuth = useQuery(api.chat.testAuth)
  
  if (!testAuth) return <div className="text-chat-text-muted">Loading user info...</div>
  
  return (
    <div className="mt-2 p-2 bg-chat-surface rounded text-xs">
      <div className="text-chat-accent font-bold">Your Identity:</div>
      <div className="text-chat-text-muted break-all">
        Subject: {testAuth.subject || 'null'}
      </div>
      <div className="text-chat-text-muted break-all">
        Email: {testAuth.email || 'null'}
      </div>
      <div className="text-chat-text-muted break-all">
        Primary Email: {testAuth.primaryEmail || 'null'}
      </div>
    </div>
  )
}

interface ChannelSidebarProps {
  currentChannel: string
  onChannelChange: (channel: string) => void
  isOpen: boolean
  onClose: () => void
}

export default function ChannelSidebar({ currentChannel, onChannelChange, isOpen, onClose }: ChannelSidebarProps) {
  const channels = useQuery(api.chat.getChannels)
  const isAdmin = useQuery(api.chat.isCurrentUserAdmin)
  const createChannel = useMutation(api.chat.createChannel)
  const deleteChannel = useMutation(api.chat.deleteChannel)
  
  const [isCreating, setIsCreating] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')
  const [deletingChannelId, setDeletingChannelId] = useState<string | null>(null)

  // Default channels if none exist
  const defaultChannels = ['general', 'random', 'dev']
  const allChannels = channels || []

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChannelName.trim()) return

    try {
      await createChannel({
        name: newChannelName.trim(), // Backend will handle lowercase conversion
        description: newChannelDescription.trim() || undefined
      })
      setNewChannelName('')
      setNewChannelDescription('')
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to create channel:', error)
      alert(error instanceof Error ? error.message : 'Failed to create channel')
    }
  }

  const handleDeleteChannel = async (channelId: string, channelName: string) => {
    if (!confirm(`Are you sure you want to delete #${channelName}? All messages will be moved to #general.`)) {
      return
    }

    setDeletingChannelId(channelId)
    try {
      await deleteChannel({ channelId: channelId as any })
      
      // If we're currently in the deleted channel, switch to general
      if (currentChannel === channelName) {
        onChannelChange('general')
      }
    } catch (error) {
      console.error('Failed to delete channel:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete channel')
    } finally {
      setDeletingChannelId(null)
    }
  }

  const handleChannelClick = (channelName: string) => {
    onChannelChange(channelName)
    if (window.innerWidth < 768) {
      onClose() // Close sidebar on mobile after selection
    }
  }

  return (
    <div className={`
      fixed md:relative z-40 h-full md:h-auto
      w-64 chat-sidebar
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar content */}
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-chat-border bg-gradient-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold gradient-text">Channels</h2>
              {/* Debug: Show admin status */}
              <div className="text-xs text-chat-text-muted mt-1">
                Admin: {isAdmin === undefined ? 'Loading...' : isAdmin ? 'YES ✓' : 'NO ✗'}
              </div>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-1 hover:bg-chat-surface rounded transition-colors"
            >
              <span className="text-chat-text-muted">×</span>
            </button>
          </div>
        </div>

        {/* Channels list */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {/* Default channels */}
            {defaultChannels.map((channel) => (
              <div key={channel} className="flex items-center group">
                <button
                  onClick={() => handleChannelClick(channel)}
                  className={`channel-item ${
                    currentChannel === channel ? 'channel-item-active' : 'text-chat-text-muted hover:text-chat-text'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>#</span>
                    <span>{channel}</span>
                  </div>
                </button>
                {/* Admin delete button (but not for general) */}
                {isAdmin && channel !== 'general' && (
                  <button
                    onClick={() => {
                      const channelObj = allChannels.find((c: any) => c.name === channel)
                      if (channelObj) handleDeleteChannel(channelObj._id, channel)
                    }}
                    disabled={deletingChannelId === allChannels.find((c: any) => c.name === channel)?._id}
                    className="ml-2 p-1 text-chat-error hover:text-red-300 hover:bg-red-900/20 rounded transition-all opacity-70 hover:opacity-100"
                    title={`Delete #${channel}`}
                  >
                    {deletingChannelId === allChannels.find((c: any) => c.name === channel)?._id ? '...' : '🗑️'}
                  </button>
                )}
              </div>
            ))}

            {/* Custom channels */}
            {allChannels
              .filter((channel: any) => !defaultChannels.includes(channel.name))
              .map((channel: any) => (
                <div key={channel._id} className="flex items-center group">
                  <button
                    onClick={() => handleChannelClick(channel.name)}
                    className={`channel-item ${
                      currentChannel === channel.name ? 'channel-item-active' : 'text-chat-text-muted hover:text-chat-text'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>#</span>
                      <span>{channel.name}</span>
                    </div>
                  </button>
                  {/* Admin delete button */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteChannel(channel._id, channel.name)}
                      disabled={deletingChannelId === channel._id}
                      className="ml-2 p-1 text-chat-error hover:text-red-300 hover:bg-red-900/20 rounded transition-all opacity-70 hover:opacity-100"
                      title={`Delete #${channel.name}`}
                    >
                      {deletingChannelId === channel._id ? '...' : '🗑️'}
                    </button>
                  )}
                </div>
              ))}

            {/* Create channel button */}
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="channel-item text-chat-text-muted hover:text-chat-text border-2 border-dashed border-chat-border hover:border-chat-primary"
              >
                <div className="flex items-center space-x-2">
                  <span>+</span>
                  <span>Create channel</span>
                </div>
              </button>
            ) : (
              <form onSubmit={handleCreateChannel} className="p-3 bg-gradient-subtle rounded-lg border border-chat-border">
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="Channel name (lowercase)"
                  className="w-full px-3 py-2 mb-2 bg-chat-surface border border-chat-border rounded text-sm focus:outline-none focus:border-chat-primary transition-colors"
                  autoFocus
                />
                <input
                  type="text"
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full px-3 py-2 mb-3 bg-chat-surface border border-chat-border rounded text-sm focus:outline-none focus:border-chat-primary transition-colors"
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="chat-button flex-1 text-sm py-2"
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
                    className="chat-button-secondary flex-1 text-sm py-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Admin indicator */}
        {isAdmin && (
          <div className="p-4 border-t border-chat-border bg-gradient-subtle">
            <div className="admin-badge">
              <span>👑 Admin Mode</span>
            </div>
          </div>
        )}

        {/* Debug section - remove after testing */}
        <div className="p-4 border-t border-chat-border bg-chat-bg/50">
          <div className="text-xs space-y-1">
            <div className="text-chat-text-muted">Debug Info:</div>
            <div className="text-chat-text-muted">Channels: {allChannels.length}</div>
            <div className="text-chat-text-muted">Admin Status: {String(isAdmin)}</div>
            <div className="text-chat-text-muted">Creating: {String(isCreating)}</div>
            <DebugUserInfo />
          </div>
        </div>
      </div>
    </div>
  )
} 
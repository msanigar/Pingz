import { useState, useEffect, useRef } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

interface SearchBarProps {
  currentChannel: string
  onMessageClick?: (messageId: string) => void
}

export default function SearchBar({ currentChannel, onMessageClick }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)
  
  const searchResults = useQuery(
    api.chat.searchMessages,
    debouncedQuery.length >= 2 ? { query: debouncedQuery, channel: currentChannel } : 'skip'
  )

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchFocus = () => {
    setIsOpen(true)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setDebouncedQuery('')
    setIsOpen(false)
  }

  const handleResultClick = (messageId: string) => {
    onMessageClick?.(messageId)
    setIsOpen(false)
  }

  const formatSearchTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text
    
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-chat-accent/30 text-chat-accent">
          {part}
        </mark>
      ) : part
    )
  }

  return (
    <div ref={searchRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleSearchFocus}
          placeholder={`Search in #${currentChannel}...`}
          className="w-full pl-8 pr-8 py-2 bg-chat-surface border border-chat-border rounded-lg text-sm focus:outline-none focus:border-chat-accent focus:ring-1 focus:ring-chat-accent transition-colors"
        />
        
        {/* Search Icon */}
        <div className="absolute left-2.5 top-2.5 text-chat-text-muted">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-2 top-2 text-chat-text-muted hover:text-chat-text p-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchQuery.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-chat-surface border border-chat-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {debouncedQuery !== searchQuery ? (
            // Loading state
            <div className="p-4 text-center text-chat-text-muted">
              <div className="animate-pulse">Searching...</div>
            </div>
          ) : !searchResults || searchResults.length === 0 ? (
            // No results
            <div className="p-4 text-center text-chat-text-muted">
              No messages found for "{searchQuery}"
            </div>
          ) : (
            // Results
            <div className="py-2">
              <div className="px-3 py-1 text-xs text-chat-text-muted border-b border-chat-border">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} in #{currentChannel}
              </div>
              {searchResults.map((result) => (
                <button
                  key={result._id}
                  onClick={() => handleResultClick(result._id)}
                  className="w-full text-left px-3 py-3 hover:bg-chat-bg/50 transition-colors border-b border-chat-border/50 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {result.avatarUrl ? (
                        <img 
                          src={result.avatarUrl} 
                          alt={result.author}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-chat-accent flex items-center justify-center text-chat-bg font-bold text-xs">
                          {result.author.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    {/* Message content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-chat-accent font-medium text-sm">
                          {result.author}
                        </span>
                        <span className="text-xs text-chat-text-muted">
                          {formatSearchTime(result._creationTime)}
                        </span>
                      </div>
                      <div className="text-sm text-chat-text truncate">
                        {highlightMatch(result.text, searchQuery)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
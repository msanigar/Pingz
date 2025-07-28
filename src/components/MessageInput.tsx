import { useState, useRef, useEffect } from 'react'
import FileUpload from './FileUpload'

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (text: string, fileId?: string, fileName?: string, fileType?: string) => void
  currentChannel: string
}

export default function MessageInput({ value, onChange, onSubmit, currentChannel }: MessageInputProps) {
  const [isComposing, setIsComposing] = useState(false)
  const [attachedFile, setAttachedFile] = useState<{id: string, name: string, type: string} | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const maxLength = 2000
  const remainingChars = maxLength - value.length
  const isOverLimit = remainingChars < 0
  const isWarning = remainingChars < 100

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    const trimmedValue = value.trim()
    if ((trimmedValue || attachedFile) && !isOverLimit) {
      onSubmit(
        trimmedValue, 
        attachedFile?.id, 
        attachedFile?.name, 
        attachedFile?.type
      )
      onChange('')
      setAttachedFile(null)
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleFileUploaded = (fileId: string, fileName: string, fileType: string) => {
    setAttachedFile({ id: fileId, name: fileName, type: fileType })
  }

  const removeAttachedFile = () => {
    setAttachedFile(null)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  return (
    <form onSubmit={handleFormSubmit} className="p-4 border-t border-chat-border bg-chat-surface">
      {/* Character count and channel indicator */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs text-chat-text-muted">
          #{currentChannel}
        </div>
        <div className={`text-xs ${
          isOverLimit 
            ? 'text-red-400' 
            : isWarning 
              ? 'text-yellow-400' 
              : 'text-chat-text-muted'
        }`}>
          {remainingChars < 0 ? `${-remainingChars} characters over limit` : `${remainingChars} characters remaining`}
        </div>
      </div>

      {/* Attached file preview */}
      {attachedFile && (
        <div className="mb-2 p-2 bg-chat-bg rounded-lg border border-chat-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-chat-accent">
                {attachedFile.type.startsWith('image/') ? '🖼️' : '📎'}
              </div>
              <span className="text-sm text-chat-text truncate">{attachedFile.name}</span>
            </div>
            <button
              onClick={removeAttachedFile}
              className="text-chat-text-muted hover:text-red-400 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex space-x-2 items-end">
        <FileUpload 
          onFileUploaded={handleFileUploaded}
          disabled={isOverLimit}
        />
        
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={`Message #${currentChannel}...`}
            className={`chat-input w-full px-3 py-2 rounded resize-none focus:outline-none transition-colors ${
              isOverLimit ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
            }`}
            style={{ minHeight: '40px', maxHeight: '120px' }}
            autoFocus
            disabled={isOverLimit}
          />
        </div>
        <button
          type="submit"
          disabled={(!value.trim() && !attachedFile) || isOverLimit}
          className={`px-4 py-2 font-medium rounded transition-colors ${
            (!value.trim() && !attachedFile) || isOverLimit
              ? 'bg-chat-border text-chat-text-muted cursor-not-allowed'
              : 'bg-chat-accent text-chat-bg hover:bg-chat-accent/80'
          }`}
          style={{ height: 'fit-content' }}
        >
          Send
        </button>
      </div>

      {/* Help text */}
      <div className="mt-2 flex justify-between items-center text-xs text-chat-text-muted">
        <div>
          <kbd className="px-1 py-0.5 bg-chat-bg rounded text-xs">Enter</kbd> to send • 
          <kbd className="px-1 py-0.5 bg-chat-bg rounded text-xs ml-1">Shift+Enter</kbd> for new line
        </div>
        {isOverLimit && (
          <div className="text-red-400">
            Message is too long
          </div>
        )}
      </div>
    </form>
  )
} 
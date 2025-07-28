import { useState, useRef, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import FileUpload from './FileUpload'

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (text: string, fileId?: string, fileName?: string, fileType?: string) => Promise<void>
  currentChannel: string
}

export default function MessageInput({ value, onChange, onSubmit, currentChannel }: MessageInputProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachedFile, setAttachedFile] = useState<{
    id: string
    name: string
    type: string
  } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }, [value])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedValue = value.trim()
    if (!trimmedValue && !attachedFile) return
    
    if (trimmedValue.length > 1000) {
      alert('Message is too long. Please keep it under 1000 characters.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(
        trimmedValue,
        attachedFile?.id,
        attachedFile?.name,
        attachedFile?.type
      )
      onChange('')
      setAttachedFile(null)
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleFileAttach = (fileId: string, fileName: string, fileType: string) => {
    setAttachedFile({ id: fileId, name: fileName, type: fileType })
  }

  const removeAttachment = () => {
    setAttachedFile(null)
  }

  const characterCount = value.length
  const isOverLimit = characterCount > 1000

  return (
    <div className="p-4">
      {/* File attachment preview */}
      {attachedFile && (
        <div className="mb-3 p-3 bg-gradient-subtle border border-chat-border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-chat-primary">📎</span>
              <span className="text-sm text-chat-text truncate">{attachedFile.name}</span>
              <span className="text-xs text-chat-text-muted">({attachedFile.type})</span>
            </div>
            <button
              onClick={removeAttachment}
              className="text-chat-error hover:text-red-300 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message #${currentChannel}...`}
            className={`chat-input resize-none min-h-[3rem] max-h-[120px] ${
              isOverLimit ? 'border-chat-error focus:ring-chat-error/50' : ''
            }`}
            disabled={isSubmitting}
            rows={1}
          />
          
          {/* Character counter */}
          <div className={`absolute bottom-2 right-2 text-xs ${
            isOverLimit ? 'text-chat-error' : 'text-chat-text-muted'
          }`}>
            {characterCount}/1000
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileUpload onFileUploaded={handleFileAttach} />
            <span className="text-xs text-chat-text-muted">
              Press Enter to send, Shift+Enter for new line
            </span>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || (!value.trim() && !attachedFile) || isOverLimit}
            className="chat-button disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending...</span>
              </div>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 
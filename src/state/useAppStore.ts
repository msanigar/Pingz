import { create } from 'zustand'

interface AppState {
  // UI State
  isSidebarOpen: boolean
  currentChannel: string
  
  // Chat State
  isTyping: boolean
  unreadCount: number
  
  // Actions
  toggleSidebar: () => void
  setCurrentChannel: (channel: string) => void
  setIsTyping: (typing: boolean) => void
  incrementUnread: () => void
  resetUnread: () => void
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  isSidebarOpen: false,
  currentChannel: 'general',
  isTyping: false,
  unreadCount: 0,
  
  // Actions
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setCurrentChannel: (channel) => set({ currentChannel: channel }),
  setIsTyping: (typing) => set({ isTyping: typing }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0 }),
})) 
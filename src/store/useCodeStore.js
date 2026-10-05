import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCodeStore = create(
  persist(
    (set, get) => ({
      // Code input state
      code: '',
      language: 'javascript',
      isLoading: false,
      error: null,

      // Review results
      reviewResult: null,

      // History
      history: [],

      // Actions
      setCode: (code) => set({ code }),
      setLanguage: (language) => set({ language }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setReviewResult: (reviewResult) => set({ reviewResult }),

      // Clear code
      clearCode: () => set({ code: '', reviewResult: null, error: null }),

      // Add to history
      addToHistory: (item) => {
        const { history } = get()
        const newHistory = [item, ...history].slice(0, 50)
        set({ history: newHistory })
      },

      // Clear history
      clearHistory: () => set({ history: [] }),

      // Remove from history
      removeFromHistory: (id) => {
        const { history } = get()
        set({ history: history.filter(item => item.id !== id) })
      },
    }),
    {
      name: 'code-review-storage',
      partialize: (state) => ({ history: state.history }),
    }
  )
)

export default useCodeStore

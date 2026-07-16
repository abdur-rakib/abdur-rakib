import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Setup localStorage
beforeEach(() => {
  // Ensure localStorage is available
  const store: Record<string, string> = {}
  const mockLocalStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach((key) => {
        delete store[key]
      })
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
    length: 0,
  }
  Object.defineProperty(mockLocalStorage, 'length', {
    get: () => Object.keys(store).length,
  })
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  })
})

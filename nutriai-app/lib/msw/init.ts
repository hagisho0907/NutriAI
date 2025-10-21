// MSW initialization utility
import { setupMSW } from './index'

let mswInitialized = false

export const initializeMSW = async () => {
  if (mswInitialized) {
    return
  }

  try {
    await setupMSW()
    mswInitialized = true
  } catch (error) {
    console.error('Failed to initialize MSW:', error)
  }
}

// Auto-initialize in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  initializeMSW()
}
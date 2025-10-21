// MSW browser setup for NutriAI app
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers)

// Start the mocking
export const startMocking = async () => {
  if (typeof window !== 'undefined') {
    return worker.start({
      onUnhandledRequest: 'warn',
    })
  }
}
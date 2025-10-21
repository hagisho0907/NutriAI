// MSW Node.js setup for NutriAI app
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// This configures a request interception library for Node.js
export const server = setupServer(...handlers)

// Start the mocking server
export const startMocking = () => {
  server.listen({
    onUnhandledRequest: 'warn',
  })
}

// Reset handlers after each test
export const resetMocking = () => {
  server.resetHandlers()
}

// Stop the mocking server
export const stopMocking = () => {
  server.close()
}
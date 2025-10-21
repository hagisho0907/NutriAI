// MSW main entry point
export { handlers } from './handlers'
export { worker, startMocking as startBrowserMocking } from './browser'
export { server, startMocking as startNodeMocking, resetMocking, stopMocking } from './node'

// Environment detection and automatic setup
export const setupMSW = async () => {
  // Only set up MSW in development and if mocking is enabled
  const isDevelopment = process.env.NODE_ENV === 'development'
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false'
  
  if (!isDevelopment || !useMock) {
    console.log('MSW: Skipping setup (not in development or mocking disabled)')
    return
  }

  if (typeof window !== 'undefined') {
    // Browser environment
    const { startBrowserMocking } = await import('./browser')
    await startBrowserMocking()
    console.log('MSW: Browser mocking enabled')
  } else {
    // Node.js environment (SSR, tests, etc.)
    const { startNodeMocking } = await import('./node')
    startNodeMocking()
    console.log('MSW: Node.js mocking enabled')
  }
}

// Re-export types for convenience
export type { RequestHandler } from 'msw'
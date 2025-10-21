/* eslint-disable */
/* tslint:disable */

/**
 * Mock Service Worker (2.11.5).
 * @see https://github.com/mswjs/msw
 * - Please do NOT modify this file.
 * - Please do NOT serve this file on production.
 */

const INTEGRITY_CHECKSUM = 'ae1c54f0d7f61beadc3bd8d72c9a6e8b'
const IS_MOCKED_RESPONSE = Symbol('isMockedResponse')

const activeClientIds = new Set()

self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', async function (event) {
  const clientId = event.source.id

  if (!clientId || !event.data) {
    return
  }

  const allClients = await self.clients.matchAll({
    type: 'window',
  })

  switch (event.data.type) {
    case 'MOCK_ACTIVATE': {
      activeClientIds.add(clientId)

      sendToClient(clientId, {
        type: 'MOCKING_ENABLED',
        payload: true,
      })
      break
    }

    case 'MOCK_DEACTIVATE': {
      activeClientIds.delete(clientId)
      break
    }

    case 'INTEGRITY_CHECK_REQUEST': {
      sendToClient(clientId, {
        type: 'INTEGRITY_CHECK_RESPONSE',
        payload: INTEGRITY_CHECKSUM,
      })
      break
    }

    case 'KEPT_ALIVE': {
      sendToClient(clientId, {
        type: 'KEPT_ALIVE',
        payload: {
          workerTimestamp: Date.now(),
        },
      })
      break
    }
  }
})

self.addEventListener('fetch', function (event) {
  const { clientId, request } = event

  if (request.mode === 'navigate') {
    return
  }

  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return
  }

  if (activeClientIds.size === 0) {
    return
  }

  // Generate unique request ID.
  const requestId = Math.random().toString(16).slice(2)

  event.respondWith(
    handleRequest(event, requestId).catch((error) => {
      if (error.name === 'NetworkError') {
        console.warn(
          '[MSW] Successfully emulated a network error for the "%s %s" request.',
          request.method,
          request.url,
        )
        return
      }

      // At this point, any exception indicates an issue with the original request/response.
      console.error(
        `\
[MSW] Caught an exception from the "%s %s" request (%s). This is probably not a problem with Mock Service Worker. There is likely an additional logging output above.`,
        request.method,
        request.url,
        `${error.name}: ${error.message}`,
      )
    }),
  )
})

async function handleRequest(event, requestId) {
  const client = await resolveMainClient(event)
  const response = await getResponse(event, client, requestId)

  // Send back the response clone for the "response:*" life-cycle events.
  // Ensure MSW is active and the client is present before sending the response.
  if (client && activeClientIds.has(client.id)) {
    ;(async function () {
      const responseClone = response.clone()
      sendToClient(client, {
        type: 'RESPONSE',
        payload: {
          requestId,
          type: responseClone.type,
          ok: responseClone.ok,
          status: responseClone.status,
          statusText: responseClone.statusText,
          body:
            responseClone.body === null ? null : await responseClone.text(),
          headers: Object.fromEntries(responseClone.headers.entries()),
          redirected: responseClone.redirected,
        },
      })
    })()
  }

  return response
}

// Resolve the main client for the given event.
// Client that issues a request doesn't necessarily equal the client
// that registered the worker. It's with the latter the worker should
// communicate with during the response resolving phase.
async function resolveMainClient(event) {
  const url = new URL(event.request.url)

  // If the request URL is same-origin, the client is definitely same-origin.
  if (self.location.origin === url.origin) {
    return self.clients.get(event.clientId)
  }

  // For cross-origin requests, look up the client ID that's
  // in the same origin as the worker.
  const allClients = await self.clients.matchAll({
    type: 'window',
  })

  return allClients.find((client) => {
    // It's not guaranteed that the URL of the redirected client is the same-origin.
    // The client may have been navigated to a completely different origin.
    // However, if the client is controlled by the worker, it's same-origin.
    return client.frameType !== 'auxiliary'
  })
}

async function getResponse(event, client, requestId) {
  const { request } = event
  const requestClone = request.clone()

  function passthrough() {
    // Clone the request because it might've been already used
    // (i.e. its body has been read and sent to the client).
    const headers = Object.fromEntries(requestClone.headers.entries())

    // Remove MSW-specific request headers so the bypassed requests
    // comply with the server's CORS preflight check.
    // Operate with the headers as an object because request "Headers"
    // are immutable.
    delete headers['x-msw-bypass']

    return fetch(requestClone, { headers })
  }

  // Bypass mocking when the request client is not active.
  if (!client) {
    return passthrough()
  }

  // Bypass initial page load requests (i.e. static assets).
  // The absence of the immediate/parent client in the map of the active clients
  // means that MSW hasn't dispatched the "MOCK_ACTIVATE" event yet
  // and is not ready to handle requests.
  if (!activeClientIds.has(client.id)) {
    return passthrough()
  }

  // Bypass requests with the explicit bypass header.
  // Such requests can be issued by "ctx.fetch()".
  if (requestClone.headers.get('x-msw-bypass') === 'true') {
    return passthrough()
  }

  // Notify the client that a request has been intercepted.
  sendToClient(client, {
    type: 'REQUEST',
    payload: {
      id: requestId,
      url: requestClone.url,
      method: requestClone.method,
      headers: Object.fromEntries(requestClone.headers.entries()),
      cache: requestClone.cache,
      mode: requestClone.mode,
      credentials: requestClone.credentials,
      destination: requestClone.destination,
      integrity: requestClone.integrity,
      redirect: requestClone.redirect,
      referrer: requestClone.referrer,
      referrerPolicy: requestClone.referrerPolicy,
      body: await requestClone.text(),
      bodyUsed: requestClone.bodyUsed,
      keepalive: requestClone.keepalive,
    },
  })

  return new Promise((resolve, reject) => {
    addEventListener('message', function handler(event) {
      if (event.source !== client) {
        return
      }

      if (!event.data || event.data.type !== 'MOCK_RESPONSE') {
        return
      }

      if (event.data.payload.requestId !== requestId) {
        return
      }

      removeEventListener('message', handler)

      if (event.data.payload.type === 'error') {
        reject(new Error(event.data.payload.message))
        return
      }

      if (event.data.payload.type === 'mocked') {
        const mockedResponse = createResponse(
          event.data.payload,
          Object.fromEntries(requestClone.headers.entries()),
        )

        resolve.call(this, mockedResponse)
        return
      }

      // Consider any other payload.type a request bypass.
      // Such cases may be a handler that explicitly called "ctx.passthrough()".
      resolve.call(this, passthrough())
    })
  })
}

function sendToClient(client, message) {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel()

    channel.port1.onmessage = (event) => {
      if (event.data && event.data.error) {
        return reject(event.data.error)
      }

      resolve(event.data)
    }

    client.postMessage(
      message,
      [channel.port2],
    )
  })
}

function createResponse(payload, requestHeaders) {
  const {
    status,
    statusText,
    headers,
    body,
  } = payload

  const response = new Response(body, {
    status,
    statusText,
    headers,
  })

  Object.defineProperty(response, IS_MOCKED_RESPONSE, {
    value: true,
    enumerable: true,
  })

  return response
}
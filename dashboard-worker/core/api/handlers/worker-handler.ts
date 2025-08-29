/**
 * Worker Handler
 * Cloudflare Worker entry point
 */

interface Env {
  DB?: any;
  CACHE?: any;
}

export default async function handleWorkerRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  try {
    // Basic worker request handling
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Worker is running', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.error('Worker error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

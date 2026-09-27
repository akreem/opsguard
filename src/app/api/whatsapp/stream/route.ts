import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

function getWhatsappUrl() {
  return process.env.WHATSAPP_STREAM_URL || (process.env.NODE_ENV === 'production' ? 'http://opsguard-whatsapp-stream:3002' : 'http://localhost:3002');
}

export async function GET(req: NextRequest) {
  const targetUrl = `${getWhatsappUrl()}/stream`;

  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        Accept: 'text/event-stream',
      },
      cache: 'no-store',
    });

    if (!upstreamRes.ok || !upstreamRes.body) {
      throw new Error(`Upstream returned ${upstreamRes.status}`);
    }

    return new Response(upstreamRes.body as any, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: any) {
    // Return friendly SSE error event if container is still launching
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: 'WhatsApp stream container warming up...', error: err.message })}\n\n`));
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

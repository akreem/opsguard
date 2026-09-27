import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getWhatsappUrl() {
  return process.env.WHATSAPP_STREAM_URL || (process.env.NODE_ENV === 'production' ? 'http://opsguard-whatsapp-stream:3002' : 'http://localhost:3002');
}

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${getWhatsappUrl()}/messages`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Upstream returned ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({
      messages: [],
      warning: 'WhatsApp microservice initializing',
    });
  }
}

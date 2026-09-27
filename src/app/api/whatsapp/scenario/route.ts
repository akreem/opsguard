import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getWhatsappUrl() {
  return process.env.WHATSAPP_STREAM_URL || (process.env.NODE_ENV === 'production' ? 'http://opsguard-whatsapp-stream:3002' : 'http://localhost:3002');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const scenario = body.scenario || 'normal';
    const res = await fetch(`${getWhatsappUrl()}/scenario/${scenario}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to trigger scenario' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

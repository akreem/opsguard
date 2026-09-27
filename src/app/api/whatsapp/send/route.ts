import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getWhatsappUrl() {
  return process.env.WHATSAPP_STREAM_URL || (process.env.NODE_ENV === 'production' ? 'http://opsguard-whatsapp-stream:3002' : 'http://localhost:3002');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const res = await fetch(`${getWhatsappUrl()}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed' }));
      return NextResponse.json(err, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

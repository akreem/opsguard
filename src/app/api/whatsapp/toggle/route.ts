import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getWhatsappUrl() {
  return process.env.WHATSAPP_STREAM_URL || (process.env.NODE_ENV === 'production' ? 'http://opsguard-whatsapp-stream:3002' : 'http://localhost:3002');
}

export async function POST() {
  try {
    const res = await fetch(`${getWhatsappUrl()}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

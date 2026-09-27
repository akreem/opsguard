import { NextRequest } from 'next/server';
import { runReplaySandbox } from '@/lib/replay/replayLab';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await runReplaySandbox({
      clusterId: params.id,
      patchType: body.patchType,
      actor: body.actor || 'hackathon_operator',
    });

    return jsonResponse(result);
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return POST(req, { params });
}

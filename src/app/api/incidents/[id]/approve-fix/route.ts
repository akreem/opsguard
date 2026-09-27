import { NextRequest } from 'next/server';
import { approveIncidentFix } from '@/lib/replay/replayLab';
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
    const operator = body.operator || 'hackathon_operator';
    const result = approveIncidentFix(params.id, operator);

    return jsonResponse(result);
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500);
  }
}

import { NextRequest } from 'next/server';
import { rejectIncidentFix } from '@/lib/replay/replayLab';
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
    const notes = body.notes;
    const result = rejectIncidentFix(params.id, operator, notes);

    return jsonResponse(result);
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500);
  }
}

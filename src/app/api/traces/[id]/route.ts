import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const trace = db.getTraceById(params.id);
  if (!trace) {
    return jsonResponse({ error: `Flight trace '${params.id}' not found.` }, 404);
  }
  return jsonResponse(trace);
}

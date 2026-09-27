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
  const incident = db.getIncidentById(params.id);
  if (!incident) {
    return jsonResponse({ error: `Incident failure cluster '${params.id}' not found.` }, 404);
  }
  return jsonResponse(incident);
}

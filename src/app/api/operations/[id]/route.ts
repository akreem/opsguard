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
  const op = db.getOperationById(params.id);
  if (!op) {
    return jsonResponse({ error: `Operation '${params.id}' not found.` }, 404);
  }

  const traces = db.getTraces({ requestId: params.id });

  return jsonResponse({
    operation: op,
    traces,
  });
}

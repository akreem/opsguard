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
  const traces = db.getTraces();
  const operations = db.getOperations();

  return jsonResponse({
    runId: params.id,
    timestamp: new Date().toISOString(),
    totalOperations: operations.length,
    tracesGenerated: traces.length,
    status: 'COMPLETED',
  });
}

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { runFullBatch, processOperation } from '@/lib/engine';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // If specific operationId is provided, run just that one
    if (body.operationId) {
      const op = db.getOperationById(body.operationId);
      if (!op) {
        return jsonResponse({ error: `Operation '${body.operationId}' not found.` }, 404);
      }
      const result = await processOperation(op);
      return jsonResponse(result);
    }

    // Otherwise execute the full batch
    const batchResult = await runFullBatch();
    return jsonResponse(batchResult);
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500);
  }
}

export async function GET(req: NextRequest) {
  const operations = db.getOperations();
  const traces = db.getTraces();
  return jsonResponse({
    totalOperations: operations.length,
    totalTraces: traces.length,
    operationsSummary: {
      completed: operations.filter(o => o.status === 'COMPLETED').length,
      blocked: operations.filter(o => o.status === 'BLOCKED').length,
      humanReview: operations.filter(o => o.status === 'HUMAN_REVIEW').length,
      failed: operations.filter(o => o.status === 'FAILED').length,
      pending: operations.filter(o => o.status === 'PENDING').length,
    },
  });
}

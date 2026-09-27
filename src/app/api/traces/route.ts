import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const requestId = searchParams.get('requestId') || undefined;
  const policyDecision = searchParams.get('policyDecision') || undefined;
  const failureFamily = searchParams.get('failureFamily') || undefined;

  const traces = db.getTraces({ requestId, policyDecision, failureFamily });
  return jsonResponse({
    count: traces.length,
    traces,
  });
}

import { NextRequest } from 'next/server';
import { calculateHealthMetrics } from '@/lib/health/metrics';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    const health = calculateHealthMetrics();
    return jsonResponse(health);
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500);
  }
}

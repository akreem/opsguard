import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  const status = db.getSystemStatus();
  return jsonResponse({
    jev: status.jev,
    rootCauseModel: status.rootCauseModel,
    policyEngine: 'ACTIVE',
    flightRecorder: 'ACTIVE',
    replaySandbox: 'READY',
    demoMode: true,
    version: status.version,
    activePatchesCount: status.activePatchesCount,
    timestamp: new Date().toISOString(),
  });
}

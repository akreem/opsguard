import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { jsonResponse, handleOptions } from '@/lib/cors';
import { syncFailureClusters } from '@/lib/memory/failureCluster';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(req: NextRequest) {
  try {
    const freshDb = db.reset();
    await syncFailureClusters();
    return jsonResponse({
      success: true,
      message: 'OpsGuard database reset to pristine hackathon demo state (~30 seeded procurement requests).',
      totalOperations: freshDb.operations.length,
      systemStatus: freshDb.systemStatus,
    });
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500);
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { syncFailureClusters } from '@/lib/memory/failureCluster';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    let incidents = db.getIncidents();
    if (incidents.length === 0) {
      incidents = await syncFailureClusters();
    }
    return jsonResponse({
      count: incidents.length,
      incidents,
    });
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500);
  }
}

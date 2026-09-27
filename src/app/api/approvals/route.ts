import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get('status') as 'PENDING' | 'APPROVED' | 'REJECTED' | null;

  const approvals = db.getApprovals(statusParam || undefined);
  return jsonResponse({
    count: approvals.length,
    pendingCount: approvals.filter(a => a.status === 'PENDING').length,
    approvals,
  });
}

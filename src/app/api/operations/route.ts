import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;
  const scenarioType = searchParams.get('scenarioType') || undefined;

  const operations = db.getOperations({ status, scenarioType });
  return jsonResponse({
    count: operations.length,
    operations,
  });
}

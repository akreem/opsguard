import { NextRequest } from 'next/server';
import { runScenario } from '@/lib/engine';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(
  req: NextRequest,
  { params }: { params: { scenario: string } }
) {
  try {
    const scenarioParam = params.scenario;
    const result = await runScenario(scenarioParam);
    return jsonResponse(result);
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 400);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { scenario: string } }
) {
  return POST(req, { params });
}

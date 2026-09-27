import { NextRequest } from 'next/server';
import { jsonResponse, handleOptions } from '@/lib/cors';
import { runAgentSimulationTest, getSimulatedDatabaseState } from '@/lib/simulator/agentDbSimulator';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  const state = getSimulatedDatabaseState();
  return jsonResponse({ state });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await runAgentSimulationTest({
      agentId: body.agentId || 'procurement-agent-01',
      agentName: body.agentName || 'Procurement-Agent-Alpha',
      scenarioType: body.scenarioType || 'supplier_alias_error',
      customPrompt: body.customPrompt,
    });
    return jsonResponse(result);
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500);
  }
}

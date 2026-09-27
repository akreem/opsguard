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
    agentRouter: {
      connected: true,
      activeModel: process.env.AGENTROUTER_MODEL || 'deepseek-v4-flash',
      availableModels: ['deepseek-v4-flash', 'claude-opus-4-8', 'gpt-6-astra', 'claude-opus-5'],
      baseUrl: 'https://agentrouter.org/v1',
    },
    policyEngine: 'ACTIVE',
    flightRecorder: 'ACTIVE',
    replaySandbox: 'READY',
    sandboxIsolation: process.env.SANDBOX_ISOLATION_MODE || 'DOCKER_CONTAINER_ISOLATED',
    demoMode: true,
    version: status.version,
    activePatchesCount: status.activePatchesCount,
    timestamp: new Date().toISOString(),
  });
}

import { db } from '../db';
import { ReplayResult } from '../types';
import { executeIsolatedSandboxReplay } from './sandboxRunner';

export interface RunReplayOptions {
  clusterId: string;
  patchType?: 'SUPPLIER_NORMALIZATION' | 'SKU_MAPPER' | 'GATEWAY_RETRY_FALLBACK';
  actor?: string;
  model?: string;
}

/**
 * Runs Isolated Replay Sandbox via the dedicated Sandbox Execution Engine
 */
export async function runReplaySandbox(options: RunReplayOptions): Promise<ReplayResult> {
  const cluster = db.getIncidentById(options.clusterId);
  const patchType = options.patchType || cluster?.proposedPatch?.patchCodeType || 'SUPPLIER_NORMALIZATION';
  return executeIsolatedSandboxReplay({
    clusterId: options.clusterId,
    patchType,
    actor: options.actor,
    model: options.model,
  });
}

/**
 * Approves and activates a verified patch in the active policy engine with operator audit trail
 */
export function approveIncidentFix(clusterId: string, operator = 'hackathon_operator') {
  const cluster = db.getIncidentById(clusterId);
  if (!cluster || !cluster.proposedPatch) {
    throw new Error(`Incident ${clusterId} or proposed patch not found.`);
  }

  // Apply patch to system DB
  db.applyPatch(cluster.proposedPatch.patchId, operator);

  // Update incident status to FIX_APPROVED
  const updatedCluster = db.updateIncident(clusterId, {
    status: 'FIX_APPROVED',
  });

  return {
    success: true,
    message: `Patch '${cluster.proposedPatch.name}' successfully approved and deployed by ${operator}.`,
    cluster: updatedCluster,
  };
}

/**
 * Rejects a proposed patch and logs the rejection
 */
export function rejectIncidentFix(clusterId: string, operator = 'hackathon_operator', notes?: string) {
  const cluster = db.getIncidentById(clusterId);
  if (!cluster || !cluster.proposedPatch) {
    throw new Error(`Incident ${clusterId} or proposed patch not found.`);
  }

  db.rejectPatch(cluster.proposedPatch.patchId);

  const updatedCluster = db.updateIncident(clusterId, {
    status: 'REJECTED',
  });

  return {
    success: true,
    message: `Patch rejected by ${operator}. Reason: ${notes || 'Operator decision.'}`,
    cluster: updatedCluster,
  };
}

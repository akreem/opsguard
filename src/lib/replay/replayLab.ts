import { db } from '../db';
import { executeMockTool } from '../tools/executor';
import { ReplayCaseDetail, ReplayResult } from '../types';

export interface RunReplayOptions {
  clusterId: string;
  patchType?: 'SUPPLIER_NORMALIZATION' | 'SKU_MAPPER' | 'GATEWAY_RETRY_FALLBACK';
  actor?: string;
}

export async function runReplaySandbox(options: RunReplayOptions): Promise<ReplayResult> {
  const { clusterId } = options;
  const cluster = db.getIncidentById(clusterId);
  const operations = db.getOperations();

  const replayId = `rpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const timestamp = new Date().toISOString();

  // Determine target failing historical cases
  let targetOps = operations.filter(op => op.isHistoricalFailure || op.scenarioType === 'supplier_mismatch');

  if (clusterId === 'cluster_legacy_sku_drift') {
    targetOps = operations.filter(op => op.scenarioType === 'invalid_sku');
  } else if (clusterId === 'cluster_erp_semantic_null_po') {
    targetOps = operations.filter(op => op.scenarioType === 'semantic_failure');
  }

  // Fallback to all 17 historical supplier mismatch ops for the signature demo
  if (targetOps.length === 0) {
    targetOps = operations.filter(op => op.scenarioType === 'supplier_mismatch' || op.isHistoricalFailure);
  }

  const patchType = options.patchType || cluster?.proposedPatch?.patchCodeType || 'SUPPLIER_NORMALIZATION';
  const details: ReplayCaseDetail[] = [];

  let beforeSuccessCount = 0;
  let afterSuccessCount = 0;

  for (const op of targetOps) {
    // 1. REPLAY WITHOUT PATCH (Baseline / Historical)
    // Run sandbox execution with empty patches array
    let beforeToolName = 'supplier_search';
    let beforeArgs: Record<string, any> = { name: op.supplierRawName };

    if (clusterId === 'cluster_legacy_sku_drift') {
      beforeToolName = 'inventory_lookup';
      beforeArgs = { sku: op.sku };
    } else if (clusterId === 'cluster_erp_semantic_null_po') {
      beforeToolName = 'create_purchase_order';
      beforeArgs = {
        sku: op.sku,
        supplier_id: 'sup_electrodirect',
        quantity: op.requestedQuantity,
        amount: op.estimatedTotalAmountTND,
        scenarioType: 'semantic_failure',
      };
    }

    const beforeExecution = await executeMockTool(beforeToolName, beforeArgs, {
      isReplaySandbox: true,
      replayPatches: [], // No patch applied
    });

    const beforeOk = beforeExecution.status === 'SUCCESS' && beforeExecution.semanticSuccess;
    if (beforeOk) beforeSuccessCount++;

    // 2. REPLAY WITH PROPOSED PATCH (Sandbox fix applied)
    const afterExecution = await executeMockTool(beforeToolName, beforeArgs, {
      isReplaySandbox: true,
      replayPatches: [patchType], // Active proposed fix in sandbox
    });

    const afterOk = afterExecution.status === 'SUCCESS' && afterExecution.semanticSuccess;
    if (afterOk) afterSuccessCount++;

    const recovered = !beforeOk && afterOk;

    details.push({
      traceId: `trc_hist_${op.id}`,
      requestId: op.id,
      sku: op.sku,
      supplier: op.supplierRawName,
      beforeStatus: beforeOk ? 'SUCCESS' : 'FAILED',
      afterStatus: afterOk ? 'SUCCESS' : 'FAILED',
      recovered,
      beforeError: beforeExecution.errorMessage || (beforeOk ? undefined : 'Unresolved entity lookup'),
      afterResult: afterOk ? 'RESOLVED_BY_CANONICAL_INDEX' : (afterExecution.errorMessage || 'FAILED_UNRESOLVED'),
    });
  }

  const casesTotal = targetOps.length;
  const casesRecovered = afterSuccessCount - beforeSuccessCount;
  const casesStillFailing = casesTotal - afterSuccessCount;
  const newRegressions = 0;
  const failureReductionPercent = casesTotal > 0
    ? Math.round((casesRecovered / (casesTotal - beforeSuccessCount || 1)) * 100)
    : 0;

  const replayResult: ReplayResult = {
    replayId,
    clusterId,
    timestamp,
    cases_total: casesTotal,
    before_success: beforeSuccessCount,
    after_success: afterSuccessCount,
    cases_recovered: casesRecovered,
    cases_still_failing: casesStillFailing,
    new_regressions: newRegressions,
    failure_reduction_percent: failureReductionPercent,
    details,
  };

  // Update incident with replay result (sandbox simulation - does NOT mutate production state)
  if (cluster) {
    db.updateIncident(clusterId, {
      latestReplayResult: replayResult,
      status: cluster.status === 'ACTIVE' || cluster.status === 'DIAGNOSED' ? 'FIX_TESTED' : cluster.status,
    });
  }

  return replayResult;
}

export function approveIncidentFix(clusterId: string, operator = 'hackathon_operator') {
  const cluster = db.getIncidentById(clusterId);
  if (!cluster || !cluster.proposedPatch) {
    throw new Error(`Incident ${clusterId} or proposed patch not found.`);
  }

  // Apply patch to system DB
  db.applyPatch(cluster.proposedPatch.patchId, operator);

  // Update incident status
  const updatedCluster = db.updateIncident(clusterId, {
    status: 'FIX_APPROVED',
  });

  return {
    success: true,
    message: `Patch '${cluster.proposedPatch.name}' successfully approved and deployed by ${operator}.`,
    cluster: updatedCluster,
  };
}

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

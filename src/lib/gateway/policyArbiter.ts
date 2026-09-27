import { GatewayResult, PolicyDecision, RiskLevel } from '../types';
import { checkAuthorization } from './authorization';
import { checkAnomaly } from './anomaly';
import { getDecisionProvider } from './jevProvider';

export interface EvaluateGatewayInput {
  role?: string;
  businessIntent: string;
  agentIntent: string;
  proposedTool: string;
  toolArguments: Record<string, any>;
  isNewSupplier?: boolean;
}

export async function evaluateGatewayPolicy(input: EvaluateGatewayInput): Promise<GatewayResult> {
  const role = input.role || 'inventory_agent';
  const provider = getDecisionProvider();

  // 1. CHECK A — Pure Deterministic Authorization (RBAC)
  const authResult = checkAuthorization(role, input.proposedTool);

  // 2. CHECK B — Deterministic Anomaly Check (Heuristic Score 0–1)
  const anomalyResult = checkAnomaly(input.proposedTool, {
    sku: input.toolArguments.sku,
    quantity: input.toolArguments.quantity,
    amount: input.toolArguments.amount,
    supplier_id: input.toolArguments.supplier_id,
    supplier_name: input.toolArguments.supplier_name,
    isNewSupplier: input.isNewSupplier,
  });

  // If Auth failed, we can short-circuit or fetch quick fixture to preserve complete check telemetry
  // 3. CHECK C — Intent Consistency
  const intentResult = await provider.evaluateIntent({
    businessIntent: input.businessIntent,
    agentIntent: input.agentIntent,
    proposedTool: input.proposedTool,
    toolArguments: input.toolArguments,
    anomalyScore: anomalyResult.score,
  });

  // 4. CHECK D — Jev Risk Judgment
  const jevResult = await provider.evaluateRisk({
    businessIntent: input.businessIntent,
    agentIntent: input.agentIntent,
    proposedTool: input.proposedTool,
    toolArguments: input.toolArguments,
    anomalyScore: anomalyResult.score,
  });

  // ----------------------------------------------------
  // POLICY ARBITER — Pure Deterministic Decision Tree
  // ----------------------------------------------------
  let decision: PolicyDecision = 'ALLOW';
  let reason = 'Action validated across all 4 gateway safety checks.';
  let overallRisk: RiskLevel = jevResult.riskLevel;
  let overallConfidence: number = jevResult.confidence;

  if (!authResult.passed) {
    decision = 'BLOCK';
    overallRisk = 'CRITICAL';
    overallConfidence = 1.0;
    reason = `GATEWAY BLOCKED: ${authResult.reason}`;
  } else if (intentResult.intentConsistent === 'NO') {
    decision = 'BLOCK';
    overallRisk = 'CRITICAL';
    overallConfidence = 0.98;
    reason = `GATEWAY BLOCKED: Business intent mismatch detected. ${intentResult.reasoning}`;
  } else if (intentResult.suspiciousActionProb >= 0.85 || jevResult.suspiciousActionProb >= 0.85) {
    decision = 'BLOCK';
    overallRisk = 'CRITICAL';
    overallConfidence = Math.max(intentResult.suspiciousActionProb, jevResult.suspiciousActionProb);
    reason = `GATEWAY BLOCKED: High probability of prompt injection or malicious parameter tampering.`;
  } else if (anomalyResult.score >= 0.80) {
    decision = 'HUMAN_REVIEW';
    overallRisk = 'HIGH';
    overallConfidence = 0.95;
    const topHeuristic = anomalyResult.heuristics[0]?.detail || 'Abnormal parameter volume.';
    reason = `ESCALATED TO HUMAN REVIEW: Anomaly score (${anomalyResult.score.toFixed(2)}) exceeds safety threshold. ${topHeuristic}`;
  } else if (intentResult.requiresHumanReviewProb >= 0.70 || jevResult.requiresHumanReviewProb >= 0.70) {
    decision = 'HUMAN_REVIEW';
    overallRisk = 'HIGH';
    overallConfidence = 0.90;
    reason = `ESCALATED TO HUMAN REVIEW: Safety policy flags irreversible impact or unusual parameters requiring manual sign-off.`;
  } else if (jevResult.riskLevel === 'HIGH' || jevResult.riskLevel === 'CRITICAL') {
    decision = 'HUMAN_REVIEW';
    overallRisk = jevResult.riskLevel;
    overallConfidence = jevResult.confidence;
    reason = `ESCALATED TO HUMAN REVIEW: Risk level assessed as ${jevResult.riskLevel}. Manual operator verification required.`;
  } else {
    decision = 'ALLOW';
    overallRisk = 'LOW';
    overallConfidence = 0.98;
    reason = `PASSED: Role authorized, normal order parameters, consistent intent, low risk profile.`;
  }

  return {
    decision,
    reason,
    risk: overallRisk,
    confidence: overallConfidence,
    checks: {
      auth: authResult,
      anomaly: anomalyResult,
      intent: intentResult,
      jev: jevResult,
    },
  };
}

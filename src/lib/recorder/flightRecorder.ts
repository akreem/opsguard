import { db } from '../db';
import { DecisionSource, FailureFamily, FlightTrace, GatewayResult, HumanReviewStatus, SeverityLevel, ToolCallExecution } from '../types';
import { PostflightVerificationResult } from '../postflight/verifier';

export interface CreateTraceParams {
  requestId: string;
  businessIntent: string;
  agentIntent: string;
  proposedTool: string;
  toolArguments: Record<string, any>;
  gatewayResult: GatewayResult;
  toolExecution?: ToolCallExecution | null;
  postflight?: PostflightVerificationResult | null;
  humanReviewStatus?: HumanReviewStatus;
  decisionSource?: DecisionSource;
}

export function recordFlightTrace(params: CreateTraceParams): FlightTrace {
  const traceId = `trc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();

  const isExecuted = !!params.toolExecution;
  const transportSuccess = params.postflight?.transportSuccess ?? (isExecuted ? params.toolExecution?.transportSuccess ?? false : false);
  const semanticSuccess = params.postflight?.semanticSuccess ?? (isExecuted ? params.toolExecution?.semanticSuccess ?? false : false);
  const failureFamily: FailureFamily | null = params.postflight?.failureFamily ?? (params.gatewayResult.decision === 'BLOCK' ? 'POLICY_VIOLATION' : (params.toolExecution?.failureFamily ?? null));
  const severity: SeverityLevel = params.postflight?.severity ?? (params.gatewayResult.decision === 'BLOCK' ? 'CRITICAL' : 'LOW');
  const retryable = params.postflight?.retryable ?? false;

  const trace: FlightTrace = {
    traceId,
    requestId: params.requestId,
    timestamp,
    businessIntent: params.businessIntent,
    agentIntent: params.agentIntent,
    proposedTool: params.proposedTool,
    toolArguments: params.toolArguments,
    authorizationResult: params.gatewayResult.checks.auth.passed,
    anomalyScore: params.gatewayResult.checks.anomaly.score,
    jevDecision: params.gatewayResult.decision,
    jevConfidence: params.gatewayResult.confidence,
    policyDecision: params.gatewayResult.decision,
    policyReason: params.gatewayResult.reason,
    checks: params.gatewayResult.checks,
    toolResult: params.toolExecution?.rawOutput ?? null,
    latencyMs: params.toolExecution?.latencyMs ?? 8,
    transportSuccess,
    semanticSuccess,
    failureFamily,
    severity,
    retryable,
    humanReviewStatus: params.humanReviewStatus || (params.gatewayResult.decision === 'HUMAN_REVIEW' ? 'PENDING' : 'NONE'),
    decisionSource: params.decisionSource || params.gatewayResult.checks.jev.decisionSource || 'DEMO_FIXTURE',
  };

  db.saveTrace(trace);
  return trace;
}

export function getFlightTraces(filter?: { requestId?: string; policyDecision?: string; failureFamily?: string }): FlightTrace[] {
  return db.getTraces(filter);
}

export function getFlightTraceById(traceId: string): FlightTrace | undefined {
  return db.getTraceById(traceId);
}

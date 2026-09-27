export type PolicyDecision = 'ALLOW' | 'HUMAN_REVIEW' | 'BLOCK';
export type DecisionSource = 'AGENT_ROUTER' | 'LIVE_JEV' | 'CACHED_JEV' | 'DEMO_FIXTURE' | 'LOCAL_POLICY';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FailureFamily = 'ENTITY_RESOLUTION' | 'BAD_ARGUMENT' | 'TIMEOUT' | 'SEMANTIC_FAILURE' | 'POLICY_VIOLATION' | 'UNKNOWN';
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type OperationStatus = 'PENDING' | 'ALLOWED' | 'BLOCKED' | 'HUMAN_REVIEW' | 'EXECUTED' | 'FAILED' | 'COMPLETED';
export type HumanReviewStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type ClusterStatus = 'ACTIVE' | 'DIAGNOSED' | 'PATCH_PROPOSED' | 'FIX_TESTED' | 'FIX_APPROVED' | 'REJECTED' | 'RESOLVED';

export interface RolePermissions {
  role: string;
  allowedTools: string[];
  forbiddenTools: string[];
}

export interface PurchaseRequest {
  id: string;
  sku: string;
  productName: string;
  currentStock: number;
  minStock: number;
  requestedQuantity: number;
  estimatedUnitPriceTND: number;
  estimatedTotalAmountTND: number;
  supplierRawName: string;
  isNewSupplier?: boolean;
  userInstruction: string;
  category: string;
  // Injected / scenario flags
  scenarioType?: 'normal' | 'anomalous' | 'unauthorized' | 'supplier_mismatch' | 'invalid_sku' | 'timeout' | 'semantic_failure' | 'injection';
  injectedPrompt?: string;
  isHistoricalFailure?: boolean;
  status: OperationStatus;
  createdAt: string;
}

export interface AuthorizationCheck {
  passed: boolean;
  role: string;
  tool: string;
  reason: string;
}

export interface AnomalyHeuristic {
  name: string;
  score: number;
  detail: string;
}

export interface AnomalyCheck {
  score: number;
  heuristics: AnomalyHeuristic[];
  triggered: boolean;
}

export interface IntentConsistencyCheck {
  intentConsistent: 'YES' | 'NO';
  requiresHumanReviewProb: number;
  irreversibleImpactScore: number;
  suspiciousActionProb: number;
  reasoning: string;
}

export interface JevRiskJudgment {
  riskLevel: RiskLevel;
  requiresHumanReviewProb: number;
  argumentsSemanticallyConsistentProb: number;
  suspiciousActionProb: number;
  decisionSource: DecisionSource;
  confidence: number;
  notes?: string;
}

export interface GatewayChecks {
  auth: AuthorizationCheck;
  anomaly: AnomalyCheck;
  intent: IntentConsistencyCheck;
  jev: JevRiskJudgment;
}

export interface GatewayResult {
  decision: PolicyDecision;
  reason: string;
  risk: RiskLevel;
  confidence: number;
  checks: GatewayChecks;
}

export interface ToolCallExecution {
  toolName: string;
  args: Record<string, any>;
  rawOutput: any;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT';
  latencyMs: number;
  transportSuccess: boolean;
  semanticSuccess: boolean;
  failureFamily: FailureFamily | null;
  errorMessage?: string;
}

export interface FlightTrace {
  traceId: string;
  requestId: string;
  timestamp: string;
  businessIntent: string;
  agentIntent: string;
  proposedTool: string;
  toolArguments: Record<string, any>;
  authorizationResult: boolean;
  anomalyScore: number;
  jevDecision: PolicyDecision;
  jevConfidence: number;
  policyDecision: PolicyDecision;
  policyReason: string;
  checks: GatewayChecks;
  toolResult: any | null;
  latencyMs: number;
  transportSuccess: boolean;
  semanticSuccess: boolean;
  failureFamily: FailureFamily | null;
  severity: SeverityLevel;
  retryable: boolean;
  humanReviewStatus: HumanReviewStatus;
  decisionSource: DecisionSource;
  recoveredByPatch?: boolean;
}

export interface AiSandboxAudit {
  model: string;
  provider: 'AGENT_ROUTER' | 'NVIDIA' | 'FIXTURE';
  verdict: 'APPROVED_SAFE_FOR_PRODUCTION' | 'HUMAN_REVIEW_RECOMMENDED';
  safetyScore: number;
  mathematicalNonMutationVerified: boolean;
  executiveSummary: string;
  regressionRisk: string;
  latencyMs: number;
}

export interface RootCauseDiagnosis {
  root_cause: string;
  why_it_happened: string;
  recommended_patch: string;
  expected_effect: string;
  limitations: string;
  diagnosedAt: string;
  provider: 'AGENT_ROUTER' | 'NVIDIA' | 'OPENROUTER' | 'FIXTURE';
}

export interface ProposedPatch {
  patchId: string;
  clusterId: string;
  name: string;
  description: string;
  patchCodeType: 'SUPPLIER_NORMALIZATION' | 'SKU_MAPPER' | 'GATEWAY_RETRY_FALLBACK';
  config: Record<string, any>;
  createdAt: string;
  applied: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export interface ReplayCaseDetail {
  traceId: string;
  requestId: string;
  sku: string;
  supplier: string;
  beforeStatus: string;
  afterStatus: string;
  recovered: boolean;
  beforeError?: string;
  afterResult?: string;
}

export interface ReplayResult {
  replayId: string;
  clusterId: string;
  timestamp: string;
  cases_total: number;
  before_success: number;
  after_success: number;
  cases_recovered: number;
  cases_still_failing: number;
  new_regressions: number;
  failure_reduction_percent: number;
  details: ReplayCaseDetail[];
  aiAudit?: AiSandboxAudit;
}

export interface FailureCluster {
  clusterId: string;
  title: string;
  failureFamily: FailureFamily;
  fingerprint: string;
  incidentCount: number;
  severity: SeverityLevel;
  confidence: number;
  affectedOrders: number;
  affectedSuppliers: string[];
  businessValueAffected: number; // TND
  unitsExposedToStockOut: number;
  representativeTraceIds: string[];
  firstSeen: string;
  lastSeen: string;
  status: ClusterStatus;
  rootCauseDiagnosis?: RootCauseDiagnosis;
  proposedPatch?: ProposedPatch;
  latestReplayResult?: ReplayResult;
}

export interface HumanApprovalItem {
  id: string;
  requestId: string;
  traceId: string;
  product: string;
  sku: string;
  supplier: string;
  quantity: number;
  amountTND: number;
  risk: RiskLevel;
  anomalyScore: number;
  jevConfidence: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
  notes?: string;
}

export interface HealthMetrics {
  agentHealthScore: number; // 0 - 100
  autonomousCompletionPercent: number;
  guardInterventions: number;
  blockedActions: number;
  semanticSuccessRate: number;
  recoveryRate: number;
  openIncidents: number;
  totalRequests: number;
  completedOrders: number;
  totalTNDProtected: number;
}

export interface SystemStatus {
  jev: 'LIVE' | 'FIXTURE';
  rootCauseModel: 'AGENT_ROUTER' | 'NVIDIA' | 'OPENROUTER' | 'FIXTURE';
  agentRouterModel?: string;
  availableModels?: string[];
  policyEngine: 'ACTIVE';
  flightRecorder: 'ACTIVE';
  replaySandbox: 'READY';
  demoMode: boolean;
  version: string;
  activePatchesCount: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'developer' | 'security';
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserSession {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  expiresAt: number;
}


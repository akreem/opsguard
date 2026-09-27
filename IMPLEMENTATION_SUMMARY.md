# OpsGuard — Implementation Summary & Architecture Dossier

**Product Name**: OpsGuard  
**Tagline**: Real-time Control and Reliability Layer for Agentic AI  
**Motto**: *"The LLM proposes. Jev judges. Policy decides. Code executes. OpsGuard remembers."*  
**Core Thesis**: *"AI agents shouldn't fail silently."*  
**Repository**: [https://github.com/akreem/opsguard](https://github.com/akreem/opsguard)

---

## 1. System Overview & The ReflexLoop™

OpsGuard sits directly between autonomous AI agents and operational business tools (procurement, ERP, inventory systems, supplier records). It ensures no unauthorized, anomalous, or destructive actions execute without verification, while learning from failures and proving fixes in an isolated sandbox before human operator sign-off.

```
PROPOSE ➔ GUARD ➔ EXECUTE ➔ VERIFY ➔ RECORD ➔ LEARN ➔ REPLAY ➔ APPROVE
```

| Step | Component | Description |
| :--- | :--- | :--- |
| **1. PROPOSE** | AI Agent | Agent determines replenishment need and proposes tool action & parameters. |
| **2. GUARD** | Gateway (4 Checks) | Evaluates Authorization, Anomaly Heuristics, Intent Consistency, and Jev Risk. |
| **3. ARBITER** | Policy Engine | Pure deterministic code decides: `ALLOW`, `HUMAN_REVIEW`, or `BLOCK`. |
| **4. EXECUTE** | Tool Execution | Deterministic execution of mocked operational tools. |
| **5. VERIFY** | Postflight Verifier | Evaluates transport success vs deep semantic outcome (e.g. detecting null order IDs). |
| **6. RECORD** | Flight Recorder | Generates structured, immutable trace capturing full telemetry and latencies. |
| **7. LEARN** | Failure Memory | Groups failures by fingerprint into recurring clusters with Business Blast Radius. |
| **8. REPLAY** | Replay Lab Sandbox | Replays historical failure traces against proposed patches (0/17 $\rightarrow$ 15/17 = 88%). |
| **9. APPROVE** | Human Sign-off | Operator approves patch (`hackathon_operator`), updating active policy version. |

---

## 2. Gateway Preflight Checks & Policy Arbiter

Every agent proposal passes through 4 deterministic and AI-assisted safety checks:

### Check A — RBAC Authorization (Pure Deterministic)
- Enforces role-based permissions for `inventory_agent`:
  - `inventory_lookup`: Allowed
  - `supplier_search`: Allowed
  - `create_purchase_order`: Allowed
  - `change_supplier_payment_details`: **Forbidden** $\rightarrow$ Blocks immediately with zero LLM overhead.

### Check B — Deterministic Anomaly Heuristics (Score 0.0 – 1.0)
- `+0.35` for new or unverified suppliers (`Apex Global Trading LLC`).
- `+0.35` for order amount exceeding 3x normal average or $\ge 50,000$ TND.
- `+0.20` for requested quantity exceeding 3x normal batch (e.g., 500 units vs 20 units).
- `+0.10` for sensitive tool invocation.
- Clamped between 0.0 and 1.0. Anomaly score $\ge 0.80$ triggers `HUMAN_REVIEW`.

### Check C — Intent Consistency Check
- Evaluates semantic divergence between original user business intent and proposed agent action.
- Detects prompt injections, instruction hijacks, or subtle credential alterations.

### Check D — Jev Risk Judgment (DecisionProvider)
- Implemented behind `DecisionProvider` interface:
  - `JevDecisionProvider`: Live TypeSafe Jev API integration.
  - `FixtureDecisionProvider`: 100% deterministic offline fallback.
- Returns risk level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), human review probability, and confidence score.

### Policy Arbiter Logic
```typescript
if (!authResult.passed) {
  decision = 'BLOCK';
} else if (intentResult.intentConsistent === 'NO') {
  decision = 'BLOCK';
} else if (intentResult.suspiciousActionProb >= 0.85 || jevResult.suspiciousActionProb >= 0.85) {
  decision = 'BLOCK';
} else if (anomalyResult.score >= 0.80) {
  decision = 'HUMAN_REVIEW';
} else if (intentResult.requiresHumanReviewProb >= 0.70 || jevResult.requiresHumanReviewProb >= 0.70) {
  decision = 'HUMAN_REVIEW';
} else if (jevResult.riskLevel === 'HIGH' || jevResult.riskLevel === 'CRITICAL') {
  decision = 'HUMAN_REVIEW';
} else {
  decision = 'ALLOW';
}
```

---

## 3. Tool Execution & Controlled Failure Scenarios

Built deterministic mocked tools with fixed seed datasets:
1. **`inventory_lookup(sku)`**: Resolves master catalog specifications, stock buffers, and unit costs.
2. **`supplier_search(name)`**: Resolves raw alias strings against canonical approved suppliers.
3. **`create_purchase_order(supplier_id, sku, quantity, amount)`**: Generates ERP purchase orders and simulated transaction acknowledgments.
4. **`change_supplier_payment_details(...)`**: Protected banking wire modification tool used exclusively for injection/security demos.

### Controlled Demo Failure Scenarios:
- **Supplier Identity Mismatch**: 17 requests with variations (`Tech Supply`, `TECH-SUPPLY`, `TechSupply Ltd`, `Electro Direct`) that fail un-normalized lookups.
- **Legacy SKU Format Drift**: Requests with deprecated SKUs (`DL-MON-24` instead of `DELL-MONITOR-24`).
- **ERP Transport Timeout**: Network socket timeout simulation.
- **Silent Semantic Failure**: Tool returns HTTP 200 / success payload, but `order_id = null`. OpsGuard Postflight catches this as `SEMANTIC_FAILURE`.
- **Prompt Injection**: Injected prompt attempting wire redirection $\rightarrow$ Gateway blocks before execution.

---

## 4. Postflight Verification & Flight Recorder

### Postflight Verifier
Distinguishes **Transport Success** from **Semantic Success**:
- `transportSuccess = true` & `semanticSuccess = false` $\rightarrow$ flags `SEMANTIC_FAILURE`, severity `CRITICAL`, and generates escalation.
- Categories: `ENTITY_RESOLUTION`, `BAD_ARGUMENT`, `TIMEOUT`, `SEMANTIC_FAILURE`, `POLICY_VIOLATION`, `UNKNOWN`.

### Flight Recorder Trace Schema
Every execution generates an immutable trace:
```typescript
interface FlightTrace {
  traceId: string;
  requestId: string;
  timestamp: string;
  businessIntent: string;
  agentIntent: string;
  proposedTool: string;
  toolArguments: Record<string, any>;
  authorizationResult: boolean;
  anomalyScore: number;
  jevDecision: 'ALLOW' | 'HUMAN_REVIEW' | 'BLOCK';
  jevConfidence: number;
  policyDecision: 'ALLOW' | 'HUMAN_REVIEW' | 'BLOCK';
  policyReason: string;
  checks: GatewayChecks;
  toolResult: any | null;
  latencyMs: number;
  transportSuccess: boolean;
  semanticSuccess: boolean;
  failureFamily: FailureFamily | null;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  retryable: boolean;
  humanReviewStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  decisionSource: 'LIVE_JEV' | 'CACHED_JEV' | 'DEMO_FIXTURE' | 'LOCAL_POLICY';
}
```

---

## 5. Failure Memory & Business Blast Radius

Traces are fingerprinted and clustered into 3 recurring operational incidents:

1. **`cluster_supplier_alias_mismatch` (Supplier Identity Resolution / Alias Drift)**:
   - **Affected Orders**: 17 orders
   - **Affected Suppliers**: 4 suppliers (`TechSupply Corp`, `ElectroDirect Ltd`, `Maghreb IT`, `Tunisia Office`)
   - **Business Capital Exposed**: **47,830 TND**
   - **Stock-out Exposure**: **132 units**
2. **`cluster_legacy_sku_drift` (Legacy SKU Catalog Drift)**:
   - **Affected Orders**: 3 orders
   - **Business Capital Exposed**: **5,750 TND**
   - **Stock-out Exposure**: **20 units**
3. **`cluster_erp_semantic_null_po` (ERP Silent Null-Payload Order Failure)**:
   - **Affected Orders**: 2 orders
   - **Business Capital Exposed**: **5,850 TND**
   - **Stock-out Exposure**: **25 units**

---

## 6. Root Cause Engine & Signature Replay Lab

### Root Cause Engine
`RootCauseProvider` (`NvidiaRootCauseProvider` / `FixtureRootCauseProvider`) analyzes trace evidence and outputs structured JSON:
- `root_cause`: Core technical reason.
- `why_it_happened`: Deep explanation based on stored trace evidence.
- `recommended_patch`: Algorithmic fix.
- `expected_effect`: Measurable business outcome.
- `limitations`: Edge cases not covered.

### Signature Replay Lab Sandbox
Tests the proposed patch against historical failing traces in an isolated sandbox (zero live mutations):
- **Historical Cases Replayed**: 17 traces
- **Before Patch**: `0 / 17 (0%)`
- **After Patch**: `15 / 17 (88%)`
- **Cases Recovered**: `15`
- **Failure Reduction**: **88%**
- **New Regressions**: `0`

Clicking **"Approve & Deploy Fix"** applies the patch to the active policy version and logs the approval with actor attribution (`hackathon_operator`).

---

## 7. Human Approval Queue & Health Metrics

### Human Approval Queue
- Any order flagged as `HUMAN_REVIEW` (e.g. 500 monitors / 70k TND with new distributor) is queued.
- Actions: **APPROVE** (triggers tool execution, postflight check, and trace recording) or **REJECT**.
- Records timestamp and actor (`hackathon_operator`).

### Deterministic Health Metrics Formula
- **Agent Health Score (0–100)**: `(SemanticSuccess * 0.40) + (AutonomousCompletion * 0.30) + (RecoveryRate * 0.20) + (PolicyCompliance * 0.10)`
- **Autonomous Completion %**
- **Guard Interventions** (Blocked Actions + Human Reviews)
- **Semantic Success Rate**
- **Patch Recovery Rate**
- **Capital Protected (TND)**

---

## 8. Verified Live Demo Scenarios

| Scenario | Title | Action | Expected Output |
| :--- | :--- | :--- | :--- |
| **Scenario 1** | Normal Flow | Legitimate 20x Dell Monitor order | `ALLOW` $\rightarrow$ Tool Executes $\rightarrow$ Semantic Success |
| **Scenario 2** | Anomalous Order | 500 units / 70,000 TND / New Vendor | Anomaly 0.90 $\rightarrow$ Escalated to Human Review Queue |
| **Scenario 3** | Prompt Injection | Injected IBAN alteration instruction | `BLOCK` immediately (Auth Fail & Intent Mismatch) |
| **Scenario 4** | Recurring Failure | 17 un-normalized supplier queries | Clustered incident with 47,830 TND blast radius |
| **Scenario 5** | Replay Lab Proof | Test Canonical Alias Normalizer in Sandbox | **0/17 $\rightarrow$ 15/17 (88% Failure Reduction)** |

---

## 9. Complete API Contract

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/demo/reset` | Resets DB to 30 seeded operations |
| `POST` | `/api/run` | Runs full batch or single operation through ReflexLoop |
| `GET` | `/api/run/:id` | Returns batch run status |
| `GET` | `/api/operations` | Lists purchase requests with filters |
| `GET` | `/api/operations/:id` | Returns operation details and its flight traces |
| `GET` | `/api/traces` | Lists all immutable flight recorder traces |
| `GET` | `/api/traces/:id` | Fetches trace telemetry with 4-check breakdown |
| `GET` | `/api/health` | Returns calculated health metrics |
| `GET` | `/api/incidents` | Returns failure clusters, blast radius, and root cause |
| `GET` | `/api/incidents/:id` | Returns single failure cluster details |
| `POST` | `/api/incidents/:id/replay` | Runs isolated sandbox replay simulation |
| `POST` | `/api/incidents/:id/approve-fix` | Deploys patch to active policy engine |
| `POST` | `/api/incidents/:id/reject-fix` | Rejects proposed patch |
| `GET` | `/api/approvals` | Returns pending human review items |
| `POST` | `/api/approvals/:id/decision` | Body `{ decision: 'APPROVE' \| 'REJECT' }` |
| `POST` | `/api/demo/scenario/:scenario` | Triggers scenario `1`, `2`, `3`, `4`, `5` |
| `GET` | `/api/system/status` | Returns Jev, NVIDIA, and Sandbox status |

---

## 10. Automated Test Verification

All 16 critical tests pass cleanly:
```
🧪 Starting OpsGuard Test Suite...

  ✅ [PASS] Database resets cleanly with seeded dataset
  ✅ [PASS] Check A: Normal tool is authorized, restricted tool is blocked
  ✅ [PASS] Check B: Large anomalous order triggers high score
  ✅ [PASS] Policy Arbiter: Normal legitimate replenishment is ALLOWED
  ✅ [PASS] Policy Arbiter: Unauthorized action is BLOCKED immediately
  ✅ [PASS] Policy Arbiter: Large anomalous order escalated to HUMAN_REVIEW
  ✅ [PASS] Policy Arbiter: Injected prompt / intent mismatch is BLOCKED
  ✅ [PASS] Postflight: Detects silent semantic failure (HTTP 200, order_id: null)
  ✅ [PASS] Flight Recorder: Generates structured immutable trace
  ✅ [PASS] Failure Memory: Clusters 17 historical supplier alias failures with 47,830 TND blast radius
  ✅ [PASS] Replay Lab: Proves patch improves historical failures from 0/17 to 15/17 (88% reduction)
  ✅ [PASS] Replay Sandbox: Does NOT mutate live production patch status during test
  ✅ [PASS] Human Approval: Operator approval activates patch and records human actor
  ✅ [PASS] Approval Queue: Approving pending item executes tool and updates status
  ✅ [PASS] Health Metrics: Deterministic calculation returns 0-100 score
  ✅ [PASS] DecisionProvider: JevDecisionProvider falls back cleanly to fixture when key absent

🎉 Results: 16/16 tests passed.
```

import { db } from '../db';
import { HumanApprovalItem, PurchaseRequest } from '../types';
import { executeMockTool } from '../tools/executor';
import { verifyPostflight } from '../postflight/verifier';
import { recordFlightTrace } from '../recorder/flightRecorder';

export function createPendingApproval(
  operation: PurchaseRequest,
  traceId: string,
  reason: string,
  anomalyScore: number,
  risk: any,
  confidence: number
): HumanApprovalItem {
  const approvalItem: HumanApprovalItem = {
    id: `appr_${operation.id}`,
    requestId: operation.id,
    traceId,
    product: operation.productName,
    sku: operation.sku,
    supplier: operation.supplierRawName,
    quantity: operation.requestedQuantity,
    amountTND: operation.estimatedTotalAmountTND,
    risk,
    anomalyScore,
    jevConfidence: confidence,
    reason,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  db.saveApproval(approvalItem);
  return approvalItem;
}

export async function processApprovalDecision(
  approvalId: string,
  decision: 'APPROVE' | 'REJECT',
  operator = 'hackathon_operator',
  notes?: string
) {
  const approval = db.getApprovalById(approvalId);
  if (!approval) {
    throw new Error(`Approval item '${approvalId}' not found.`);
  }

  const now = new Date().toISOString();
  approval.status = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  approval.decidedAt = now;
  approval.decidedBy = operator;
  approval.notes = notes;
  db.saveApproval(approval);

  const operation = db.getOperationById(approval.requestId);

  if (decision === 'APPROVE' && operation) {
    // Execute approved tool
    const toolExec = await executeMockTool('create_purchase_order', {
      sku: operation.sku,
      quantity: operation.requestedQuantity,
      amount: operation.estimatedTotalAmountTND,
      supplier_name: operation.supplierRawName,
      humanApproved: true,
    });

    const postflight = verifyPostflight('create_purchase_order', toolExec);

    // Record new execution trace
    recordFlightTrace({
      requestId: operation.id,
      businessIntent: operation.userInstruction,
      agentIntent: `Execute human-approved PO for ${operation.requestedQuantity}x ${operation.productName}`,
      proposedTool: 'create_purchase_order',
      toolArguments: {
        sku: operation.sku,
        quantity: operation.requestedQuantity,
        amount: operation.estimatedTotalAmountTND,
        supplier: operation.supplierRawName,
        approvedBy: operator,
      },
      gatewayResult: {
        decision: 'ALLOW',
        reason: `Human operator '${operator}' manually approved exception.`,
        risk: approval.risk,
        confidence: 1.0,
        checks: {
          auth: { passed: true, role: 'human_operator', tool: 'create_purchase_order', reason: 'Manual override' },
          anomaly: { score: approval.anomalyScore, heuristics: [], triggered: false },
          intent: { intentConsistent: 'YES', requiresHumanReviewProb: 0, irreversibleImpactScore: 0.5, suspiciousActionProb: 0, reasoning: 'Authorized by human' },
          jev: { riskLevel: approval.risk, requiresHumanReviewProb: 0, argumentsSemanticallyConsistentProb: 1, suspiciousActionProb: 0, decisionSource: 'LOCAL_POLICY', confidence: 1 },
        },
      },
      toolExecution: toolExec,
      postflight,
      humanReviewStatus: 'APPROVED',
      decisionSource: 'LOCAL_POLICY',
    });

    db.updateOperation(operation.id, {
      status: postflight.semanticSuccess ? 'COMPLETED' : 'FAILED',
    });
  } else if (operation) {
    db.updateOperation(operation.id, {
      status: 'BLOCKED',
    });
  }

  return approval;
}

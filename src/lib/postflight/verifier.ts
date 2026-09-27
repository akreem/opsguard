import { FailureFamily, SeverityLevel, ToolCallExecution } from '../types';

export interface PostflightVerificationResult {
  transportSuccess: boolean;
  semanticSuccess: boolean;
  failureFamily: FailureFamily | null;
  severity: SeverityLevel;
  retryable: boolean;
  needsEscalation: boolean;
  verificationNotes: string;
}

export function verifyPostflight(
  toolName: string,
  execution: ToolCallExecution,
  expectedOutcome?: string
): PostflightVerificationResult {
  // 1. Check Transport Success
  const transportOk = execution.status === 'SUCCESS' || execution.transportSuccess;

  // 2. Deep Semantic Outcome Verification
  let semanticOk = false;
  let failureFamily: FailureFamily | null = null;
  let severity: SeverityLevel = 'LOW';
  let retryable = false;
  let needsEscalation = false;
  let verificationNotes = '';

  if (execution.failureFamily) {
    failureFamily = execution.failureFamily;
  }

  if (toolName === 'inventory_lookup') {
    if (execution.status === 'SUCCESS' && execution.rawOutput && execution.rawOutput.sku) {
      semanticOk = true;
      verificationNotes = `Inventory verified for SKU '${execution.rawOutput.sku}'. Stock status: ${execution.rawOutput.status}.`;
    } else {
      semanticOk = false;
      failureFamily = 'BAD_ARGUMENT';
      severity = 'MEDIUM';
      retryable = false;
      needsEscalation = false;
      verificationNotes = `Semantic check failed: Master inventory record missing or unrecognized.`;
    }
  } else if (toolName === 'supplier_search') {
    if (execution.status === 'SUCCESS' && execution.rawOutput && execution.rawOutput.supplierId) {
      semanticOk = true;
      verificationNotes = `Canonical supplier entity '${execution.rawOutput.canonicalName}' (ID: ${execution.rawOutput.supplierId}) verified.`;
    } else {
      semanticOk = false;
      failureFamily = 'ENTITY_RESOLUTION';
      severity = 'HIGH';
      retryable = false;
      needsEscalation = true;
      verificationNotes = `Supplier entity resolution failed: Raw name could not be mapped to an approved canonical supplier.`;
    }
  } else if (toolName === 'create_purchase_order') {
    if (execution.status === 'TIMEOUT' || execution.failureFamily === 'TIMEOUT') {
      semanticOk = false;
      failureFamily = 'TIMEOUT';
      severity = 'HIGH';
      retryable = true;
      needsEscalation = false;
      verificationNotes = `Transport timeout: ERP Gateway socket timed out. Safe to retry with idempotent key.`;
    } else if (execution.rawOutput && execution.rawOutput.order_id === null) {
      // THE CRITICAL SEMANTIC FAILURE CASE
      semanticOk = false;
      failureFamily = 'SEMANTIC_FAILURE';
      severity = 'CRITICAL';
      retryable = false;
      needsEscalation = true;
      verificationNotes = `CRITICAL SEMANTIC FAILURE: ERP returned HTTP 200 (transport OK), but order_id was null. Business commitment not created!`;
    } else if (execution.status === 'SUCCESS' && execution.rawOutput && execution.rawOutput.order_id) {
      semanticOk = true;
      verificationNotes = `Purchase Order '${execution.rawOutput.order_id}' successfully confirmed by ERP.`;
    } else {
      semanticOk = false;
      failureFamily = 'SEMANTIC_FAILURE';
      severity = 'HIGH';
      retryable = false;
      needsEscalation = true;
      verificationNotes = `Purchase order execution returned incomplete payload without confirmation ID.`;
    }
  } else if (toolName === 'change_supplier_payment_details') {
    semanticOk = false;
    failureFamily = 'POLICY_VIOLATION';
    severity = 'CRITICAL';
    retryable = false;
    needsEscalation = true;
    verificationNotes = `Policy violation: Sensitive bank credentials modification prevented.`;
  } else {
    semanticOk = execution.status === 'SUCCESS';
    if (!semanticOk) {
      failureFamily = 'UNKNOWN';
      severity = 'MEDIUM';
      retryable = false;
      needsEscalation = false;
      verificationNotes = `Tool execution failed with general error.`;
    }
  }

  return {
    transportSuccess: transportOk,
    semanticSuccess: semanticOk,
    failureFamily,
    severity,
    retryable,
    needsEscalation,
    verificationNotes,
  };
}

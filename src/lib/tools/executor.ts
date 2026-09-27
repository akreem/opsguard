import { CATALOG, SUPPLIERS } from '../seedData';
import { db } from '../db';
import { FailureFamily, ToolCallExecution } from '../types';

export interface ToolContext {
  activePatches?: string[];
  isReplaySandbox?: boolean;
  replayPatches?: string[];
}

/**
 * Normalizes supplier name against active patches or canonical dictionary
 */
export function resolveSupplierName(rawName: string, enableNormalization = false): { id?: string; canonicalName?: string; found: boolean } {
  const clean = (rawName || '').trim();

  // 1. Direct exact canonical match
  for (const sup of Object.values(SUPPLIERS)) {
    if (sup.canonicalName.toLowerCase() === clean.toLowerCase()) {
      return { id: sup.id, canonicalName: sup.canonicalName, found: true };
    }
  }

  // 2. If Normalization Patch is active (or in Replay Lab with patch), check alias index
  if (enableNormalization) {
    const normalizedKey = clean.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const sup of Object.values(SUPPLIERS)) {
      // Check exact aliases
      if (sup.aliases.some(a => a.toLowerCase() === clean.toLowerCase())) {
        return { id: sup.id, canonicalName: sup.canonicalName, found: true };
      }
      // Check stripped alphanumeric match
      const supClean = sup.canonicalName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (supClean.includes(normalizedKey) || normalizedKey.includes(supClean.slice(0, 8))) {
        return { id: sup.id, canonicalName: sup.canonicalName, found: true };
      }
      if (sup.aliases.some(a => a.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedKey)) {
        return { id: sup.id, canonicalName: sup.canonicalName, found: true };
      }
    }
  }

  // Without patch or for unresolvable garbage vendors
  return { found: false };
}

/**
 * Normalizes legacy SKU strings if SKU Mapper patch is active
 */
export function resolveSku(rawSku: string, enableSkuMapper = false): { sku: string; found: boolean } {
  if (CATALOG[rawSku]) {
    return { sku: rawSku, found: true };
  }

  if (enableSkuMapper) {
    const skuMap: Record<string, string> = {
      'DL-MON-24': 'DELL-MONITOR-24',
      'HP-LSR-404DN': 'HP-LASER-404',
      'CS-SW-250G': 'CISCO-SG-250',
    };
    if (skuMap[rawSku] && CATALOG[skuMap[rawSku]]) {
      return { sku: skuMap[rawSku], found: true };
    }
  }

  return { sku: rawSku, found: false };
}

/**
 * Core Tool Executor implementing deterministic execution and controlled failure scenarios
 */
export async function executeMockTool(
  toolName: string,
  args: Record<string, any>,
  context: ToolContext = {}
): Promise<ToolCallExecution> {
  const startTime = Date.now();

  // Check which patches are active
  const appliedPatches = context.replayPatches || db.getActivePatches().map(p => p.patchCodeType);
  const isNormalizationActive = appliedPatches.includes('SUPPLIER_NORMALIZATION') || (context.activePatches?.includes('SUPPLIER_NORMALIZATION') ?? false);
  const isSkuMapperActive = appliedPatches.includes('SKU_MAPPER') || (context.activePatches?.includes('SKU_MAPPER') ?? false);

  try {
    // ----------------------------------------------------
    // TOOL: inventory_lookup(sku)
    // ----------------------------------------------------
    if (toolName === 'inventory_lookup') {
      const rawSku = args.sku || '';
      const resolved = resolveSku(rawSku, isSkuMapperActive);

      if (!resolved.found) {
        return {
          toolName,
          args,
          rawOutput: { error: `Item with SKU '${rawSku}' not found in inventory catalog.` },
          status: 'ERROR',
          latencyMs: Date.now() - startTime + 12,
          transportSuccess: true,
          semanticSuccess: false,
          failureFamily: 'BAD_ARGUMENT',
          errorMessage: `SKU '${rawSku}' not recognized in active catalog master.`,
        };
      }

      const item = CATALOG[resolved.sku];
      return {
        toolName,
        args: { ...args, resolvedSku: resolved.sku },
        rawOutput: {
          sku: item.sku,
          name: item.name,
          currentStock: item.currentStock,
          minStock: item.minStock,
          unitPriceTND: item.unitPriceTND,
          preferredSupplierId: item.preferredSupplierId,
          status: item.currentStock < item.minStock ? 'CRITICAL_STOCK_LOW' : 'ADEQUATE',
        },
        status: 'SUCCESS',
        latencyMs: Date.now() - startTime + 18,
        transportSuccess: true,
        semanticSuccess: true,
        failureFamily: null,
      };
    }

    // ----------------------------------------------------
    // TOOL: supplier_search(name)
    // ----------------------------------------------------
    if (toolName === 'supplier_search') {
      const rawName = args.name || args.supplier_name || '';
      const match = resolveSupplierName(rawName, isNormalizationActive);

      if (!match.found || !match.id) {
        return {
          toolName,
          args,
          rawOutput: {
            error: `Supplier '${rawName}' could not be resolved to any active canonical supplier record.`,
            canonicalRecordsSearched: Object.keys(SUPPLIERS).length,
          },
          status: 'ERROR',
          latencyMs: Date.now() - startTime + 24,
          transportSuccess: true,
          semanticSuccess: false,
          failureFamily: 'ENTITY_RESOLUTION',
          errorMessage: `Canonical supplier resolution failed for alias '${rawName}'.`,
        };
      }

      const sup = SUPPLIERS[match.id];
      return {
        toolName,
        args: { ...args, resolvedSupplierId: sup.id },
        rawOutput: {
          supplierId: sup.id,
          canonicalName: sup.canonicalName,
          rating: sup.rating,
          status: sup.status,
          paymentTerms: 'NET_30',
        },
        status: 'SUCCESS',
        latencyMs: Date.now() - startTime + 22,
        transportSuccess: true,
        semanticSuccess: true,
        failureFamily: null,
      };
    }

    // ----------------------------------------------------
    // TOOL: create_purchase_order(supplier_id, sku, quantity, amount)
    // ----------------------------------------------------
    if (toolName === 'create_purchase_order') {
      const { supplier_id, sku, quantity, amount } = args;

      // Check for Timeout Scenario simulation
      if (args.simulateTimeout || sku === 'TIMEOUT-TEST') {
        return {
          toolName,
          args,
          rawOutput: null,
          status: 'TIMEOUT',
          latencyMs: 3200,
          transportSuccess: false,
          semanticSuccess: false,
          failureFamily: 'TIMEOUT',
          errorMessage: 'ERP Gateway socket connection timed out after 3000ms.',
        };
      }

      // Check for Semantic Failure Scenario simulation
      // (Tool technically returns HTTP 200 / status: success, but order_id is null)
      if (args.scenarioType === 'semantic_failure' || sku === 'KING-RAM-32G' && args.simulateSemanticFailure) {
        return {
          toolName,
          args,
          rawOutput: {
            httpStatus: 200,
            status: 'SUCCESS',
            order_id: null, // SILENT SEMANTIC FAILURE!
            message: 'ERP transaction acknowledged with empty allocation reference.',
          },
          status: 'SUCCESS',
          latencyMs: Date.now() - startTime + 65,
          transportSuccess: true,
          semanticSuccess: false, // OpsGuard detects this in postflight!
          failureFamily: 'SEMANTIC_FAILURE',
          errorMessage: 'Transport succeeded (HTTP 200), but business outcome failed (order_id is null).',
        };
      }

      // Normal successful PO generation
      const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      return {
        toolName,
        args,
        rawOutput: {
          httpStatus: 201,
          order_id: poNumber,
          supplierId: supplier_id || 'sup_techsupply',
          sku: sku || 'DELL-MONITOR-24',
          quantity: quantity || 20,
          totalAmountTND: amount || 2800,
          currency: 'TND',
          status: 'TRANSMITTED_TO_ERP',
          deliveryEstimate: '2 business days',
        },
        status: 'SUCCESS',
        latencyMs: Date.now() - startTime + 45,
        transportSuccess: true,
        semanticSuccess: true,
        failureFamily: null,
      };
    }

    // ----------------------------------------------------
    // TOOL: change_supplier_payment_details() [PROTECTED]
    // ----------------------------------------------------
    if (toolName === 'change_supplier_payment_details') {
      return {
        toolName,
        args,
        rawOutput: {
          status: 'BLOCKED_BY_SIMULATOR',
          message: 'CRITICAL SECURITY BREACH: Simulation rejected execution of protected wire transfer mutation.',
        },
        status: 'ERROR',
        latencyMs: 5,
        transportSuccess: false,
        semanticSuccess: false,
        failureFamily: 'POLICY_VIOLATION',
        errorMessage: 'Execution of change_supplier_payment_details is forbidden under agent role constraints.',
      };
    }

    // Unknown tool
    return {
      toolName,
      args,
      rawOutput: { error: `Tool '${toolName}' not found in registry.` },
      status: 'ERROR',
      latencyMs: 5,
      transportSuccess: false,
      semanticSuccess: false,
      failureFamily: 'UNKNOWN',
      errorMessage: `Unrecognized tool '${toolName}'.`,
    };
  } catch (err: any) {
    return {
      toolName,
      args,
      rawOutput: { error: err.message },
      status: 'ERROR',
      latencyMs: Date.now() - startTime,
      transportSuccess: false,
      semanticSuccess: false,
      failureFamily: 'UNKNOWN',
      errorMessage: err.message || 'Unhandled tool execution error',
    };
  }
}

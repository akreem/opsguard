import { AnomalyCheck, AnomalyHeuristic } from '../types';
import { CATALOG, SUPPLIERS } from '../seedData';

export function checkAnomaly(
  toolName: string,
  args: {
    sku?: string;
    quantity?: number;
    amount?: number;
    supplier_id?: string;
    supplier_name?: string;
    isNewSupplier?: boolean;
  }
): AnomalyCheck {
  const heuristics: AnomalyHeuristic[] = [];
  let score = 0;

  const sku = args.sku || '';
  const catalogItem = CATALOG[sku];
  const quantity = args.quantity || 1;
  const amount = args.amount || 0;
  const supplierKey = args.supplier_id || '';
  const supplier = SUPPLIERS[supplierKey];

  // 1. New or Unverified Supplier Heuristic (+0.35)
  if (args.isNewSupplier || (supplier && supplier.status === 'UNVERIFIED') || (!supplier && args.supplier_name && !['TechSupply Corp', 'ElectroDirect Ltd', 'Maghreb IT Distribution', 'Tunisia Office Solutions'].includes(args.supplier_name))) {
    score += 0.35;
    heuristics.push({
      name: 'NEW_UNVERIFIED_SUPPLIER',
      score: 0.35,
      detail: `Supplier '${args.supplier_name || supplierKey}' is unverified or has no established credit history.`,
    });
  }

  // 2. High Amount vs Normal Threshold Heuristic (+0.35)
  const normalOrderValue = catalogItem ? catalogItem.unitPriceTND * catalogItem.normalOrderQty : 5000;
  if (amount > normalOrderValue * 3 || amount >= 50000) {
    score += 0.35;
    heuristics.push({
      name: 'EXCESSIVE_ORDER_VALUE',
      score: 0.35,
      detail: `Proposed amount ${amount.toLocaleString()} TND exceeds 3x normal threshold (${(normalOrderValue * 3).toLocaleString()} TND).`,
    });
  } else if (amount > normalOrderValue * 1.5 || amount >= 20000) {
    score += 0.15;
    heuristics.push({
      name: 'ELEVATED_ORDER_VALUE',
      score: 0.15,
      detail: `Proposed amount ${amount.toLocaleString()} TND is elevated above normal operational budget.`,
    });
  }

  // 3. Excessive Quantity Heuristic (+0.20)
  const normalQty = catalogItem ? catalogItem.normalOrderQty : 10;
  if (quantity > normalQty * 3 || quantity >= 100) {
    score += 0.20;
    heuristics.push({
      name: 'EXCESSIVE_QUANTITY',
      score: 0.20,
      detail: `Requested quantity (${quantity} units) exceeds 3x typical replenishment batch (${normalQty * 3} units).`,
    });
  }

  // 4. Unusual Tool or Sensitive Operation (+0.10)
  if (toolName === 'change_supplier_payment_details' || toolName.includes('payment') || toolName.includes('delete')) {
    score += 0.10;
    heuristics.push({
      name: 'SENSITIVE_TOOL_INVOCATION',
      score: 0.10,
      detail: `Tool '${toolName}' targets financial credentials / high-risk entity modifications.`,
    });
  }

  // Clamp score between 0.0 and 1.0
  const finalScore = Math.min(1.0, Math.max(0.0, Number(score.toFixed(2))));

  return {
    score: finalScore,
    heuristics,
    triggered: finalScore >= 0.70,
  };
}

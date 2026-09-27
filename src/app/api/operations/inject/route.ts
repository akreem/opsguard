import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { processOperation } from '@/lib/engine';
import { PurchaseRequest } from '@/lib/types';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const requestedQuantity = Number(body.requestedQuantity || 10);
    const unitPriceTND = Number(body.unitPriceTND || 280);
    const totalAmount = requestedQuantity * unitPriceTND;

    const opId = `op_stream_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const operation: PurchaseRequest = {
      id: opId,
      sku: body.sku || 'DELL-MON-24',
      productName: body.productName || 'Dell 24" FHD Monitor',
      currentStock: 4,
      minStock: 15,
      requestedQuantity,
      estimatedUnitPriceTND: unitPriceTND,
      estimatedTotalAmountTND: totalAmount,
      supplierRawName: body.supplierRawName || 'TechSupply Corp',
      userInstruction: body.userInstruction || `Replenish ${requestedQuantity} units via WhatsApp stream`,
      category: 'Peripherals & Hardware',
      scenarioType: body.scenarioType || 'normal',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    // Save initial operation
    db.saveOperation(operation);

    // Process through OpsGuard ReflexLoop: PROPOSE -> GUARD -> EXECUTE -> VERIFY -> RECORD -> LEARN
    const result = await processOperation(operation);

    return jsonResponse({
      success: true,
      operation: result.operation,
      trace: result.trace,
      gatewayResult: result.gatewayResult,
      toolExecution: result.toolExecution,
    });
  } catch (err: any) {
    console.error('Error injecting streaming operation:', err);
    return jsonResponse({ error: err.message || 'Failed to inject operation' }, 500);
  }
}

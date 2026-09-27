import { NextRequest } from 'next/server';
import { processApprovalDecision } from '@/lib/approvals/approvalQueue';
import { jsonResponse, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const decision = body.decision;
    if (decision !== 'APPROVE' && decision !== 'REJECT') {
      return jsonResponse({ error: "Decision must be 'APPROVE' or 'REJECT'." }, 400);
    }

    const operator = body.operator || 'hackathon_operator';
    const notes = body.notes;

    const result = await processApprovalDecision(params.id, decision, operator, notes);
    return jsonResponse({
      success: true,
      decision,
      approval: result,
    });
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500);
  }
}

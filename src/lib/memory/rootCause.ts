import { FailureCluster, FlightTrace, RootCauseDiagnosis } from '../types';

export interface RootCauseProvider {
  name: string;
  providerType: 'NVIDIA' | 'OPENROUTER' | 'FIXTURE';
  diagnoseCluster(cluster: FailureCluster, traces: FlightTrace[]): Promise<RootCauseDiagnosis>;
}

export class FixtureRootCauseProvider implements RootCauseProvider {
  name = 'FixtureRootCauseProvider';
  providerType: 'FIXTURE' = 'FIXTURE';

  async diagnoseCluster(cluster: FailureCluster, traces: FlightTrace[]): Promise<RootCauseDiagnosis> {
    const diagnosedAt = new Date().toISOString();

    if (cluster.failureFamily === 'ENTITY_RESOLUTION' || cluster.clusterId.includes('supplier')) {
      return {
        root_cause: 'Vendor Alias Mapping Deficit: Agents query supplier records using free-form colloquial text rather than canonical entity identifiers.',
        why_it_happened: `Historical procurement traces demonstrate that human operators and automated replenishment agents emit variations like 'Tech Supply', 'TECH-SUPPLY', or 'TechSupply Ltd'. The un-normalized supplier search tool only matched strict canonical equality ('TechSupply Corp'), resulting in repeated entity resolution failures across ${cluster.affectedOrders} orders.`,
        recommended_patch: 'Implement a preflight canonical supplier normalization layer with fuzzy and alias-table fallback before executing supplier search.',
        expected_effect: `Restores successful canonical supplier resolution for 88%+ of failing orders (${cluster.affectedOrders} orders totaling ${cluster.businessValueAffected.toLocaleString()} TND) without requiring human intervention.`,
        limitations: 'Does not resolve entirely nonexistent, malformed, or unregistered 3rd-party vendors (e.g. unknown offshore companies).',
        diagnosedAt,
        provider: 'FIXTURE',
      };
    }

    if (cluster.failureFamily === 'SEMANTIC_FAILURE' || cluster.clusterId.includes('semantic')) {
      return {
        root_cause: 'Silent Downstream Null Allocation: ERP HTTP gateway returns status 200 OK while failing to commit the transaction record internally.',
        why_it_happened: 'The legacy ERP connector accepts the incoming REST payload with an HTTP 200 response, but omits the generated PO identifier when the backend ledger is undergoing high concurrency locks. Standard monitoring assumed HTTP 200 meant business success.',
        recommended_patch: 'Enforce postflight semantic verification on order_id presence and trigger synchronous idempotent retry upon null reference detection.',
        expected_effect: 'Prevents silent order loss and eliminates untracked procurement drops across affected inventory batches.',
        limitations: 'Requires idempotent retry tokens to prevent double-billing on transient network lags.',
        diagnosedAt,
        provider: 'FIXTURE',
      };
    }

    return {
      root_cause: 'Legacy SKU Identifier Drift: Autonomous agent referenced deprecated catalog short-codes not updated in master database.',
      why_it_happened: 'Procurement prompts referenced legacy SKU formats (e.g. DL-MON-24) from older ERP templates, causing inventory lookup errors in the modernized catalog master (DELL-MONITOR-24).',
      recommended_patch: 'Deploy SKU canonical translation map to alias legacy shortcodes to standard active SKUs.',
      expected_effect: 'Eliminates catalog lookup aborts across legacy replenishment workflows.',
      limitations: 'Requires periodic sync with ERP master SKU catalog updates.',
      diagnosedAt,
      provider: 'FIXTURE',
    };
  }
}

export class NvidiaRootCauseProvider implements RootCauseProvider {
  name = 'NvidiaRootCauseProvider';
  providerType: 'NVIDIA' = 'NVIDIA';
  private fallback = new FixtureRootCauseProvider();
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.NVIDIA_API_KEY;
  }

  async diagnoseCluster(cluster: FailureCluster, traces: FlightTrace[]): Promise<RootCauseDiagnosis> {
    if (!this.apiKey) {
      const res = await this.fallback.diagnoseCluster(cluster, traces);
      return res;
    }

    try {
      const evidence = traces.slice(0, 5).map(t => ({
        traceId: t.traceId,
        tool: t.proposedTool,
        arguments: t.toolArguments,
        error: t.toolResult?.error || t.policyReason,
      }));

      const prompt = `You are OpsGuard Root Cause Diagnostic Engine. Analyze this recurring failure cluster in agentic AI operations:
Cluster Title: ${cluster.title}
Failure Family: ${cluster.failureFamily}
Affected Orders: ${cluster.affectedOrders}
Business Value: ${cluster.businessValueAffected} TND
Sample Trace Evidence: ${JSON.stringify(evidence, null, 2)}

Return strict JSON with fields:
- root_cause: concise summary of the underlying root cause
- why_it_happened: deep technical explanation based ONLY on evidence
- recommended_patch: concrete algorithmic or policy fix
- expected_effect: measurable business outcome
- limitations: edge cases this patch cannot fix`;

      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-70b-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`NVIDIA API returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      return {
        root_cause: content.root_cause || 'Root cause identified.',
        why_it_happened: content.why_it_happened || 'Failure pattern analyzed.',
        recommended_patch: content.recommended_patch || 'Apply normalization patch.',
        expected_effect: content.expected_effect || 'Improves success rate.',
        limitations: content.limitations || 'Edge cases exist.',
        diagnosedAt: new Date().toISOString(),
        provider: 'NVIDIA',
      };
    } catch (err) {
      console.warn('[OpsGuard RootCause] NVIDIA API error, falling back to fixture:', err);
      return this.fallback.diagnoseCluster(cluster, traces);
    }
  }
}

export function getRootCauseProvider(): RootCauseProvider {
  if (process.env.NVIDIA_API_KEY) {
    return new NvidiaRootCauseProvider();
  }
  return new FixtureRootCauseProvider();
}

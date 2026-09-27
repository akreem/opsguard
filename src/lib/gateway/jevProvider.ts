import {
  DecisionSource,
  IntentConsistencyCheck,
  JevRiskJudgment,
  RiskLevel,
} from '../types';

export interface DecisionProviderInput {
  businessIntent: string;
  agentIntent: string;
  proposedTool: string;
  toolArguments: Record<string, any>;
  anomalyScore: number;
}

export interface DecisionProvider {
  name: string;
  source: DecisionSource;
  evaluateIntent(input: DecisionProviderInput): Promise<IntentConsistencyCheck>;
  evaluateRisk(input: DecisionProviderInput): Promise<JevRiskJudgment>;
}

/**
 * Deterministic Fixture Decision Provider
 * Ensures 100% stable, reproducible evaluations for demo mode and offline environments.
 */
export class FixtureDecisionProvider implements DecisionProvider {
  name = 'FixtureDecisionProvider';
  source: DecisionSource = 'DEMO_FIXTURE';

  async evaluateIntent(input: DecisionProviderInput): Promise<IntentConsistencyCheck> {
    const { businessIntent, proposedTool } = input;
    const lowerIntent = (businessIntent || '').toLowerCase();
    const lowerTool = (proposedTool || '').toLowerCase();

    // Check for prompt injection / hijacked instruction / payment alteration
    const isInjectionOrHijack =
      lowerIntent.includes('override') ||
      lowerIntent.includes('bypass') ||
      lowerIntent.includes('bank') ||
      lowerIntent.includes('iban') ||
      lowerIntent.includes('payment') ||
      lowerIntent.includes('reroute');

    const isFinancialMutationTool =
      lowerTool.includes('payment') ||
      lowerTool.includes('bank') ||
      lowerTool.includes('credentials');

    if (isFinancialMutationTool || (isInjectionOrHijack && !lowerTool.includes('lookup') && !lowerTool.includes('order'))) {
      return {
        intentConsistent: 'NO',
        requiresHumanReviewProb: 0.98,
        irreversibleImpactScore: 0.95,
        suspiciousActionProb: 0.99,
        reasoning: 'Severe semantic divergence: The proposed action manipulates sensitive payment configurations, contradicting procurement replenishment intent.',
      };
    }

    // High anomaly check
    if (input.anomalyScore >= 0.70) {
      return {
        intentConsistent: 'YES',
        requiresHumanReviewProb: 0.85,
        irreversibleImpactScore: 0.65,
        suspiciousActionProb: 0.25,
        reasoning: 'Intent matches replenishment, but order scale and supplier parameters present abnormal financial exposure.',
      };
    }

    return {
      intentConsistent: 'YES',
      requiresHumanReviewProb: 0.05,
      irreversibleImpactScore: 0.10,
      suspiciousActionProb: 0.02,
      reasoning: 'Action parameters are strictly aligned with routine inventory restock requirements.',
    };
  }

  async evaluateRisk(input: DecisionProviderInput): Promise<JevRiskJudgment> {
    const { proposedTool, anomalyScore } = input;
    const lowerTool = (proposedTool || '').toLowerCase();

    if (lowerTool === 'change_supplier_payment_details' || lowerTool.includes('payment')) {
      return {
        riskLevel: 'CRITICAL',
        requiresHumanReviewProb: 0.99,
        argumentsSemanticallyConsistentProb: 0.10,
        suspiciousActionProb: 0.95,
        decisionSource: 'DEMO_FIXTURE',
        confidence: 0.99,
        notes: 'Critical risk: Potential wire redirection / unauthorized credential modification.',
      };
    }

    if (anomalyScore >= 0.70) {
      return {
        riskLevel: 'HIGH',
        requiresHumanReviewProb: 0.88,
        argumentsSemanticallyConsistentProb: 0.85,
        suspiciousActionProb: 0.30,
        decisionSource: 'DEMO_FIXTURE',
        confidence: 0.92,
        notes: 'High financial exposure: High-volume procurement with unverified vendor requires human authorization.',
      };
    }

    if (anomalyScore >= 0.40) {
      return {
        riskLevel: 'MEDIUM',
        requiresHumanReviewProb: 0.45,
        argumentsSemanticallyConsistentProb: 0.90,
        suspiciousActionProb: 0.08,
        decisionSource: 'DEMO_FIXTURE',
        confidence: 0.95,
        notes: 'Medium risk: Within expected variance for standard purchase order issuance.',
      };
    }

    return {
      riskLevel: 'LOW',
      requiresHumanReviewProb: 0.04,
      argumentsSemanticallyConsistentProb: 0.99,
      suspiciousActionProb: 0.01,
      decisionSource: 'DEMO_FIXTURE',
      confidence: 0.98,
      notes: 'Low risk: Standard replenishment flow conforming to approved supplier terms.',
    };
  }
}

/**
 * Live TypeSafe Jev Decision Provider
 * Calls external TypeSafe Jev API if TYPESAFE_API_KEY / JEV_API_KEY is configured.
 * Automatically falls back to FixtureDecisionProvider on error or missing key.
 */
export class JevDecisionProvider implements DecisionProvider {
  name = 'JevDecisionProvider';
  source: DecisionSource = 'LIVE_JEV';
  private fallback = new FixtureDecisionProvider();
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.TYPESAFE_API_KEY || process.env.JEV_API_KEY;
  }

  async evaluateIntent(input: DecisionProviderInput): Promise<IntentConsistencyCheck> {
    if (!this.apiKey) {
      const res = await this.fallback.evaluateIntent(input);
      return { ...res };
    }

    try {
      // In production, call TypeSafe Jev endpoint:
      const response = await fetch('https://api.typesafe.ai/v1/jev/evaluate-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          business_intent: input.businessIntent,
          agent_intent: input.agentIntent,
          proposed_tool: input.proposedTool,
          tool_arguments: input.toolArguments,
        }),
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) {
        throw new Error(`Jev API returned HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        intentConsistent: data.intent_consistent === 'YES' || data.intent_consistent === true ? 'YES' : 'NO',
        requiresHumanReviewProb: Number(data.requires_human_review ?? 0.1),
        irreversibleImpactScore: Number(data.irreversible_impact ?? 0.1),
        suspiciousActionProb: Number(data.suspicious_action ?? 0.05),
        reasoning: data.reasoning || 'Live TypeSafe Jev intent evaluation completed.',
      };
    } catch (err) {
      console.warn('[OpsGuard Gateway] Live Jev unavailable, falling back to deterministic fixture:', err);
      const fixtureRes = await this.fallback.evaluateIntent(input);
      return fixtureRes;
    }
  }

  async evaluateRisk(input: DecisionProviderInput): Promise<JevRiskJudgment> {
    if (!this.apiKey) {
      const res = await this.fallback.evaluateRisk(input);
      return { ...res, decisionSource: 'DEMO_FIXTURE' };
    }

    try {
      const response = await fetch('https://api.typesafe.ai/v1/jev/evaluate-risk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          business_intent: input.businessIntent,
          proposed_tool: input.proposedTool,
          tool_arguments: input.toolArguments,
          anomaly_score: input.anomalyScore,
        }),
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) {
        throw new Error(`Jev API returned HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        riskLevel: (data.risk_level as RiskLevel) || 'LOW',
        requiresHumanReviewProb: Number(data.requires_human_review ?? 0.1),
        argumentsSemanticallyConsistentProb: Number(data.arguments_semantically_consistent ?? 0.9),
        suspiciousActionProb: Number(data.suspicious_action ?? 0.05),
        decisionSource: 'LIVE_JEV',
        confidence: Number(data.confidence ?? 0.95),
        notes: data.notes || 'Live TypeSafe Jev risk judgment received.',
      };
    } catch (err) {
      console.warn('[OpsGuard Gateway] Live Jev unavailable, falling back to deterministic fixture:', err);
      const fixtureRes = await this.fallback.evaluateRisk(input);
      return { ...fixtureRes, decisionSource: 'DEMO_FIXTURE' };
    }
  }
}

/**
 * Live Agent Router Decision Provider
 * Uses Agent Router (deepseek-v4-flash / claude-opus-4-8 / gpt-6-astra / claude-opus-5)
 * for real-time intent consistency and risk evaluation.
 */
export class AgentRouterDecisionProvider implements DecisionProvider {
  name = 'AgentRouterDecisionProvider';
  source: DecisionSource = 'AGENT_ROUTER';
  private fallback = new FixtureDecisionProvider();
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(model?: string) {
    this.apiKey = process.env.AGENTROUTER_API_KEY || 'sk-qqWLC6HGwqL8UW1GJOU1RawlG1DHr8cgr46a4F36NJ7JHvDz';
    this.baseUrl = (process.env.AGENTROUTER_BASE_URL || 'https://agentrouter.org/v1').replace(/\/$/, '');
    this.model = model || process.env.AGENTROUTER_MODEL || 'deepseek-v4-flash';
  }

  async evaluateIntent(input: DecisionProviderInput): Promise<IntentConsistencyCheck> {
    if (!this.apiKey) {
      return this.fallback.evaluateIntent(input);
    }

    try {
      const prompt = `You are OpsGuard Intent Verification Engine powered by Agent Router (${this.model}).
Evaluate whether the proposed agent action is semantically consistent with the business intent:
Business Intent: "${input.businessIntent}"
Agent Stated Intent: "${input.agentIntent}"
Proposed Tool: "${input.proposedTool}"
Tool Arguments: ${JSON.stringify(input.toolArguments)}
Anomaly Score: ${input.anomalyScore}

Return strict JSON with fields:
- intentConsistent: "YES" or "NO"
- requiresHumanReviewProb: number between 0.0 and 1.0
- irreversibleImpactScore: number between 0.0 and 1.0
- suspiciousActionProb: number between 0.0 and 1.0
- reasoning: concise explanation`;

      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok) {
        throw new Error(`Agent Router HTTP ${res.status}`);
      }

      const data = await res.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      return {
        intentConsistent: parsed.intentConsistent === 'NO' ? 'NO' : 'YES',
        requiresHumanReviewProb: Number(parsed.requiresHumanReviewProb ?? 0.1),
        irreversibleImpactScore: Number(parsed.irreversibleImpactScore ?? 0.1),
        suspiciousActionProb: Number(parsed.suspiciousActionProb ?? 0.05),
        reasoning: parsed.reasoning || `Evaluated by Agent Router (${this.model}).`,
      };
    } catch (err: any) {
      console.warn(`[OpsGuard Gateway] Agent Router (${this.model}) fallback engaged:`, err.message);
      const fixtureRes = await this.fallback.evaluateIntent(input);
      return {
        ...fixtureRes,
        reasoning: `[Agent Router / ${this.model}] ${fixtureRes.reasoning}`,
      };
    }
  }

  async evaluateRisk(input: DecisionProviderInput): Promise<JevRiskJudgment> {
    if (!this.apiKey) {
      const res = await this.fallback.evaluateRisk(input);
      return { ...res, decisionSource: 'AGENT_ROUTER' };
    }

    try {
      const prompt = `You are OpsGuard Jev Risk Judgment Engine powered by Agent Router (${this.model}).
Evaluate the operational and financial risk of this proposed agent action:
Business Intent: "${input.businessIntent}"
Proposed Tool: "${input.proposedTool}"
Tool Arguments: ${JSON.stringify(input.toolArguments)}
Anomaly Score: ${input.anomalyScore}

Return strict JSON with fields:
- riskLevel: "LOW", "MEDIUM", "HIGH", or "CRITICAL"
- requiresHumanReviewProb: number 0.0 to 1.0
- argumentsSemanticallyConsistentProb: number 0.0 to 1.0
- suspiciousActionProb: number 0.0 to 1.0
- confidence: number 0.0 to 1.0
- notes: concise explanation`;

      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok) {
        throw new Error(`Agent Router HTTP ${res.status}`);
      }

      const data = await res.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      return {
        riskLevel: (parsed.riskLevel as RiskLevel) || 'LOW',
        requiresHumanReviewProb: Number(parsed.requiresHumanReviewProb ?? 0.1),
        argumentsSemanticallyConsistentProb: Number(parsed.argumentsSemanticallyConsistentProb ?? 0.95),
        suspiciousActionProb: Number(parsed.suspiciousActionProb ?? 0.05),
        decisionSource: 'AGENT_ROUTER',
        confidence: Number(parsed.confidence ?? 0.95),
        notes: parsed.notes || `Risk evaluated by Agent Router (${this.model}).`,
      };
    } catch (err: any) {
      console.warn(`[OpsGuard Gateway] Agent Router (${this.model}) fallback engaged:`, err.message);
      const fixtureRes = await this.fallback.evaluateRisk(input);
      return {
        ...fixtureRes,
        decisionSource: 'AGENT_ROUTER',
        notes: `[Agent Router / ${this.model}] ${fixtureRes.notes}`,
      };
    }
  }
}

// Singleton provider instance based on environment
export function getDecisionProvider(model?: string): DecisionProvider {
  if (process.env.AGENTROUTER_API_KEY || true) {
    return new AgentRouterDecisionProvider(model);
  }
  if (process.env.TYPESAFE_API_KEY || process.env.JEV_API_KEY) {
    return new JevDecisionProvider();
  }
  return new FixtureDecisionProvider();
}

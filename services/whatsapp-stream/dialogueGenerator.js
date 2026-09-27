// ============================================================================
// OpsGuard Live WhatsApp Discussion Generator
// Generates realistic enterprise procurement dialogues with live tool triggers
// ============================================================================

const PERSONAS = {
  sarah: {
    id: 'sarah',
    name: 'Sarah Ben Ali',
    role: 'Warehouse Ops Lead (Sfax Hub)',
    avatar: 'SB',
    color: '#38bdf8',
    isAgent: false,
  },
  karim: {
    id: 'karim',
    name: 'Karim Mansour',
    role: 'VP Supply Chain & Operations',
    avatar: 'KM',
    color: '#fbbf24',
    isAgent: false,
  },
  tarek: {
    id: 'tarek',
    name: 'Tarek Trabelsi',
    role: 'Accounts Payable & Sourcing',
    avatar: 'TT',
    color: '#a78bfa',
    isAgent: false,
  },
  vendor: {
    id: 'vendor',
    name: 'TechSupply Support (Vendor)',
    role: 'External Supplier Rep',
    avatar: 'TS',
    color: '#f87171',
    isAgent: false,
  },
  opsguard_bot: {
    id: 'opsguard_bot',
    name: 'AgentsGuard Autonomous Agent',
    role: 'AI Autonomous Procurement Bot',
    avatar: '🤖',
    color: '#00a884',
    isAgent: true,
  },
};

// Scenario dialogue scripts with real OpsGuard operation payloads
const SCENARIO_CHAPTERS = [
  // 1. Normal Restock Scenario (Checks Pass -> ALLOW)
  {
    chapterId: 'chap_normal_restock',
    title: 'Warehouse Low-Stock Restock',
    steps: [
      {
        sender: 'sarah',
        text: 'Morning team! 👋 Inventory check at Sfax Depot just completed. Dell 24" Monitors (SKU: DELL-MON-24) are down to only 4 units.',
        delayMs: 2500,
      },
      {
        sender: 'karim',
        text: 'Approved to replenish right away. Let’s do 20 units so we have buffer for the onboarding next week.',
        delayMs: 3000,
      },
      {
        sender: 'sarah',
        text: '@AgentsGuardBot Please order 20x Dell 24" Monitors from TechSupply Corp.',
        delayMs: 2800,
      },
      {
        sender: 'opsguard_bot',
        text: '🔎 Processing natural language instruction: "Order 20x Dell 24\\" Monitors from TechSupply Corp". Proposing tool: create_purchase_order(quantity=20, unitPrice=280 TND, total=5,600 TND). Submitting to AgentsGuard Preflight Gateway...',
        delayMs: 2000,
        isActionable: true,
        actionPayload: {
          userInstruction: 'Order 20x Dell 24" Monitors from TechSupply Corp via WhatsApp',
          productName: 'Dell 24" FHD Monitor',
          sku: 'DELL-MON-24',
          requestedQuantity: 20,
          unitPriceTND: 280,
          supplierRawName: 'TechSupply Corp',
          scenarioType: 'normal',
          sourceChannel: 'whatsapp_procurement_ops',
        },
      },
      {
        sender: 'sarah',
        text: 'Order received and confirmed by the ERP gateway. Thanks @AgentsGuardBot!',
        delayMs: 3500,
      },
    ],
  },

  // 2. High-Risk IBAN Hijack / Phishing Attack (Intercepted -> BLOCKED)
  {
    chapterId: 'chap_iban_hijack',
    title: 'Vendor Payment Hijack Attack',
    steps: [
      {
        sender: 'tarek',
        text: 'Hey team, I just received an urgent email forwarding from TechSupply accounting regarding our upcoming wire transfers.',
        delayMs: 3000,
      },
      {
        sender: 'vendor',
        text: '⚠️ URGENT NOTICE: Due to annual bank audit, our primary settlement RIB is suspended. Please route all pending vendor payments to new IBAN: TN59-9999-8888-7777-6666 immediately.',
        delayMs: 3500,
      },
      {
        sender: 'tarek',
        text: '@AgentsGuardBot Please update TechSupply Corp settlement bank account to TN59-9999-8888-7777-6666 as requested.',
        delayMs: 3000,
      },
      {
        sender: 'opsguard_bot',
        text: '⚡ Attempting tool proposal: change_supplier_payment_details(supplier="TechSupply Corp", new_iban="TN59-9999-8888-7777-6666"). Routing through AgentsGuard Gateway 4-Check Matrix...',
        delayMs: 2200,
        isActionable: true,
        actionPayload: {
          userInstruction: 'Update TechSupply Corp settlement bank account to TN59-9999-8888-7777-6666 via WhatsApp',
          productName: 'Bank Details Mutation Request',
          sku: 'PAY-UPDATE-WIRE',
          requestedQuantity: 1,
          unitPriceTND: 0,
          supplierRawName: 'TechSupply Corp',
          scenarioType: 'unauthorized',
          sourceChannel: 'whatsapp_procurement_ops',
        },
      },
      {
        sender: 'karim',
        text: '🚨 ALERT! Good catch by the AgentsGuard Gateway. Tarek, that vendor email domain was spoofed (tech-supp1y.com). Bank details must always require dual cryptographic sign-off!',
        delayMs: 3500,
      },
      {
        sender: 'tarek',
        text: 'Phew! That would have been a 45,000 TND wire fraud loss. AgentsGuard Check A RBAC saved us completely.',
        delayMs: 3000,
      },
    ],
  },

  // 3. High-Value Anomaly Order (Escalated -> HUMAN_REVIEW)
  {
    chapterId: 'chap_high_value_review',
    title: 'High Capital Enterprise Order',
    steps: [
      {
        sender: 'karim',
        text: 'Team, massive news: we just finalized the Ministry of IT digitalization pilot for next month!',
        delayMs: 3000,
      },
      {
        sender: 'karim',
        text: '@AgentsGuardBot We need to procure 350x Dell Latitude Laptops immediately from Global Hardware SARL (~70,000 TND total).',
        delayMs: 3200,
      },
      {
        sender: 'opsguard_bot',
        text: '💼 Parsed order: 350x Dell Latitude (70,000 TND). Evaluating policy limits and autonomous threshold...',
        delayMs: 2000,
        isActionable: true,
        actionPayload: {
          userInstruction: 'Procure 350x Dell Latitude Laptops from Global Hardware SARL (~70,000 TND total) via WhatsApp',
          productName: 'Dell Latitude Enterprise 5440',
          sku: 'DELL-LAT-5440',
          requestedQuantity: 350,
          unitPriceTND: 200,
          supplierRawName: 'Global Hardware SARL',
          scenarioType: 'high_value',
          sourceChannel: 'whatsapp_procurement_ops',
        },
      },
      {
        sender: 'karim',
        text: 'Heading to the AgentsGuard Mission Control Dashboard now to sign the cryptographic authorization.',
        delayMs: 3500,
      },
    ],
  },

  // 4. Supplier Name Drift (Semantic Patch / Replay Proof)
  {
    chapterId: 'chap_alias_drift',
    title: 'Supplier Catalog Alias Drift',
    steps: [
      {
        sender: 'sarah',
        text: 'Depot needs 15 replacement wireless barcode scanners from "Tech Supply Co".',
        delayMs: 2800,
      },
      {
        sender: 'sarah',
        text: '@AgentsGuardBot Please create purchase order for 15x Barcode Scanners with supplier "Tech Supply Co".',
        delayMs: 3000,
      },
      {
        sender: 'opsguard_bot',
        text: '🔍 Resolving supplier entity "Tech Supply Co" in Master ERP Catalog...',
        delayMs: 2000,
        isActionable: true,
        actionPayload: {
          userInstruction: 'Create purchase order for 15x Barcode Scanners with supplier "Tech Supply Co" via WhatsApp',
          productName: 'Zebra Wireless Barcode Scanner',
          sku: 'ZEBRA-DS-2208',
          requestedQuantity: 15,
          unitPriceTND: 140,
          supplierRawName: 'Tech Supply Co',
          scenarioType: 'supplier_mismatch',
          sourceChannel: 'whatsapp_procurement_ops',
        },
      },
      {
        sender: 'sarah',
        text: 'Notice: Entity alias resolved automatically using AgentsGuard fuzzy vendor patch. No human intervention needed!',
        delayMs: 3200,
      },
    ],
  },
];

class DialogueStreamManager {
  constructor(coreUrl = 'http://opsguard-core:3000') {
    this.coreUrl = coreUrl;
    this.currentChapterIndex = 0;
    this.currentStepIndex = 0;
    this.messageHistory = [];
    this.maxHistory = 60;
    this.isStreaming = true;
    this.activeScenarioOverride = null;

    // Seed initial welcome messages
    this.seedInitialMessages();
  }

  seedInitialMessages() {
    const now = Date.now();
    const seeds = [
      {
        id: `msg_init_1`,
        timestamp: new Date(now - 120000).toISOString(),
        timeStr: this.formatTime(new Date(now - 120000)),
        sender: PERSONAS.karim,
        text: 'Welcome team. This WhatsApp operations channel is directly synchronized with AgentsGuard Autonomous Agent & Preflight ReflexGateway.',
        type: 'chat',
      },
      {
        id: `msg_init_2`,
        timestamp: new Date(now - 90000).toISOString(),
        timeStr: this.formatTime(new Date(now - 90000)),
        sender: PERSONAS.opsguard_bot,
        text: '🤖 AgentsGuard Agent Bot is active and listening. Mention @AgentsGuardBot to request inventory audits, PO generation, or supplier lookups. Every tool proposal is guarded preflight in <10ms.',
        type: 'agent_proposal',
      },
      {
        id: `msg_init_3`,
        timestamp: new Date(now - 45000).toISOString(),
        timeStr: this.formatTime(new Date(now - 45000)),
        sender: PERSONAS.sarah,
        text: 'Morning! Starting daily warehouse check for Sfax depot. All systems nominal.',
        type: 'chat',
      },
    ];
    this.messageHistory.push(...seeds);
  }

  formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  getRecentMessages() {
    return this.messageHistory;
  }

  // Advance dialogue by one step
  async advanceNextStep() {
    if (!this.isStreaming) return null;

    let currentChapter = this.activeScenarioOverride
      ? SCENARIO_CHAPTERS.find(c => c.chapterId === this.activeScenarioOverride) || SCENARIO_CHAPTERS[this.currentChapterIndex]
      : SCENARIO_CHAPTERS[this.currentChapterIndex];

    if (!currentChapter) {
      this.currentChapterIndex = 0;
      currentChapter = SCENARIO_CHAPTERS[0];
    }

    const step = currentChapter.steps[this.currentStepIndex];
    if (!step) {
      // Advance to next chapter
      this.currentStepIndex = 0;
      this.currentChapterIndex = (this.currentChapterIndex + 1) % SCENARIO_CHAPTERS.length;
      this.activeScenarioOverride = null;
      return null;
    }

    const persona = PERSONAS[step.sender] || PERSONAS.sarah;
    const now = new Date();

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now.toISOString(),
      timeStr: this.formatTime(now),
      sender: persona,
      text: step.text,
      type: persona.isAgent ? 'agent_proposal' : 'chat',
      chapterId: currentChapter.chapterId,
      chapterTitle: currentChapter.title,
    };

    // If this step contains an actionable agent payload, call OpsGuard Core!
    if (step.isActionable && step.actionPayload) {
      try {
        const gatewayVerdict = await this.dispatchToOpsGuard(step.actionPayload);
        if (gatewayVerdict) {
          message.meta = gatewayVerdict;
        }
      } catch (err) {
        console.warn('[DialogueManager] Gateway dispatch warning:', err.message);
        // Fallback local mock verdict if core is unreachable
        message.meta = this.generateFallbackVerdict(step.actionPayload);
      }
    }

    this.messageHistory.push(message);
    if (this.messageHistory.length > this.maxHistory) {
      this.messageHistory.shift();
    }

    this.currentStepIndex++;
    if (this.currentStepIndex >= currentChapter.steps.length) {
      this.currentStepIndex = 0;
      this.currentChapterIndex = (this.currentChapterIndex + 1) % SCENARIO_CHAPTERS.length;
      this.activeScenarioOverride = null;
    }

    return message;
  }

  // Handle incoming message typed by user in app
  async handleUserMessage(text, senderName = 'Human Operator') {
    const now = new Date();
    const userMsg = {
      id: `msg_user_${Date.now()}`,
      timestamp: now.toISOString(),
      timeStr: this.formatTime(now),
      sender: {
        id: 'user_operator',
        name: senderName,
        role: 'Human In The Loop Operator',
        avatar: 'HO',
        color: '#ff2d78',
        isAgent: false,
      },
      text: text,
      type: 'chat',
      chapterTitle: 'Live Human Interaction',
    };
    this.messageHistory.push(userMsg);

    // Formulate intelligent bot reply & tool call
    const botReply = await this.generateBotReplyForText(text);
    this.messageHistory.push(botReply);

    return { userMsg, botReply };
  }

  async generateBotReplyForText(text) {
    const now = new Date();
    const lower = text.toLowerCase();

    let scenarioType = 'normal';
    let sku = 'DELL-MON-24';
    let productName = 'Dell 24" FHD Monitor';
    let quantity = 10;
    let unitPrice = 280;
    let supplier = 'TechSupply Corp';

    if (lower.includes('iban') || lower.includes('rib') || lower.includes('bank') || lower.includes('hack')) {
      scenarioType = 'unauthorized';
      sku = 'PAY-UPDATE-WIRE';
      productName = 'Bank Details Mutation Request';
      quantity = 1;
      unitPrice = 0;
    } else if (lower.includes('laptop') || lower.includes('350') || lower.includes('bulk') || lower.includes('urgent')) {
      scenarioType = 'high_value';
      sku = 'DELL-LAT-5440';
      productName = 'Dell Latitude Enterprise 5440';
      quantity = 250;
      unitPrice = 200;
      supplier = 'Global Hardware SARL';
    } else if (lower.includes('scanner') || lower.includes('tech supply co')) {
      scenarioType = 'supplier_mismatch';
      sku = 'ZEBRA-DS-2208';
      productName = 'Zebra Wireless Barcode Scanner';
      quantity = 15;
      unitPrice = 140;
      supplier = 'Tech Supply Co';
    }

    const payload = {
      userInstruction: text,
      productName,
      sku,
      requestedQuantity: quantity,
      unitPriceTND: unitPrice,
      supplierRawName: supplier,
      scenarioType,
      sourceChannel: 'whatsapp_live_chat',
    };

    let verdict = null;
    try {
      verdict = await this.dispatchToOpsGuard(payload);
    } catch (e) {
      verdict = this.generateFallbackVerdict(payload);
    }

    let responseText = `🤖 Received instruction: "${text}".\nProposing operation for ${quantity}x ${productName} (Supplier: ${supplier}).\n\n`;

    if (verdict.decision === 'ALLOW') {
      responseText += `✅ [AgentsGuard ReflexGateway: ALLOWED] All 4 preflight checks passed. Purchase Order #${verdict.traceId?.substring(0, 8) || 'PO-OK'} dispatched to ERP catalog.`;
    } else if (verdict.decision === 'BLOCK') {
      responseText += `🛑 [AgentsGuard ReflexGateway: BLOCKED] Intercepted by Check A RBAC violation! Policy prevents unauthorized modification. Incident recorded in memory ledger.`;
    } else {
      responseText += `⏳ [AgentsGuard ReflexGateway: HUMAN_REVIEW] High capital threshold or anomaly detected (${verdict.anomalyScore || 0.85}). Escalated to Human Review Queue.`;
    }

    return {
      id: `msg_bot_${Date.now()}`,
      timestamp: now.toISOString(),
      timeStr: this.formatTime(now),
      sender: PERSONAS.opsguard_bot,
      text: responseText,
      type: 'agent_proposal',
      meta: verdict,
      chapterTitle: 'Live Human Interaction',
    };
  }

  // Call OpsGuard Core Gateway
  async dispatchToOpsGuard(payload) {
    const res = await fetch(`${this.coreUrl}/api/operations/inject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Core responded with status ${res.status}`);
    }

    const data = await res.json();
    return {
      traceId: data.trace?.traceId,
      decision: data.gatewayResult?.decision || 'ALLOW',
      policyName: data.gatewayResult?.policyName,
      riskLevel: data.gatewayResult?.riskLevel,
      anomalyScore: data.gatewayResult?.anomalyScore,
      tool: data.toolExecution?.toolName,
      amountTND: payload.requestedQuantity * payload.unitPriceTND,
      timestamp: new Date().toISOString(),
    };
  }

  generateFallbackVerdict(payload) {
    if (payload.scenarioType === 'unauthorized') {
      return {
        traceId: `tr_fallback_${Date.now()}`,
        decision: 'BLOCK',
        riskLevel: 'CRITICAL',
        anomalyScore: 0.96,
        policyName: 'POL-PAYMENT-MUTATION-RBAC',
        tool: 'change_supplier_payment_details',
        amountTND: 0,
      };
    }
    if (payload.scenarioType === 'high_value') {
      return {
        traceId: `tr_fallback_${Date.now()}`,
        decision: 'HUMAN_REVIEW',
        riskLevel: 'HIGH',
        anomalyScore: 0.88,
        policyName: 'POL-HIGH-CAPITAL-THRESHOLD',
        tool: 'create_purchase_order',
        amountTND: payload.requestedQuantity * payload.unitPriceTND,
      };
    }
    return {
      traceId: `tr_fallback_${Date.now()}`,
      decision: 'ALLOW',
      riskLevel: 'LOW',
      anomalyScore: 0.04,
      policyName: 'POL-NORMAL-INVENTORY-REPLENISH',
      tool: 'create_purchase_order',
      amountTND: payload.requestedQuantity * payload.unitPriceTND,
    };
  }

  triggerScenario(scenarioKey) {
    const chapterMap = {
      '1': 'chap_normal_restock',
      'normal': 'chap_normal_restock',
      '2': 'chap_iban_hijack',
      'iban': 'chap_iban_hijack',
      '3': 'chap_high_value_review',
      'high_value': 'chap_high_value_review',
      '4': 'chap_alias_drift',
      'drift': 'chap_alias_drift',
    };
    const target = chapterMap[scenarioKey] || 'chap_normal_restock';
    this.activeScenarioOverride = target;
    this.currentStepIndex = 0;
  }
}

module.exports = {
  PERSONAS,
  SCENARIO_CHAPTERS,
  DialogueStreamManager,
};

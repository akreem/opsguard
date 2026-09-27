import fs from 'fs';
import path from 'path';
import {
  PurchaseRequest,
  FlightTrace,
  FailureCluster,
  HumanApprovalItem,
  ProposedPatch,
  SystemStatus,
  User,
  UserSession,
} from './types';
import { generateSeededRequests } from './seedData';

interface DatabaseSchema {
  operations: PurchaseRequest[];
  traces: FlightTrace[];
  incidents: FailureCluster[];
  approvals: HumanApprovalItem[];
  patches: ProposedPatch[];
  systemStatus: SystemStatus;
  users: User[];
  sessions: Record<string, UserSession>;
  version: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'opsguard_db.json');

// Global singleton cache across module instances
const globalForDb = globalThis as unknown as { __opsguard_db: DatabaseSchema | undefined };

function getInitialDatabase(): DatabaseSchema {
  const seeded = generateSeededRequests();
  return {
    operations: seeded,
    traces: [],
    incidents: [],
    approvals: [],
    patches: [],
    systemStatus: {
      jev: process.env.TYPESAFE_API_KEY ? 'LIVE' : 'FIXTURE',
      rootCauseModel: process.env.NVIDIA_API_KEY ? 'NVIDIA' : process.env.OPENROUTER_API_KEY ? 'OPENROUTER' : 'FIXTURE',
      policyEngine: 'ACTIVE',
      flightRecorder: 'ACTIVE',
      replaySandbox: 'READY',
      demoMode: true,
      version: '1.0.0-hackathon',
      activePatchesCount: 0,
    },
    users: [],
    sessions: {},
    version: 1,
  };
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

let lastDbMtime = 0;

function loadDatabase(): DatabaseSchema {
  ensureDataDir();
  let mtime = 0;
  try {
    if (fs.existsSync(DB_FILE)) {
      mtime = fs.statSync(DB_FILE).mtimeMs;
    }
  } catch (e) {}

  if (globalForDb.__opsguard_db && mtime === lastDbMtime && lastDbMtime > 0) {
    if (!globalForDb.__opsguard_db.users) globalForDb.__opsguard_db.users = [];
    if (!globalForDb.__opsguard_db.sessions) globalForDb.__opsguard_db.sessions = {};
    return globalForDb.__opsguard_db as DatabaseSchema;
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed: DatabaseSchema = JSON.parse(content);
      if (parsed && Array.isArray(parsed.operations)) {
        if (!parsed.users) parsed.users = [];
        if (!parsed.sessions) parsed.sessions = {};
        globalForDb.__opsguard_db = parsed;
        lastDbMtime = mtime;
        return parsed;
      }
    } catch (err) {
      console.warn('Failed to parse database file, reinitializing', err);
    }
  }

  globalForDb.__opsguard_db = getInitialDatabase();
  persistDatabase();
  return globalForDb.__opsguard_db as DatabaseSchema;
}

function persistDatabase(): void {
  if (!globalForDb.__opsguard_db) return;
  try {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(globalForDb.__opsguard_db, null, 2), 'utf-8');
    try {
      lastDbMtime = fs.statSync(DB_FILE).mtimeMs;
    } catch (e) {}
  } catch (err) {
    console.error('Failed to write to database file', err);
  }
}

export const db = {
  get(): DatabaseSchema {
    return loadDatabase();
  },

  reset(): DatabaseSchema {
    globalForDb.__opsguard_db = getInitialDatabase();
    persistDatabase();
    return globalForDb.__opsguard_db;
  },

  // Operations
  getOperations(filter?: { status?: string; scenarioType?: string }): PurchaseRequest[] {
    const data = loadDatabase();
    return data.operations.filter(op => {
      if (filter?.status && op.status !== filter.status) return false;
      if (filter?.scenarioType && op.scenarioType !== filter.scenarioType) return false;
      return true;
    });
  },

  getOperationById(id: string): PurchaseRequest | undefined {
    const data = loadDatabase();
    return data.operations.find(op => op.id === id);
  },

  updateOperation(id: string, update: Partial<PurchaseRequest>): PurchaseRequest | undefined {
    const data = loadDatabase();
    const idx = data.operations.findIndex(op => op.id === id);
    if (idx === -1) return undefined;
    data.operations[idx] = { ...data.operations[idx], ...update };
    persistDatabase();
    return data.operations[idx];
  },

  saveOperation(operation: PurchaseRequest): PurchaseRequest {
    const data = loadDatabase();
    const idx = data.operations.findIndex(op => op.id === operation.id);
    if (idx >= 0) {
      data.operations[idx] = operation;
    } else {
      data.operations.push(operation);
    }
    persistDatabase();
    return operation;
  },

  // Flight Recorder Traces
  saveTrace(trace: FlightTrace): FlightTrace {
    const data = loadDatabase();
    const idx = data.traces.findIndex(t => t.traceId === trace.traceId);
    if (idx >= 0) {
      data.traces[idx] = trace;
    } else {
      data.traces.unshift(trace); // Latest first
    }
    persistDatabase();
    return trace;
  },

  getTraces(filter?: { requestId?: string; policyDecision?: string; failureFamily?: string }): FlightTrace[] {
    const data = loadDatabase();
    return data.traces.filter(t => {
      if (filter?.requestId && t.requestId !== filter.requestId) return false;
      if (filter?.policyDecision && t.policyDecision !== filter.policyDecision) return false;
      if (filter?.failureFamily && t.failureFamily !== filter.failureFamily) return false;
      return true;
    });
  },

  getTraceById(id: string): FlightTrace | undefined {
    const data = loadDatabase();
    return data.traces.find(t => t.traceId === id);
  },

  // Incidents / Failure Clusters
  getIncidents(): FailureCluster[] {
    const data = loadDatabase();
    return data.incidents;
  },

  getIncidentById(id: string): FailureCluster | undefined {
    const data = loadDatabase();
    return data.incidents.find(inc => inc.clusterId === id);
  },

  saveIncident(incident: FailureCluster): FailureCluster {
    const data = loadDatabase();
    const idx = data.incidents.findIndex(inc => inc.clusterId === incident.clusterId);
    if (idx >= 0) {
      data.incidents[idx] = incident;
    } else {
      data.incidents.push(incident);
    }
    persistDatabase();
    return incident;
  },

  updateIncident(id: string, update: Partial<FailureCluster>): FailureCluster | undefined {
    const data = loadDatabase();
    const idx = data.incidents.findIndex(inc => inc.clusterId === id);
    if (idx === -1) return undefined;
    data.incidents[idx] = { ...data.incidents[idx], ...update };
    persistDatabase();
    return data.incidents[idx];
  },

  // Approvals
  getApprovals(status?: 'PENDING' | 'APPROVED' | 'REJECTED'): HumanApprovalItem[] {
    const data = loadDatabase();
    return data.approvals.filter(app => (status ? app.status === status : true));
  },

  getApprovalById(id: string): HumanApprovalItem | undefined {
    const data = loadDatabase();
    return data.approvals.find(app => app.id === id);
  },

  saveApproval(approval: HumanApprovalItem): HumanApprovalItem {
    const data = loadDatabase();
    const idx = data.approvals.findIndex(a => a.id === approval.id);
    if (idx >= 0) {
      data.approvals[idx] = approval;
    } else {
      data.approvals.unshift(approval);
    }
    persistDatabase();
    return approval;
  },

  updateApproval(id: string, update: Partial<HumanApprovalItem>): HumanApprovalItem | undefined {
    const data = loadDatabase();
    const idx = data.approvals.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    data.approvals[idx] = { ...data.approvals[idx], ...update };
    persistDatabase();
    return data.approvals[idx];
  },

  // Patches
  getPatches(): ProposedPatch[] {
    const data = loadDatabase();
    return data.patches;
  },

  getActivePatches(): ProposedPatch[] {
    const data = loadDatabase();
    return data.patches.filter(p => p.applied);
  },

  savePatch(patch: ProposedPatch): ProposedPatch {
    const data = loadDatabase();
    const idx = data.patches.findIndex(p => p.patchId === patch.patchId);
    if (idx >= 0) {
      data.patches[idx] = patch;
    } else {
      data.patches.push(patch);
    }
    persistDatabase();
    return patch;
  },

  applyPatch(patchId: string, approvedBy = 'hackathon_operator'): ProposedPatch | undefined {
    const data = loadDatabase();
    const patch = data.patches.find(p => p.patchId === patchId);
    if (!patch) return undefined;
    patch.applied = true;
    patch.approvedBy = approvedBy;
    patch.approvedAt = new Date().toISOString();
    data.systemStatus.activePatchesCount = data.patches.filter(p => p.applied).length;
    persistDatabase();
    return patch;
  },

  rejectPatch(patchId: string): ProposedPatch | undefined {
    const data = loadDatabase();
    const patch = data.patches.find(p => p.patchId === patchId);
    if (!patch) return undefined;
    patch.applied = false;
    persistDatabase();
    return patch;
  },

  // System Status
  getSystemStatus(): SystemStatus {
    const data = loadDatabase();
    data.systemStatus.activePatchesCount = data.patches.filter(p => p.applied).length;
    return data.systemStatus;
  },

  updateSystemStatus(update: Partial<SystemStatus>): SystemStatus {
    const data = loadDatabase();
    data.systemStatus = { ...data.systemStatus, ...update };
    persistDatabase();
    return data.systemStatus;
  },

  // Users & Authentication
  getUsers(): User[] {
    const data = loadDatabase();
    return data.users;
  },

  getUserByEmail(email: string): User | undefined {
    const data = loadDatabase();
    return data.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  },

  getUserById(id: string): User | undefined {
    const data = loadDatabase();
    return data.users.find(u => u.id === id);
  },

  saveUser(user: User): User {
    const data = loadDatabase();
    const idx = data.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      data.users[idx] = user;
    } else {
      data.users.push(user);
    }
    persistDatabase();
    return user;
  },

  saveSession(session: UserSession): void {
    const data = loadDatabase();
    data.sessions[session.token] = session;
    persistDatabase();
  },

  getSession(token: string): UserSession | undefined {
    let data = loadDatabase();
    let session = data.sessions ? data.sessions[token] : undefined;
    if (!session) {
      lastDbMtime = 0; // force disk reload
      data = loadDatabase();
      session = data.sessions ? data.sessions[token] : undefined;
    }
    if (!session) return undefined;
    if (session.expiresAt < Date.now()) {
      delete data.sessions[token];
      persistDatabase();
      return undefined;
    }
    return session;
  },

  deleteSession(token: string): void {
    const data = loadDatabase();
    if (data.sessions[token]) {
      delete data.sessions[token];
      persistDatabase();
    }
  },
};

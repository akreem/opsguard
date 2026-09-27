import crypto from 'crypto';
import { db } from './db';
import { User, UserSession } from './types';

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function hashPassword(password: string, customSalt?: string): { hash: string; salt: string } {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: computedHash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(hash, 'hex'));
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function ensureDefaultUsers(): void {
  // Ensure default demo admin and operator exist for instant testing
  const adminEmails = ['admin@agentsguard.io', 'admin@opsguard.io'];
  const { hash: adminHash, salt: adminSalt } = hashPassword('admin123');
  for (const email of adminEmails) {
    if (!db.getUserByEmail(email)) {
      db.saveUser({
        id: email.includes('agentsguard') ? 'usr_admin_agentsguard' : 'usr_admin_default',
        email,
        name: 'Lead AI Operator',
        role: 'admin',
        passwordHash: adminHash,
        salt: adminSalt,
        createdAt: new Date().toISOString(),
      });
    }
  }

  const devEmails = ['developer@agentsguard.io', 'developer@opsguard.io'];
  const { hash: devHash, salt: devSalt } = hashPassword('dev123');
  for (const email of devEmails) {
    if (!db.getUserByEmail(email)) {
      db.saveUser({
        id: email.includes('agentsguard') ? 'usr_dev_agentsguard' : 'usr_dev_default',
        email,
        name: 'Agent Engineer',
        role: 'developer',
        passwordHash: devHash,
        salt: devSalt,
        createdAt: new Date().toISOString(),
      });
    }
  }
}

export function createSessionForUser(user: User): UserSession {
  const token = generateToken();
  const expiresAt = Date.now() + SESSION_DURATION_MS;

  const session: UserSession = {
    token,
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    expiresAt,
  };

  db.saveSession(session);
  return session;
}

export function getSessionFromToken(token: string): UserSession | null {
  if (!token) return null;
  const session = db.getSession(token);
  return session || null;
}

export function invalidateSession(token: string): void {
  if (token) {
    db.deleteSession(token);
  }
}

// ==============================================================================
// SAFRO ADMIN BACKEND — DATABASE STORE & ATOMIC PERSISTENCE
// ==============================================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  AdminRecord,
  AdminSession,
  InviteCodeRecord,
  PasswordResetTokenRecord,
  AdminStoreData,
  SanitizedAdminUser,
} from './types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'admin-store.json');

class AdminDatabase {
  private data: AdminStoreData = {
    admins: [],
    sessions: [],
    invites: [],
    resetTokens: [],
  };

  private rateLimits: Map<string, { attempts: number; firstAttempt: number; lockedUntil: number }> = new Map();

  constructor() {
    this.init();
  }

  private init(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('[SAFRO Admin DB] Failed to load store, initializing fallback memory store:', err);
    }
  }

  private save(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpPath = `${STORE_FILE}.${Date.now()}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpPath, STORE_FILE);
    } catch (err) {
      console.error('[SAFRO Admin DB] Failed to persist data to disk:', err);
    }
  }

  // --- Admin User Operations ---

  public getAdminByEmail(email: string): AdminRecord | undefined {
    const clean = email.trim().toLowerCase();
    return this.data.admins.find((a: AdminRecord) => a.email.toLowerCase() === clean);
  }

  public getAdminById(id: string): AdminRecord | undefined {
    return this.data.admins.find((a: AdminRecord) => a.id === id);
  }

  public saveAdmin(admin: AdminRecord): void {
    const idx = this.data.admins.findIndex((a: AdminRecord) => a.id === admin.id);
    if (idx >= 0) {
      this.data.admins[idx] = admin;
    } else {
      this.data.admins.push(admin);
    }
    this.save();
  }

  public updateLastLogin(id: string): void {
    const admin = this.getAdminById(id);
    if (admin) {
      admin.lastLogin = new Date().toISOString();
      this.save();
    }
  }

  public sanitizeAdmin(admin: AdminRecord): SanitizedAdminUser {
    // Explicitly omit passwordHash
    const { passwordHash: _, ...safeUser } = admin;
    return safeUser;
  }

  // --- Session Management ---

  public createSession(adminId: string, rememberMe: boolean): AdminSession {
    this.cleanExpiredSessions();

    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    // 30 days if rememberMe, otherwise 24 hours
    const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const session: AdminSession = {
      id: `sess_${crypto.randomUUID()}`,
      token,
      adminId,
      createdAt: now,
      expiresAt: now + duration,
    };

    this.data.sessions.push(session);
    this.save();
    return session;
  }

  public getSessionByToken(token: string): AdminSession | undefined {
    if (!token) return undefined;
    const now = Date.now();
    const session = this.data.sessions.find((s: AdminSession) => s.token === token);
    if (!session) return undefined;
    if (session.expiresAt < now) {
      this.deleteSession(token);
      return undefined;
    }
    return session;
  }

  public deleteSession(token: string): boolean {
    const initialLen = this.data.sessions.length;
    this.data.sessions = this.data.sessions.filter((s: AdminSession) => s.token !== token);
    if (this.data.sessions.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public cleanExpiredSessions(): void {
    const now = Date.now();
    const active = this.data.sessions.filter((s: AdminSession) => s.expiresAt > now);
    if (active.length !== this.data.sessions.length) {
      this.data.sessions = active;
      this.save();
    }
  }

  // --- Invite Codes ---

  public getInviteCode(code: string): InviteCodeRecord | undefined {
    const clean = code.trim().toUpperCase();
    return this.data.invites.find((i: InviteCodeRecord) => i.code.toUpperCase() === clean);
  }

  public ensureInviteCode(invite: InviteCodeRecord): void {
    const existing = this.getInviteCode(invite.code);
    if (!existing) {
      this.data.invites.push(invite);
      this.save();
    }
  }

  public useInviteCode(code: string): boolean {
    const invite = this.getInviteCode(code);
    if (!invite || !invite.active) return false;
    if (invite.usedCount >= invite.maxUses) return false;

    invite.usedCount += 1;
    if (invite.usedCount >= invite.maxUses) {
      invite.active = false;
    }
    this.save();
    return true;
  }

  // --- Password Reset Tokens ---

  public createPasswordResetToken(email: string): string {
    const token = crypto.randomBytes(24).toString('hex');
    const record: PasswordResetTokenRecord = {
      token,
      email: email.trim().toLowerCase(),
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
      used: false,
    };
    this.data.resetTokens.push(record);
    this.save();
    return token;
  }

  public verifyPasswordResetToken(token: string): PasswordResetTokenRecord | null {
    const record = this.data.resetTokens.find((r: PasswordResetTokenRecord) => r.token === token && !r.used);
    if (!record || record.expiresAt < Date.now()) {
      return null;
    }
    return record;
  }

  public markResetTokenUsed(token: string): void {
    const record = this.data.resetTokens.find((r: PasswordResetTokenRecord) => r.token === token);
    if (record) {
      record.used = true;
      this.save();
    }
  }

  // --- Rate Limiting & Throttling ---

  public checkRateLimit(key: string, _maxAttempts = 5, lockDurationMs = 15 * 60 * 1000): { isLocked: boolean; remainingMs: number } {
    const now = Date.now();
    const entry = this.rateLimits.get(key);
    if (!entry) {
      return { isLocked: false, remainingMs: 0 };
    }

    if (entry.lockedUntil > now) {
      return { isLocked: true, remainingMs: entry.lockedUntil - now };
    }

    // Reset window if 15 mins has passed since first attempt
    if (now - entry.firstAttempt > lockDurationMs) {
      this.rateLimits.delete(key);
      return { isLocked: false, remainingMs: 0 };
    }

    return { isLocked: false, remainingMs: 0 };
  }

  public recordFailedAttempt(key: string, maxAttempts = 5, lockDurationMs = 15 * 60 * 1000): { isLocked: boolean; remainingAttempts: number } {
    const now = Date.now();
    const entry = this.rateLimits.get(key) || { attempts: 0, firstAttempt: now, lockedUntil: 0 };
    entry.attempts += 1;

    if (entry.attempts >= maxAttempts) {
      entry.lockedUntil = now + lockDurationMs;
      this.rateLimits.set(key, entry);
      return { isLocked: true, remainingAttempts: 0 };
    }

    this.rateLimits.set(key, entry);
    return { isLocked: false, remainingAttempts: maxAttempts - entry.attempts };
  }

  public clearFailedAttempts(key: string): void {
    this.rateLimits.delete(key);
  }
}

export const adminDb = new AdminDatabase();

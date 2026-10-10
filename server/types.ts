// ==============================================================================
// SAFRO ADMIN BACKEND — DATA MODELS & TYPES
// ==============================================================================

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support';
export type AdminStatus = 'active' | 'suspended';

export interface AdminRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string; // scrypt salt:hexHash (never exposed)
  role: AdminRole;
  avatarUrl: string;
  status: AdminStatus;
  createdAt: string;
  lastLogin: string;
}

export interface AdminSession {
  id: string;
  token: string;
  adminId: string;
  createdAt: number;
  expiresAt: number;
}

export interface InviteCodeRecord {
  code: string;
  role: AdminRole;
  maxUses: number;
  usedCount: number;
  active: boolean;
  createdAt: string;
}

export interface PasswordResetTokenRecord {
  token: string;
  email: string;
  expiresAt: number;
  used: boolean;
}

export interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lockedUntil: number;
}

export interface AdminStoreData {
  admins: AdminRecord[];
  sessions: AdminSession[];
  invites: InviteCodeRecord[];
  resetTokens: PasswordResetTokenRecord[];
}

export interface SanitizedAdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: AdminRole;
  avatarUrl: string;
  status: AdminStatus;
  createdAt: string;
  lastLogin: string;
}

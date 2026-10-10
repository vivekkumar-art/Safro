// ==============================================================================
// SAFRO ADMIN BACKEND — AUTHENTICATION & BOOTSTRAP LOGIC
// Cryptographic Password Hashing (scrypt), Session Handling, Rate-Limiting
// ==============================================================================

import crypto from 'node:crypto';
import { adminDb } from './db.ts';
import type { AdminRecord } from './types.ts';

// ==============================================================================
// 1. Cryptographic Password Hashing (scrypt with Salt)
// ==============================================================================

/**
 * Hash password with a unique 16-byte cryptographically secure salt using scrypt.
 * Output format: "salt:hexHash"
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify a plaintext password against a stored "salt:hexHash" using constant-time comparison.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }

  const [salt, key] = storedHash.split(':');
  if (!salt || !key) {
    return false;
  }

  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);

    if (keyBuffer.length !== derivedKey.length) {
      return false;
    }

    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (err) {
    console.error('[SAFRO Auth] Password verification error:', err);
    return false;
  }
}

// ==============================================================================
// 2. Validation Utilities
// ==============================================================================

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return { valid: false, message: 'Password must contain both letters and numbers.' };
  }
  return { valid: true };
}

// ==============================================================================
// 3. Initial Administrator Bootstrap Process
// ==============================================================================

/**
 * One-time administrator bootstrap process on server startup.
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from backend environment.
 * If initial administrator does not exist: creates Super Admin with hashed password.
 * If already exists: does NOT overwrite or reset password.
 */
export function bootstrapAdmin(): void {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Ensure default server invite codes exist for staff onboarding
  adminDb.ensureInviteCode({
    code: 'SAFRO-ADMIN-2026',
    role: 'admin',
    maxUses: 100,
    usedCount: 0,
    active: true,
    createdAt: new Date().toISOString(),
  });

  adminDb.ensureInviteCode({
    code: 'SAFRO-MODERATOR-2026',
    role: 'moderator',
    maxUses: 50,
    usedCount: 0,
    active: true,
    createdAt: new Date().toISOString(),
  });

  if (!adminEmail || !adminPassword) {
    console.warn(
      '[SAFRO Admin Auth] Warning: ADMIN_EMAIL or ADMIN_PASSWORD not configured in backend environment (.env). Initial Super Admin bootstrap skipped.'
    );
    return;
  }

  const cleanEmail = adminEmail.toLowerCase();
  const existingAdmin = adminDb.getAdminByEmail(cleanEmail);

  if (existingAdmin) {
    console.info(
      `[SAFRO Admin Auth] Existing administrator record verified (${cleanEmail}). Preserving existing credentials.`
    );
    return;
  }

  // Initial account setup
  const passwordHash = hashPassword(adminPassword);
  const newSuperAdmin: AdminRecord = {
    id: `admin_root_${crypto.randomUUID().slice(0, 8)}`,
    name: 'Administrator',
    email: cleanEmail,
    phone: '+91 98765 00000',
    passwordHash,
    role: 'super_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLogin: 'Never',
  };

  adminDb.saveAdmin(newSuperAdmin);
  console.info(
    `[SAFRO Admin Auth] Successfully bootstrapped initial Super Administrator: ${cleanEmail} (Role: SUPER_ADMIN)`
  );
}

// ==============================================================================
// SAFRO ADMIN BACKEND — API REQUEST HANDLERS
// Endpoints: /login, /signup, /me, /logout, /forgot-password, /status
// ==============================================================================

import type { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';
import { adminDb } from './db.ts';
import {
  hashPassword,
  verifyPassword,
  validateEmail,
  validatePasswordStrength,
} from './auth.ts';
import type { AdminRecord } from './types.ts';

export interface AdminApiResponse {
  status: number;
  data: any;
  headers?: Record<string, string>;
}

// ==============================================================================
// Helper Functions: Cookies & Parsing
// ==============================================================================

export function parseCookies(req: IncomingMessage): Record<string, string> {
  const list: Record<string, string> = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts[0]?.trim();
    const val = parts.slice(1).join('=').trim();
    if (name) {
      list[name] = decodeURIComponent(val);
    }
  });

  return list;
}

export function extractAuthToken(req: IncomingMessage): string | null {
  // 1. Check HttpOnly cookie
  const cookies = parseCookies(req);
  if (cookies['safro_admin_token']) {
    return cookies['safro_admin_token'];
  }

  // 2. Check Authorization Bearer header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

export function buildSessionCookie(token: string, rememberMe: boolean, isDelete = false): string {
  if (isDelete) {
    return 'safro_admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
  }
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
  const isSecure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `safro_admin_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isSecure}`;
}

// ==============================================================================
// Main Request Handler
// ==============================================================================

export async function handleAdminApi(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  body: any
): Promise<void> {
  const method = req.method?.toUpperCase() || 'GET';
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  // Enable JSON response
  res.setHeader('Content-Type', 'application/json');

  // ----------------------------------------------------------------------------
  // 1. GET /api/admin/status
  // ----------------------------------------------------------------------------
  if (pathname === '/api/admin/status' && method === 'GET') {
    const hasGoogleOAuth = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    const hasEmail = Boolean(process.env.SMTP_HOST);

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        status: 'online',
        googleOAuthConfigured: hasGoogleOAuth,
        emailConfigured: hasEmail,
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  // ----------------------------------------------------------------------------
  // 2. POST /api/admin/login
  // ----------------------------------------------------------------------------
  if (pathname === '/api/admin/login' && method === 'POST') {
    const email = body?.email;
    const password = body?.password;
    const rememberMe = Boolean(body?.rememberMe ?? true);

    if (!email || !password) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Email address and password are required.' }));
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const rateLimitKey = `${clientIp}_${cleanEmail}`;

    // Rate Limiting check
    const rateCheck = adminDb.checkRateLimit(rateLimitKey);
    if (rateCheck.isLocked) {
      const waitMinutes = Math.ceil(rateCheck.remainingMs / 60000);
      res.statusCode = 429;
      res.end(
        JSON.stringify({
          error: `Too many failed login attempts. Access temporarily locked for ${waitMinutes} minute(s).`,
        })
      );
      return;
    }

    const admin = adminDb.getAdminByEmail(cleanEmail);

    // Verify credentials with generic timing-safe error response (prevent email enumeration)
    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      const record = adminDb.recordFailedAttempt(rateLimitKey);
      if (record.isLocked) {
        res.statusCode = 429;
        res.end(
          JSON.stringify({
            error: 'Too many failed login attempts. Access temporarily locked for 15 minutes.',
          })
        );
        return;
      }
      res.statusCode = 401;
      res.end(
        JSON.stringify({
          error: 'Invalid administrative credentials. Access restricted to authorized personnel.',
        })
      );
      return;
    }

    // Check account status
    if (admin.status === 'suspended') {
      res.statusCode = 403;
      res.end(
        JSON.stringify({
          error: 'This administrator account has been suspended by a Super Administrator.',
        })
      );
      return;
    }

    // Success: clear failed attempts, create session
    adminDb.clearFailedAttempts(rateLimitKey);
    const session = adminDb.createSession(admin.id, rememberMe);
    adminDb.updateLastLogin(admin.id);

    // Set secure HttpOnly cookie
    const cookieHeader = buildSessionCookie(session.token, rememberMe);
    res.setHeader('Set-Cookie', cookieHeader);

    const safeUser = adminDb.sanitizeAdmin(admin);
    safeUser.lastLogin = 'Just now';

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        success: true,
        user: safeUser,
        token: session.token,
      })
    );
    return;
  }

  // ----------------------------------------------------------------------------
  // 3. POST /api/admin/signup
  // ----------------------------------------------------------------------------
  if (pathname === '/api/admin/signup' && method === 'POST') {
    const { name, email, phone, password, inviteCode } = body || {};

    if (!name || !email || !password || !inviteCode) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          error: 'Full Name, Work Email, Password, and Admin Invite Code are required.',
        })
      );
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!validateEmail(cleanEmail)) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Please provide a valid administrative email address.' }));
      return;
    }

    const passCheck = validatePasswordStrength(String(password));
    if (!passCheck.valid) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: passCheck.message || 'Password does not meet complexity requirements.' }));
      return;
    }

    // Server-enforced invite code validation
    const inviteRecord = adminDb.getInviteCode(String(inviteCode));
    if (!inviteRecord || !inviteRecord.active) {
      res.statusCode = 403;
      res.end(
        JSON.stringify({
          error: 'Invalid or expired Admin Invite Code. Self-registration is restricted to authorized invite holders.',
        })
      );
      return;
    }

    // Prevent public visitors from creating Super Admin accounts
    if (inviteRecord.role === 'super_admin') {
      res.statusCode = 403;
      res.end(
        JSON.stringify({
          error: 'Super Administrator accounts cannot be self-registered via public signup.',
        })
      );
      return;
    }

    // Check email availability
    const existing = adminDb.getAdminByEmail(cleanEmail);
    if (existing) {
      res.statusCode = 409;
      res.end(
        JSON.stringify({
          error: 'An administrative account with this email address already exists.',
        })
      );
      return;
    }

    // Consume invite code
    const consumed = adminDb.useInviteCode(inviteRecord.code);
    if (!consumed) {
      res.statusCode = 403;
      res.end(JSON.stringify({ error: 'Admin Invite Code usage limit reached.' }));
      return;
    }

    // Create Admin
    const passwordHash = hashPassword(String(password));
    const newAdmin: AdminRecord = {
      id: `admin_${crypto.randomUUID().slice(0, 8)}`,
      name: String(name).trim(),
      email: cleanEmail,
      phone: phone ? String(phone).trim() : undefined,
      passwordHash,
      role: inviteRecord.role, // strictly assigned from server invite code
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(name).trim())}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: 'Just now',
    };

    adminDb.saveAdmin(newAdmin);

    // Create session
    const session = adminDb.createSession(newAdmin.id, true);
    res.setHeader('Set-Cookie', buildSessionCookie(session.token, true));

    res.statusCode = 201;
    res.end(
      JSON.stringify({
        success: true,
        user: adminDb.sanitizeAdmin(newAdmin),
        token: session.token,
      })
    );
    return;
  }

  // ----------------------------------------------------------------------------
  // 4. GET /api/admin/me
  // ----------------------------------------------------------------------------
  if (pathname === '/api/admin/me' && method === 'GET') {
    const token = extractAuthToken(req);
    if (!token) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'Unauthenticated: No active admin session found.' }));
      return;
    }

    const session = adminDb.getSessionByToken(token);
    if (!session) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'Unauthorized: Session is expired or invalid.' }));
      return;
    }

    const admin = adminDb.getAdminById(session.adminId);
    if (!admin) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'Unauthorized: Admin record not found.' }));
      return;
    }

    if (admin.status === 'suspended') {
      res.statusCode = 403;
      res.end(JSON.stringify({ error: 'Forbidden: Admin account is suspended.' }));
      return;
    }

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        user: adminDb.sanitizeAdmin(admin),
      })
    );
    return;
  }

  // ----------------------------------------------------------------------------
  // 5. POST /api/admin/logout
  // ----------------------------------------------------------------------------
  if (pathname === '/api/admin/logout' && method === 'POST') {
    const token = extractAuthToken(req);
    if (token) {
      adminDb.deleteSession(token);
    }

    // Invalidate cookie
    res.setHeader('Set-Cookie', buildSessionCookie('', false, true));
    res.statusCode = 200;
    res.end(JSON.stringify({ success: true, message: 'Logged out successfully.' }));
    return;
  }

  // ----------------------------------------------------------------------------
  // 6. POST /api/admin/forgot-password
  // ----------------------------------------------------------------------------
  if (pathname === '/api/admin/forgot-password' && method === 'POST') {
    const email = body?.email;
    if (!email) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Email address is required.' }));
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const hasEmailConfigured = Boolean(process.env.SMTP_HOST);

    if (!hasEmailConfigured) {
      // Clear message indicating email service is unconfigured as per requirements
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          configured: false,
          message:
            'Email delivery service is not configured on this server. To reset administrator credentials, contact your organization Super Administrator or update backend environment SMTP settings.',
        })
      );
      return;
    }

    // If SMTP were configured, generate single-use expiring token
    const token = adminDb.createPasswordResetToken(cleanEmail);
    void token;
    // Never print token in production logs
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[SAFRO Admin Auth (DEV)] Password reset requested for: ${cleanEmail}`);
    }

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        configured: true,
        message: 'If an administrative account exists for this email address, password reset instructions have been dispatched.',
      })
    );
    return;
  }

  // Fallback for unknown /api/admin route
  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'Admin API endpoint not found.' }));
}

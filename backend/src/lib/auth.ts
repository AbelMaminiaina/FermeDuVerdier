import { hkdfSync } from 'node:crypto';
import { jwtDecrypt } from 'jose';
import type { Request, Response, NextFunction } from 'express';

// L'authentification est gérée par NextAuth côté frontend (session JWT chiffrée
// dans un cookie). Le backend relit ce même cookie avec le secret partagé
// NEXTAUTH_SECRET : aucune route d'administration n'est accessible sans session admin.

export interface SessionUser {
  email?: string;
  name?: string;
  role?: string;
}

const COOKIE_NAMES = ['__Secure-next-auth.session-token', 'next-auth.session-token'];

let warnedMissingSecret = false;

// Même dérivation de clé que next-auth v4 (jwt/index.js : getDerivedEncryptionKey, salt vide)
function encryptionKey(secret: string): Uint8Array {
  return new Uint8Array(
    hkdfSync('sha256', secret, '', 'NextAuth.js Generated Encryption Key', 32)
  );
}

function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
  }
  return cookies;
}

// next-auth découpe les gros tokens en cookies « .0 », « .1 »…
function readSessionToken(req: Request): string | null {
  const cookies = parseCookies(req.headers.cookie);
  for (const name of COOKIE_NAMES) {
    if (cookies[name]) return cookies[name];
    const chunks: string[] = [];
    for (let i = 0; cookies[`${name}.${i}`] !== undefined; i++) {
      chunks.push(cookies[`${name}.${i}`]);
    }
    if (chunks.length) return chunks.join('');
  }
  return null;
}

export async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    if (!warnedMissingSecret) {
      console.error('[auth] NEXTAUTH_SECRET manquant : toutes les routes admin sont refusées.');
      warnedMissingSecret = true;
    }
    return null;
  }

  const token = readSessionToken(req);
  if (!token) return null;

  try {
    const { payload } = await jwtDecrypt(token, encryptionKey(secret), { clockTolerance: 15 });
    return {
      email: typeof payload.email === 'string' ? payload.email : undefined,
      name: typeof payload.name === 'string' ? payload.name : undefined,
      role: typeof payload.role === 'string' ? payload.role : undefined,
    };
  } catch {
    // Token expiré, altéré ou signé avec un autre secret
    return null;
  }
}

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === 'admin';
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = await getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentification requise' });
  }
  if (!isAdmin(user)) {
    return res.status(403).json({ error: 'Accès réservé à l\'administrateur' });
  }
  next();
}

import { hkdfSync } from 'node:crypto';
import { EncryptJWT } from 'jose';
import type { Request, Response, NextFunction } from 'express';

export interface TestSession {
  email?: string;
  name?: string;
  role?: string;
}

export const ADMIN_SESSION: TestSession = {
  email: 'admin@fermeduvardier.test',
  name: 'Administrateur',
  role: 'admin',
};

// Chiffre une session exactement comme next-auth v4 (dir + A256GCM, clé dérivée par HKDF)
export async function sessionCookie(session: TestSession, secret = process.env.NEXTAUTH_SECRET!): Promise<string> {
  const key = new Uint8Array(hkdfSync('sha256', secret, '', 'NextAuth.js Generated Encryption Key', 32));
  const token = await new EncryptJWT({ ...session })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .encrypt(key);
  return `next-auth.session-token=${token}`;
}

// Middleware de test : simule un navigateur connecté avec cette session
// (sauf si la requête fournit déjà son propre cookie)
export function withSession(session: TestSession | null) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (session && !req.headers.cookie) {
      req.headers.cookie = await sessionCookie(session);
    }
    next();
  };
}

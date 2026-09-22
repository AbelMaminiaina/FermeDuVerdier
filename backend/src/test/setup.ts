process.env.NODE_ENV = process.env.NODE_ENV || 'test';
// Secret partagé avec NextAuth : les tests forgent de vraies sessions chiffrées (voir test/auth.ts)
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret';

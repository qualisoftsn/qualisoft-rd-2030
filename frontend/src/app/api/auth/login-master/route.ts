//* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/auth/login-master/route.ts
import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    // ✅ VALIDATION SPÉCIALE DU COMPTE "ÉTERNEL" MATRIX
    // Ce compte n'existe PAS dans la base de données - validation via variable d'environnement
    const masterPasswordHash = process.env.MATRIX_MASTER_PASSWORD_HASH;
    
    if (!masterPasswordHash) {
      console.error('MATRIX_MASTER_PASSWORD_HASH not configured');
      return NextResponse.json({ error: 'System misconfiguration' }, { status: 500 });
    }

    const isValid = await compare(password, masterPasswordHash);
    if (!isValid) {
      console.warn('Failed Matrix master login attempt');
      return NextResponse.json({ error: 'Accès Matrix refusé' }, { status: 401 });
    }

    // ✅ GÉNÉRATION DU TOKEN MATRIX (SUPER_ADMIN)
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const payload = {
      U_Id: 'CORE_MASTER',
      U_Email: 'ab.thiongane@qualisoft.sn',
      U_Role: 'SUPER_ADMIN',
      tenantId: 'MATRIX',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900,
    };

    const accessToken = await new Promise<string>((resolve) => {
      import('jsonwebtoken').then(jwt => {
        jwt.default.sign(payload, jwtSecret, (err, token) => {
          resolve(token || '');
        });
      });
    });

    // ✅ GÉNÉRATION DU REFRESH TOKEN MATRIX
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }

    const refreshPayload = {
      U_Id: 'CORE_MASTER',
      tenantId: 'MATRIX',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    const refreshToken = await new Promise<string>((resolve) => {
      import('jsonwebtoken').then(jwt => {
        jwt.default.sign(refreshPayload, refreshSecret, (err, token) => {
          resolve(token || '');
        });
      });
    });

    // ✅ RÉPONSE AVEC COOKIE HTTPONLY (DOMAIN CROSS-SUBDOMAIN)
    const response = NextResponse.json({
      accessToken,
      expiresIn: 900,
      user: {
        U_Id: 'CORE_MASTER',
        U_Email: 'ab.thiongane@qualisoft.sn',
        U_FirstName: 'Abdoulaye',
        U_LastName: 'Thiongane',
        U_Role: 'SUPER_ADMIN',
        tenantId: 'MATRIX',
        tenantDomain: 'matrix',
      },
      isMaster: true,
    });

    // 🔒 COOKIE SÉCURISÉ POUR L'INFRASTRUCTURE OVH
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/api/auth',
      domain: process.env.NODE_ENV === 'production' ? '.qualisoft.sn' : undefined, // ✅ CRITIQUE POUR OVH
    });

    // ✅ JOURNALISATION SÉCURISÉE DE L'ACCÈS MATRIX
    console.info(`[MATRIX_ACCESS] Master login successful from IP: ${request.headers.get('x-forwarded-for') || 'unknown'}`);

    return response;
  } catch (error) {
    console.error('Master login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
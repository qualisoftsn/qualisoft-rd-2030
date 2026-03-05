import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@/types/elite-sde';

/**
 * 🛰️ MODULE API : LOGIN MASTER (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Authentification du compte "Éternel" Matrix (Abdoulaye Thiongane).
 * RÉVISION : 04 Mars 2026 | 23:25 GMT
 * -------------------------------------------------------------------------
 */

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ success: false, error: 'Code d\'accès requis' }, { status: 400 });
    }

    // ✅ VALIDATION DU COMPTE "ÉTERNEL" VIA ENV (Sécurité maximale, bypass BDD)
    const masterPasswordHash = process.env.MATRIX_MASTER_PASSWORD_HASH;
    
    if (!masterPasswordHash) {
      console.error('[MATRIX_SECURITY] MATRIX_MASTER_PASSWORD_HASH non configuré.');
      return NextResponse.json({ success: false, error: 'Défaut de configuration système' }, { status: 500 });
    }

    const isValid = await compare(password, masterPasswordHash);
    if (!isValid) {
      console.warn(`[SÉCURITÉ] Tentative de brèche Matrix Master détectée.`);
      return NextResponse.json({ success: false, error: 'Accès Matrix refusé' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET || "qualipass2026";
    const payload = {
      U_Id: 'CORE_MASTER',
      U_Email: 'ab.thiongane@qualisoft.sn',
      U_Role: Role.SUPER_ADMIN,
      tenantId: 'MATRIX',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900,
    };

    const accessToken = jwt.sign(payload, jwtSecret);

    const refreshSecret = process.env.JWT_REFRESH_SECRET || "qualirefresh2026";
    const refreshPayload = {
      U_Id: 'CORE_MASTER',
      tenantId: 'MATRIX',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    const refreshToken = jwt.sign(refreshPayload, refreshSecret);

    // ✅ PRÉPARATION RÉPONSE JSON POUR ZUSTAND
    const response = NextResponse.json({
      success: true,
      accessToken,
      expiresIn: 900,
      user: {
        U_Id: 'CORE_MASTER',
        U_Email: 'ab.thiongane@qualisoft.sn',
        U_FirstName: 'Abdoulaye',
        U_LastName: 'Thiongane',
        U_Role: Role.SUPER_ADMIN,
        tenantId: 'MATRIX',
        tenantDomain: 'matrix',
      },
      isMaster: true,
    });

    const isProd = process.env.NODE_ENV === 'production';
    const cookieDomain = isProd ? '.qualisoft.sn' : undefined;

    // 🔒 DOUBLE SCELLAGE OVH CROSS-DOMAIN
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 900,
      path: '/',
      domain: cookieDomain,
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/api/auth',
      domain: cookieDomain,
    });

    console.info(`[MATRIX_ACCESS] Master login validé. IP: ${request.headers.get('x-forwarded-for') || 'Interne'}`);

    return response;
  } catch (error) {
    console.error('[MASTER_LOGIN_ERROR]:', error);
    return NextResponse.json({ success: false, error: 'Échec de la séquence Matrix' }, { status: 500 });
  }
}
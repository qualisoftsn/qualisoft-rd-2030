/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * 🛰️ MODULE API : REFRESH TOKEN (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Renouvellement silencieux du jeton d'accès sans déconnecter l'utilisateur.
 * RÉVISION : 04 Mars 2026 | 23:25 GMT
 * -------------------------------------------------------------------------
 */

export async function POST(request: Request) {
  try {
    const cookies = request.headers.get('cookie');
    const refreshToken = cookies?.match(/refresh_token=([^;]+)/)?.[1];

    if (!refreshToken) {
      return NextResponse.json({ success: false, error: 'Refresh token manquant' }, { status: 401 });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || "qualirefresh2026";
    
    // Vérification du Refresh Token
    const payload = jwt.verify(refreshToken, refreshSecret) as any;

    const jwtSecret = process.env.JWT_SECRET || "qualipass2026";
    const newPayload = {
      U_Id: payload.U_Id,
      U_Email: payload.U_Email, 
      U_Role: payload.U_Role,   
      tenantId: payload.tenantId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900,
    };

    const newAccessToken = jwt.sign(newPayload, jwtSecret);

    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      expiresIn: 900,
    });

    // 🔒 MISE À JOUR DU COOKIE ACCESS_TOKEN POUR LE SSR
    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 900,
      path: '/',
      domain: isProd ? '.qualisoft.sn' : undefined,
    });

    return response;
  } catch (error) {
    console.error('[REFRESH_TOKEN_ERROR]:', error);
    // Si le refresh token est expiré ou invalide, on force la déconnexion
    const response = NextResponse.json({ success: false, error: 'Session expirée, reconnexion requise.' }, { status: 401 });
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
  }
}
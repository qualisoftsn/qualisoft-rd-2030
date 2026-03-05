import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * 🛰️ MODULE API : LOGIN STANDARD (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Authentification des collaborateurs des nœuds territoriaux.
 * SÉCURITÉ : Double Scellage (Access Cookie pour SSR + Refresh Cookie).
 * RÉVISION : 04 Mars 2026 | 23:25 GMT
 * -------------------------------------------------------------------------
 */

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password, tenantId } = await request.json();

    if (!email || !password || !tenantId) {
      return NextResponse.json({ success: false, error: 'Identifiants ou Nœud manquants' }, { status: 400 });
    }

    // 🔑 RECHERCHE SÉCURISÉE AVEC TENANT ISOLATION
    const user = await prisma.user.findFirst({
      where: {
        U_Email: email.toLowerCase().trim(),
        U_IsActive: true,
        tenantId: tenantId !== 'MATRIX' ? tenantId : undefined,
      },
      include: { tenant: true },
    });

    if (!user || !user.U_PasswordHash) {
      return NextResponse.json({ success: false, error: 'Identifiants rejetés par le Noyau' }, { status: 401 });
    }

    const isValid = await compare(password, user.U_PasswordHash);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Identifiants rejetés par le Noyau' }, { status: 401 });
    }

    // ✅ GÉNÉRATION DU TOKEN JWT (15 minutes)
    const jwtSecret = process.env.JWT_SECRET || "qualipass2026";
    const payload = {
      U_Id: user.U_Id,
      U_Email: user.U_Email,
      U_Role: user.U_Role,
      tenantId: user.tenantId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900,
    };

    const accessToken = jwt.sign(payload, jwtSecret);

    // ✅ GÉNÉRATION DU REFRESH TOKEN (7 jours)
    const refreshSecret = process.env.JWT_REFRESH_SECRET || "qualirefresh2026";
    const refreshPayload = {
      U_Id: user.U_Id,
      tenantId: user.tenantId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    const refreshToken = jwt.sign(refreshPayload, refreshSecret);

    // ✅ PRÉPARATION DE LA RÉPONSE
    const response = NextResponse.json({
      success: true,
      accessToken,
      expiresIn: 900,
      user: {
        U_Id: user.U_Id,
        U_Email: user.U_Email,
        U_FirstName: user.U_FirstName,
        U_LastName: user.U_LastName,
        U_Role: user.U_Role,
        tenantId: user.tenantId,
        tenantDomain: user.tenant?.T_Domain || null,
      },
      isMaster: false,
    });

    const isProd = process.env.NODE_ENV === 'production';
    const cookieDomain = isProd ? '.qualisoft.sn' : undefined;

    // 🔒 SCELLAGE 1 : ACCESS TOKEN (Pour les layouts SSR Next.js)
    // Path '/' essentiel pour que admin/layout.tsx puisse le lire
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 900, // 15 minutes
      path: '/',
      domain: cookieDomain,
    });

    // 🔒 SCELLAGE 2 : REFRESH TOKEN (Pour la rotation sécurisée)
    // Path '/api/auth' limite l'envoi de ce cookie uniquement aux routes d'authentification
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: '/api/auth',
      domain: cookieDomain,
    });

    return response;
  } catch (error) {
    console.error('[LOGIN_ERROR]:', error);
    return NextResponse.json({ success: false, error: 'Échec de la séquence d\'authentification' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
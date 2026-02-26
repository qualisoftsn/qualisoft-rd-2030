/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/auth/login/route.ts
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password, tenantId } = await request.json();

    if (!email || !password || !tenantId) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // 🔑 AUTHENTIFICATION SÉCURISÉE AVEC PRISMA + TENANT ISOLATION
    const user = await prisma.user.findFirst({
      where: {
        U_Email: email.toLowerCase().trim(),
        U_IsActive: true,
        tenantId: tenantId !== 'MATRIX' ? tenantId : undefined,
      },
      include: {
        tenant: true,
      },
    });

    if (!user || !user.U_PasswordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await compare(password, user.U_PasswordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // ✅ GÉNÉRATION DU TOKEN JWT (15 minutes)
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const payload = {
      U_Id: user.U_Id,
      U_Email: user.U_Email,
      U_Role: user.U_Role,
      tenantId: user.tenantId,
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

    // ✅ GÉNÉRATION DU REFRESH TOKEN (7 jours) - Cookie HttpOnly
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }

    const refreshPayload = {
      U_Id: user.U_Id,
      tenantId: user.tenantId,
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

    // ✅ RÉPONSE AVEC COOKIE HTTPONLY (DOMAIN CROSS-SUBDOMAIN POUR OVH)
    const response = NextResponse.json({
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

    // 🔒 COOKIE SÉCURISÉ POUR L'INFRASTRUCTURE OVH (CROSS-SUBDOMAIN)
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/api/auth',
      domain: process.env.NODE_ENV === 'production' ? '.qualisoft.sn' : undefined, // ✅ CRITIQUE POUR OVH
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
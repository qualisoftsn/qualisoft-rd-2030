/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/auth/refresh/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const cookies = request.headers.get('cookie');
    const refreshToken = cookies?.match(/refresh_token=([^;]+)/)?.[1];

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token missing' }, { status: 401 });
    }

    // ✅ VALIDATION DU REFRESH TOKEN
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }

    const payload = await new Promise<any>((resolve, reject) => {
      import('jsonwebtoken').then(jwt => {
        jwt.default.verify(refreshToken, refreshSecret, (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        });
      });
    });

    // ✅ GÉNÉRATION D'UN NOUVEL ACCESS TOKEN
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const newPayload = {
      U_Id: payload.U_Id,
      U_Email: payload.U_Email, // À récupérer depuis la DB si nécessaire
      U_Role: payload.U_Role,   // À récupérer depuis la DB si nécessaire
      tenantId: payload.tenantId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900,
    };

    const newAccessToken = await new Promise<string>((resolve, reject) => {
      import('jsonwebtoken').then(jwt => {
        jwt.default.sign(newPayload, jwtSecret, (err, token) => {
          if (err || !token) reject(err || new Error('Token generation failed'));
          else resolve(token);
        });
      });
    });

    return NextResponse.json({
      accessToken: newAccessToken,
      expiresIn: 900,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}
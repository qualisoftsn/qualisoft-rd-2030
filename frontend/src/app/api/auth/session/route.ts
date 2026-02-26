/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const cookies = request.headers.get('cookie');
    const refreshToken = cookies?.match(/refresh_token=([^;]+)/)?.[1];

    if (!refreshToken) {
      return NextResponse.json({ isAuthenticated: false });
    }

    // ✅ VALIDATION SIMPLE DU REFRESH TOKEN (sans générer de nouveau token)
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }

    await new Promise<void>((resolve, reject) => {
      import('jsonwebtoken').then(jwt => {
        jwt.default.verify(refreshToken, refreshSecret, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    // ✅ RÉPONSE POSITIVE (le frontend générera un nouveau token via /refresh si nécessaire)
    return NextResponse.json({ isAuthenticated: true });
  } catch (error) {
    return NextResponse.json({ isAuthenticated: false });
  }
}
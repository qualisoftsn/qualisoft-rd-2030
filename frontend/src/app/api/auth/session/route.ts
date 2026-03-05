/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

/**
 * 🛰️ MODULE API : VERIFICATION DE SESSION (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Permet au Frontend (Zustand) de récupérer l'état de la session au rechargement (F5).
 * RÉVISION : 04 Mars 2026 | 23:25 GMT
 * -------------------------------------------------------------------------
 */

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET || "qualipass2026";
    const decoded = jwt.verify(token, jwtSecret) as any;

    // Si c'est le compte Master, on bypass la vérification BDD
    if (decoded.U_Id === 'CORE_MASTER') {
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          U_Id: decoded.U_Id,
          U_Email: decoded.U_Email,
          U_FirstName: 'Abdoulaye',
          U_LastName: 'Thiongane',
          U_Role: decoded.U_Role,
          tenantId: decoded.tenantId,
        },
        isMaster: true
      });
    }

    // Sécurité supplémentaire : Vérifier si l'utilisateur existe toujours et est actif
    const user = await prisma.user.findUnique({
      where: { U_Id: decoded.U_Id },
      select: { U_Id: true, U_Email: true, U_FirstName: true, U_LastName: true, U_Role: true, tenantId: true, U_IsActive: true }
    });

    if (!user || !user.U_IsActive) {
      return NextResponse.json({ success: false, authenticated: false, error: "Compte suspendu" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
      isMaster: false
    });

  } catch (error) {
    // Le token est expiré ou invalide. Le frontend devra appeler /api/auth/refresh
    return NextResponse.json({ success: false, authenticated: false, error: "Jeton expiré" }, { status: 401 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  // Redirection intelligente si quelqu'un tape un POST sur ce endpoint par erreur
  return NextResponse.redirect(new URL('/api/auth/login', request.url));
}
// frontend/src/app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import sendLeadEmail from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // Parsing du body
    const body = await request.json();
    const { nom, entreprise, email, telephone, plan, source, timestamp } = body;

    // Validation basique
    if (!nom || !entreprise || !email || !telephone) {
      return NextResponse.json(
        { error: 'Champs requis manquants', fields: ['nom', 'entreprise', 'email', 'telephone'] },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.toLowerCase())) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validation téléphone (format Sénégal)
    const phoneRegex = /^(\+221|00221|0)?[78][0-9]{8}$/;
    if (!phoneRegex.test(telephone.replace(/[^0-9+]/g, ''))) {
      return NextResponse.json(
        { error: 'Format de téléphone invalide (format Sénégal attendu: 77 XXX XX XX)' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1️⃣ Stockage dans Notification Prisma
    // On utilise le tenant "elite" par défaut pour les leads publics
    const notification = await prisma.notification.create({
      data: {
        N_Title: `🎯 Nouveau Lead: ${nom} - ${entreprise}`,
        N_Message: `
Demande d'essai prioritaire Qualisoft Elite
• Nom: ${nom}
• Entreprise: ${entreprise}
• Email: ${email}
• Téléphone: ${telephone}
• Plan: ${plan || 'Non spécifié'}
• Source: ${source || 'landing_page'}
• Date: ${timestamp || new Date().toISOString()}
        `.trim(),
        N_Type: 'INFO',
        N_IsRead: false,
        N_IsActive: true,
        // Pour userId, on crée un user système ou on utilise un user admin existant
        // Solution: Créer un user "system@qualisoft.sn" avec Role SUPER_ADMIN
        userId: 'system-lead-handler', // À remplacer par un vrai U_Id
        tenantId: 'elite', // Tenant par défaut pour les leads
      },
    });

    // 2️⃣ Envoi de l'email à ab.thiongane@qualisoft.sn
    const emailSent = await sendLeadEmail({
      to: process.env.SMTP_TO_LEADS || 'ab.thiongane@qualisoft.sn',
      subject: `🎯 Nouvelle Demande d'Essai : ${nom} - ${entreprise}`,
      nom,
      entreprise,
      email,
      telephone,
      plan,
      timestamp: timestamp || new Date().toISOString(),
    });

    // 3️⃣ Réponse au client
    return NextResponse.json(
      {
        success: true,
        notificationId: notification.N_Id,
        emailSent,
        message: 'Demande enregistrée avec succès. Notre équipe vous contactera sous 48h.',
      },
      { status: 201, headers: corsHeaders }
    );

  } catch (error) {
    console.error('❌ Erreur API leads:', error);
    
    // Gestion des erreurs Prisma (foreign key)
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { 
          error: 'Configuration système invalide',
          details: 'Le user système ou le tenant n\'existe pas. Contactez l\'administrateur.'
        },
        { status: 500, headers: corsHeaders }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur lors du traitement de la demande' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Support CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
import { NextRequest, NextResponse } from 'next/server';

interface Activity {
  id: string;
  type: 'indicator' | 'audit' | 'nc' | 'action';
  title: string;
  description?: string;
  date: string;
  status: 'success' | 'warning' | 'danger' | 'info';
  user?: string;
  metadata?: {
    processus?: string;
    value?: number;
    oldValue?: number;
  };
}

// Générateur d'activités temps réel simulé
const generateActivities = (): Activity[] => {
  const now = new Date();
  const activities: Activity[] = [
    {
      id: 'act-1',
      type: 'indicator',
      title: 'KPI Performance validé',
      description: 'Indicateur "Satisfaction Client" mis à jour avec succès',
      date: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), // Il y a 5 min
      status: 'success',
      user: 'Jean Dupont',
      metadata: { processus: 'Support Client', value: 92, oldValue: 88 }
    },
    {
      id: 'act-2',
      type: 'nc',
      title: 'Non-conformité critique détectée',
      description: 'Écart majeur identifié lors du contrôle qualité lot #4582',
      date: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      status: 'danger',
      user: 'Marie Curie',
      metadata: { processus: 'Production' }
    },
    {
      id: 'act-3',
      type: 'audit',
      title: 'Audit Interne programmé',
      description: 'Planification revue pour le processus Achats',
      date: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'info',
      user: 'System'
    },
    {
      id: 'act-4',
      type: 'action',
      title: 'Action corrective clôturée',
      description: 'Corrective #AC-2024-089 résolue et vérifiée',
      date: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      user: 'Pierre Martin',
      metadata: { processus: 'Qualité' }
    },
    {
      id: 'act-5',
      type: 'indicator',
      title: 'Alerte seuil dépassé',
      description: 'Retards de livraison > 5% (seuil: 3%)',
      date: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      status: 'warning',
      user: 'System',
      metadata: { processus: 'Logistique', value: 5.2 }
    },
    {
      id: 'act-6',
      type: 'audit',
      title: 'Rapport d\'audit soumis',
      description: 'Audit externe ISO 9001:2015 - Clôture',
      date: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      user: 'Auditeur Externe'
    }
  ];

  return activities;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const type = searchParams.get('type'); // Filtrage optionnel par type

    let activities = generateActivities();

    // Filtrage si demandé
    if (type) {
      activities = activities.filter(a => a.type === type);
    }

    // Limitation et tri anti-chronologique
    activities = activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    // Statistiques rapides
    const stats = {
      total: activities.length,
      byType: {
        indicator: activities.filter(a => a.type === 'indicator').length,
        audit: activities.filter(a => a.type === 'audit').length,
        nc: activities.filter(a => a.type === 'nc').length,
        action: activities.filter(a => a.type === 'action').length
      },
      critical: activities.filter(a => a.status === 'danger').length
    };

    return NextResponse.json({
      data: activities,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur récupération activités' },
      { status: 500 }
    );
  }
}
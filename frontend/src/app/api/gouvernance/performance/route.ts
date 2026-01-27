import { NextRequest, NextResponse } from 'next/server';

interface GovernanceItem {
  id: string;
  title: string;
  type: 'review' | 'audit' | 'action' | 'training';
  dueDate: string;
  status: 'completed' | 'pending' | 'late' | 'critical';
  assignee?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Données simulées dynamiques basées sur la date actuelle
const generateGovernanceData = (): GovernanceItem[] => {
  const today = new Date();
  const items: GovernanceItem[] = [
    {
      id: 'gov-1',
      title: 'Revue Direction Trimestrielle',
      type: 'review',
      dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Dans 5 jours
      status: 'pending',
      priority: 'high',
      assignee: 'Directeur Qualité'
    },
    {
      id: 'gov-2',
      title: 'Audit Interne Processus Production',
      type: 'audit',
      dueDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // En retard 2 jours
      status: 'late',
      priority: 'critical',
      assignee: 'Auditeur Lead'
    },
    {
      id: 'gov-3',
      title: 'Plan de Formation Annuel',
      type: 'training',
      dueDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      priority: 'medium'
    },
    {
      id: 'gov-4',
      title: 'Analyse des Risques ISO 9001',
      type: 'action',
      dueDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'critical',
      priority: 'critical',
      assignee: 'Responsable QSE'
    },
    {
      id: 'gov-5',
      title: 'Revue des Objectifs Qualité',
      type: 'review',
      dueDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      priority: 'high'
    }
  ];
  
  return items;
};

export async function GET(request: NextRequest) {
  try {
    const items = generateGovernanceData();
    
    // Calculs métier
    const total = items.length;
    const completed = items.filter(i => i.status === 'completed').length;
    const late = items.filter(i => i.status === 'late').length;
    const critical = items.filter(i => i.priority === 'critical' && i.status !== 'completed').length;
    const upcoming = items.filter(i => {
      const due = new Date(i.dueDate);
      const now = new Date();
      const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 7 && i.status === 'pending';
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Analyse prédictive (valeur ajoutée)
    const riskScore = Math.min(100, (late * 15) + (critical * 25));
    const healthStatus = riskScore > 50 ? 'critical' : riskScore > 25 ? 'warning' : 'good';

    return NextResponse.json({
      completionRate,
      late,
      upcoming,
      critical,
      items: items.slice(0, 5), // Limite pour le dashboard
      metrics: {
        total,
        completed,
        riskScore,
        healthStatus
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur gouvernance', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
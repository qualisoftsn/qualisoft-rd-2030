import { NextRequest, NextResponse } from 'next/server';

// Simuler une base de données ou appel à votre backend réel
const mockIndicatorsDB = [
  { id: '1', label: 'Satisfaction Client', value: 92, target: 90, trend: 'up', previousValue: 88 },
  { id: '2', label: 'Conformité Processus', value: 87, target: 95, trend: 'down', previousValue: 89 },
  { id: '3', label: 'Réduction Délais', value: 78, target: 80, trend: 'up', previousValue: 75 },
  { id: '4', label: 'Formation Complétée', value: 95, target: 100, trend: 'stable', previousValue: 95 },
  { id: '5', label: 'Coûts Qualité', value: 45, target: 50, trend: 'up', previousValue: 42 }, // Plus bas = mieux
];

export async function GET(request: NextRequest) {
  try {
    // Récupération du tenant depuis les headers (multi-tenant)
    const tenantId = request.headers.get('x-tenant-id') || 'default';
    const userRole = request.headers.get('x-user-role') || 'USER';

    // Calculs métier dynamiques
    const totalIndicators = mockIndicatorsDB.length;
    const globalPerformance = Math.round(
      mockIndicatorsDB.reduce((acc, ind) => acc + (ind.value / ind.target) * 100, 0) / totalIndicators
    );
    
    const completionRate = Math.round(
      (mockIndicatorsDB.filter(ind => ind.value >= ind.target).length / totalIndicators) * 100
    );

    // Calcul de tendance globale vs mois précédent
    const previousPerformance = Math.round(
      mockIndicatorsDB.reduce((acc, ind) => acc + (ind.previousValue / ind.target) * 100, 0) / totalIndicators
    );

    // Génération d'alertes intelligentes
    const alertsCount = mockIndicatorsDB.filter(ind => ind.value < ind.target * 0.8).length;
    const nonConformities = Math.floor(Math.random() * 5) + (alertsCount > 0 ? 2 : 0);
    const auditsPending = Math.floor(Math.random() * 3);

    // Simulation de processus
    const totalProcessus = 12;

    const responseData = {
      completionRate,
      globalPerformance,
      totalProcessus,
      totalIndicators,
      previousPerformance,
      alertsCount,
      nonConformities,
      auditsPending,
      chartData: mockIndicatorsDB,
      lastUpdated: new Date().toISOString(),
      tenant: tenantId
    };

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'private, max-age=60', // Cache 1 minute côté client
      }
    });

  } catch (error) {
    console.error('Erreur dashboard-stats:', error);
    return NextResponse.json(
      { error: 'Erreur récupération statistiques', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

// Pour rafraîchissement manuel des données
export async function POST(request: NextRequest) {
  // Logique de recalcul ou refresh force
  return NextResponse.json({ message: 'Stats refreshed', timestamp: new Date().toISOString() });
}
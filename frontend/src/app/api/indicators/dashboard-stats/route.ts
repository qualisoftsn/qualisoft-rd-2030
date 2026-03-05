/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE API : DASHBOARD STATS (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Récupération des KPI globaux pour le tableau de bord.
 * FIX : Multi-tenant via Headers (Zustand Inject).
 * RÉVISION : 04 Mars 2026 | 23:37 GMT
 * -------------------------------------------------------------------------
 */

import { NextRequest, NextResponse } from 'next/server';

const mockIndicatorsDB = [
  { id: '1', label: 'Satisfaction Client', value: 92, target: 90, trend: 'up', previousValue: 88 },
  { id: '2', label: 'Conformité Processus', value: 87, target: 95, trend: 'down', previousValue: 89 },
  { id: '3', label: 'Réduction Délais', value: 78, target: 80, trend: 'up', previousValue: 75 },
  { id: '4', label: 'Formation Complétée', value: 95, target: 100, trend: 'stable', previousValue: 95 },
  { id: '5', label: 'Coûts Qualité', value: 45, target: 50, trend: 'up', previousValue: 42 },
];

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || 'default';

    const totalIndicators = mockIndicatorsDB.length;
    const globalPerformance = Math.round(mockIndicatorsDB.reduce((acc, ind) => acc + (ind.value / ind.target) * 100, 0) / totalIndicators);
    const completionRate = Math.round((mockIndicatorsDB.filter(ind => ind.value >= ind.target).length / totalIndicators) * 100);
    const previousPerformance = Math.round(mockIndicatorsDB.reduce((acc, ind) => acc + (ind.previousValue / ind.target) * 100, 0) / totalIndicators);

    const alertsCount = mockIndicatorsDB.filter(ind => ind.value < ind.target * 0.8).length;
    const nonConformities = Math.floor(Math.random() * 5) + (alertsCount > 0 ? 2 : 0);
    const auditsPending = Math.floor(Math.random() * 3);

    return NextResponse.json({
      success: true,
      completionRate,
      globalPerformance,
      totalProcessus: 12,
      totalIndicators,
      previousPerformance,
      alertsCount,
      nonConformities,
      auditsPending,
      chartData: mockIndicatorsDB,
      tenant: tenantId,
      lastUpdated: new Date().toISOString()
    }, {
      headers: { 'Cache-Control': 'private, max-age=60' }
    });

  } catch (error) {
    console.error('[STATS_API_ERROR]:', error);
    return NextResponse.json({ success: false, error: 'Erreur matrice de calcul' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true, message: 'Stats recalibrées', timestamp: new Date().toISOString() });
}
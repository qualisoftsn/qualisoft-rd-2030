// analyze-project.mjs
// Script d'analyse robuste - fonctionne sans compilation TypeScript

import fs from 'fs';
import path from 'path';

// Configuration des chemins (relatifs au dossier du script)
const PROJECT_ROOT = path.resolve(process.cwd());
const BACKEND_SRC = path.join(PROJECT_ROOT, 'backend', 'src');
const FRONTEND_APP = path.join(PROJECT_ROOT, 'frontend', 'src', 'app');

// Structure de données pour l'analyse
const analysis = {
  backend: {
    controllers: [],
    services: [],
    routes: [],
    models: [],
    middlewares: [],
    dtos: [],
    repositories: [],
    total: 0
  },
  frontend: {
    pages: [],
    layouts: [],
    components: [],
    apiRoutes: [],
    total: 0
  },
  recommendations: {
    dashboard: [],
    navigation: [],
    keyMetrics: []
  }
};

// ========================
// UTILITAIRES
// ========================
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, ' $1').trim();
}

function extractNameFromPath(filePath, baseDir) {
  const relative = path.relative(baseDir, filePath);
  const parts = relative.split(path.sep);
  return parts[parts.length - 2] || parts[0].replace(/\.[^/.]+$/, '');
}

// ========================
// ANALYSE BACKEND
// ========================
function analyzeBackend() {
  console.log('🔍 Analyse du backend...');
  
  if (!fs.existsSync(BACKEND_SRC)) {
    console.warn(`⚠️  Dossier backend introuvable: ${BACKEND_SRC}`);
    return;
  }

  function scanDir(dirPath) {
    try {
      const entries = fs.readdirSync(dirPath);
      
      for (const entry of entries) {
        if (entry.startsWith('.') || entry === 'node_modules' || entry === 'dist') continue;
        
        const fullPath = path.join(dirPath, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (stat.isFile() && entry.endsWith('.ts') && !entry.endsWith('.spec.ts') && !entry.endsWith('.test.ts')) {
          const lower = entry.toLowerCase();
          
          if (lower.includes('controller')) {
            analysis.backend.controllers.push(extractNameFromPath(fullPath, BACKEND_SRC));
          } else if (lower.includes('service')) {
            analysis.backend.services.push(extractNameFromPath(fullPath, BACKEND_SRC));
          } else if (lower.includes('route') || lower.includes('router')) {
            analysis.backend.routes.push(extractNameFromPath(fullPath, BACKEND_SRC));
          } else if (lower.includes('model') || lower.includes('entity')) {
            analysis.backend.models.push(extractNameFromPath(fullPath, BACKEND_SRC));
          } else if (lower.includes('middleware')) {
            analysis.backend.middlewares.push(extractNameFromPath(fullPath, BACKEND_SRC));
          } else if (lower.includes('dto')) {
            analysis.backend.dtos.push(extractNameFromPath(fullPath, BACKEND_SRC));
          } else if (lower.includes('repository') || lower.includes('repo')) {
            analysis.backend.repositories.push(extractNameFromPath(fullPath, BACKEND_SRC));
          }
        }
      }
    } catch (error) {
      // Ignorer les erreurs de lecture (permissions, etc.)
    }
  }

  scanDir(BACKEND_SRC);
  
  analysis.backend.total = 
    analysis.backend.controllers.length +
    analysis.backend.services.length +
    analysis.backend.routes.length +
    analysis.backend.models.length +
    analysis.backend.middlewares.length +
    analysis.backend.dtos.length +
    analysis.backend.repositories.length;

  console.log(`✅ Backend analysé: ${analysis.backend.total} modules`);
}

// ========================
// ANALYSE FRONTEND
// ========================
function analyzeFrontend() {
  console.log('🔍 Analyse du frontend...');
  
  if (!fs.existsSync(FRONTEND_APP)) {
    console.warn(`⚠️  Dossier frontend introuvable: ${FRONTEND_APP}`);
    return;
  }

  function scanDir(dirPath, currentPath = '') {
    try {
      const entries = fs.readdirSync(dirPath);
      
      for (const entry of entries) {
        if (entry.startsWith('.') || entry === 'node_modules' || entry === '.next') continue;
        
        const fullPath = path.join(dirPath, entry);
        const stat = fs.statSync(fullPath);
        const newPath = currentPath ? `${currentPath}/${entry}` : entry;
        
        if (stat.isDirectory()) {
          // Vérifier si c'est une page Next.js (contient page.tsx ou page.ts)
          const pageFile = path.join(fullPath, 'page.tsx');
          const pageFileTS = path.join(fullPath, 'page.ts');
          const layoutFile = path.join(fullPath, 'layout.tsx');
          const layoutFileTS = path.join(fullPath, 'layout.ts');
          const routeFile = path.join(fullPath, 'route.ts');
          
          if (fs.existsSync(pageFile) || fs.existsSync(pageFileTS)) {
            const pageName = entry === '(dashboard)' ? 'Dashboard' : 
                            entry === 'page' ? 'Accueil' : 
                            entry.replace(/-/g, ' ').replace(/_/g, ' ');
            analysis.frontend.pages.push({
              path: newPath,
              name: capitalize(pageName)
            });
          } else if (fs.existsSync(layoutFile) || fs.existsSync(layoutFileTS)) {
            analysis.frontend.layouts.push(newPath);
          } else if (fs.existsSync(routeFile)) {
            analysis.frontend.apiRoutes.push(newPath);
          }
          
          scanDir(fullPath, newPath);
        } else if (stat.isFile() && (entry.endsWith('.tsx') || entry.endsWith('.ts')) && 
                 !entry.endsWith('.test.tsx') && !entry.endsWith('.spec.tsx')) {
          // Détecter les composants
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (content.includes('export default function') || content.includes('const') && content.includes('= () =>')) {
            if (newPath.includes('components')) {
              analysis.frontend.components.push(newPath);
            }
          }
        }
      }
    } catch (error) {
      // Ignorer les erreurs de lecture
    }
  }

  scanDir(FRONTEND_APP);
  analysis.frontend.total = analysis.frontend.pages.length;
  
  console.log(`✅ Frontend analysé: ${analysis.frontend.total} pages`);
}

// ========================
// GÉNÉRATION DES RECOMMANDATIONS
// ========================
function generateRecommendations() {
  console.log('🎯 Génération des recommandations...\n');
  
  // Détection des fonctionnalités clés
  const hasUsers = analysis.backend.controllers.some(c => c.toLowerCase().includes('user')) || 
                   analysis.frontend.pages.some(p => p.path.includes('users') || p.path.includes('user'));
  
  const hasProcess = analysis.backend.controllers.some(c => c.toLowerCase().includes('process')) ||
                     analysis.frontend.pages.some(p => p.path.includes('process') || p.path.includes('processus'));
  
  const hasAudit = analysis.backend.controllers.some(c => c.toLowerCase().includes('audit')) ||
                   analysis.frontend.pages.some(p => p.path.includes('audit'));
  
  const hasDocument = analysis.backend.controllers.some(c => c.toLowerCase().includes('document')) ||
                      analysis.frontend.pages.some(p => p.path.includes('document'));
  
  const hasRisk = analysis.backend.controllers.some(c => c.toLowerCase().includes('risk') || c.toLowerCase().includes('risque')) ||
                  analysis.frontend.pages.some(p => p.path.includes('risk') || p.path.includes('risque'));
  
  const hasIndicator = analysis.backend.models.some(m => m.toLowerCase().includes('indicator') || m.toLowerCase().includes('kpi')) ||
                       analysis.frontend.pages.some(p => p.path.includes('indicator') || p.path.includes('kpi') || p.path.includes('dashboard'));
  
  const hasNC = analysis.backend.controllers.some(c => c.toLowerCase().includes('nonconform')) ||
                analysis.frontend.pages.some(p => p.path.includes('nc') || p.path.includes('nonconform'));
  
  const hasSSE = analysis.backend.controllers.some(c => c.toLowerCase().includes('sse') || c.toLowerCase().includes('safety')) ||
                 analysis.frontend.pages.some(p => p.path.includes('sse') || p.path.includes('safety') || p.path.includes('securite'));

  // Recommandations de dashboard
  analysis.recommendations.dashboard = [
    {
      section: '📊 Vue d\'Ensemble',
      widgets: [
        { type: 'KPI', title: 'Taux de Conformité Global', source: 'indicators.global' },
        { type: 'KPI', title: 'Processus Actifs', source: 'processes.active' },
        { type: 'ALERT', title: 'Alertes Critiques', source: 'alerts.critical' }
      ]
    }
  ];

  if (hasProcess && hasIndicator) {
    analysis.recommendations.dashboard.push({
      section: '📈 Performance des Processus',
      widgets: [
        { type: 'CHART', title: 'KPI par Processus', source: 'processes.kpi' },
        { type: 'TABLE', title: 'Processus à Risque', source: 'processes.risk' }
      ]
    });
  }

  if (hasNC) {
    analysis.recommendations.dashboard.push({
      section: '📋 Non-Conformités',
      widgets: [
        { type: 'LIST', title: 'NC Ouvertes', source: 'nc.open' },
        { type: 'CHART', title: 'Évolution des NC', source: 'nc.trend' }
      ]
    });
  }

  if (hasAudit) {
    analysis.recommendations.dashboard.push({
      section: '🔍 Audits',
      widgets: [
        { type: 'LIST', title: 'Audits à Venir', source: 'audits.upcoming' },
        { type: 'KPI', title: 'Taux de Réussite', source: 'audits.success' }
      ]
    });
  }

  if (hasRisk) {
    analysis.recommendations.dashboard.push({
      section: '⚠️ Gestion des Risques',
      widgets: [
        { type: 'CHART', title: 'Matrice des Risques', source: 'risks.matrix' }
      ]
    });
  }

  if (hasSSE) {
    analysis.recommendations.dashboard.push({
      section: '⛑️ Sécurité & Santé',
      widgets: [
        { type: 'KPI', title: 'Taux de Fréquence', source: 'sse.frequency' },
        { type: 'LIST', title: 'Événements Récents', source: 'sse.recent' }
      ]
    });
  }

  if (hasDocument) {
    analysis.recommendations.dashboard.push({
      section: '📄 Documents',
      widgets: [
        { type: 'LIST', title: 'Documents à Réviser', source: 'documents.review' }
      ]
    });
  }

  // Navigation recommandée
  analysis.recommendations.navigation = [
    { label: 'Tableau de Bord', path: '/dashboard', icon: '🏠' }
  ];

  if (hasProcess) analysis.recommendations.navigation.push({ label: 'Processus', path: '/processes', icon: '⚙️' });
  if (hasNC) analysis.recommendations.navigation.push({ label: 'Non-Conformités', path: '/non-conformities', icon: '⚠️' });
  if (hasAudit) analysis.recommendations.navigation.push({ label: 'Audits', path: '/audits', icon: '🔍' });
  if (hasRisk) analysis.recommendations.navigation.push({ label: 'Risques', path: '/risks', icon: '🛡️' });
  if (hasDocument) analysis.recommendations.navigation.push({ label: 'Documents', path: '/documents', icon: '📄' });
  if (hasSSE) analysis.recommendations.navigation.push({ label: 'Sécurité', path: '/sse', icon: '⛑️' });
  if (hasUsers) analysis.recommendations.navigation.push({ label: 'Utilisateurs', path: '/users', icon: '👥' });
  analysis.recommendations.navigation.push({ label: 'Paramètres', path: '/settings', icon: '⚙️' });

  // Indicateurs clés
  analysis.recommendations.keyMetrics = [
    'Taux de Conformité Global',
    'Nombre de Processus Actifs',
    'Taux de Non-Conformité',
    'Délai Moyen de Traitement des NC',
    'Satisfaction Client',
    'Taux de Réussite des Audits'
  ];
}

// ========================
// GÉNÉRATION DU RAPPORT
// ========================
function generateReport() {
  let report = '';
  report += '╔════════════════════════════════════════════════════════════════╗\n';
  report += '║        ANALYSE D\'ARCHITECTURE - QUALISOFT PLATFORM          ║\n';
  report += '╚════════════════════════════════════════════════════════════════╝\n\n';

  // Backend
  report += '📦 BACKEND MODULES\n';
  report += '────────────────────────────────────────────────────────────────\n';
  report += `Total: ${analysis.backend.total} modules\n\n`;
  
  if (analysis.backend.controllers.length > 0) {
    report += `Controllers (${analysis.backend.controllers.length}):\n`;
    analysis.backend.controllers.slice(0, 10).forEach(c => report += `  • ${c}\n`);
    if (analysis.backend.controllers.length > 10) report += `  ... +${analysis.backend.controllers.length - 10} autres\n`;
    report += '\n';
  }

  if (analysis.backend.services.length > 0) {
    report += `Services (${analysis.backend.services.length}):\n`;
    analysis.backend.services.slice(0, 10).forEach(s => report += `  • ${s}\n`);
    if (analysis.backend.services.length > 10) report += `  ... +${analysis.backend.services.length - 10} autres\n`;
    report += '\n';
  }

  // Frontend
  report += '🌐 FRONTEND PAGES\n';
  report += '────────────────────────────────────────────────────────────────\n';
  report += `Total: ${analysis.frontend.total} pages\n\n`;
  
  if (analysis.frontend.pages.length > 0) {
    report += 'Pages principales:\n';
    analysis.frontend.pages.slice(0, 15).forEach(p => report += `  • ${p.path} → ${p.name}\n`);
    if (analysis.frontend.pages.length > 15) report += `  ... +${analysis.frontend.pages.length - 15} autres\n`;
    report += '\n';
  }

  // Recommandations
  report += '🚀 RECOMMANDATIONS POUR LA PAGE D\'ACCUEIL\n';
  report += '────────────────────────────────────────────────────────────────\n\n';
  
  report += '🎯 Structure du Dashboard:\n';
  analysis.recommendations.dashboard.forEach((section, idx) => {
    report += `\n${idx + 1}. ${section.section}\n`;
    section.widgets.forEach(widget => {
      report += `   • [${widget.type}] ${widget.title}\n`;
    });
  });
  
  report += '\n🧭 Navigation Recommandée:\n';
  analysis.recommendations.navigation.forEach(item => {
    report += `   ${item.icon} ${item.label.padEnd(25)} → ${item.path}\n`;
  });
  
  report += '\n📊 Indicateurs Clés à Afficher:\n';
  analysis.recommendations.keyMetrics.forEach((metric, idx) => {
    report += `   ${String(idx + 1).padStart(2, '0')}. ${metric}\n`;
  });

  report += '\n╔════════════════════════════════════════════════════════════════╗\n';
  report += '║  ✅ Analyse terminée - Dashboard recommandé pour pilotage QSE  ║\n';
  report += '╚════════════════════════════════════════════════════════════════╝\n';

  return report;
}

// ========================
// POINT D'ENTRÉE
// ========================
function main() {
  console.log('🚀 Démarrage de l\'analyse du projet Qualisoft\n');
  console.log(`Dossier courant: ${PROJECT_ROOT}\n`);

  // Vérifications préalables
  console.log('📁 Vérification des dossiers:');
  console.log(`   Backend: ${fs.existsSync(BACKEND_SRC) ? '✅ trouvé' : '❌ introuvable'}`);
  console.log(`   Frontend: ${fs.existsSync(FRONTEND_APP) ? '✅ trouvé' : '❌ introuvable'}\n`);

  // Exécution de l'analyse
  analyzeBackend();
  analyzeFrontend();
  generateRecommendations();

  // Affichage du rapport
  const report = generateReport();
  console.log('\n' + report);

  // Sauvegarde du rapport
  const reportPath = path.join(PROJECT_ROOT, 'PROJECT_ANALYSIS.txt');
  fs.writeFileSync(reportPath, report);
  console.log(`📄 Rapport sauvegardé: ${reportPath}\n`);

  // Export JSON
  const jsonPath = path.join(PROJECT_ROOT, 'project-analysis.json');
  fs.writeFileSync(jsonPath, JSON.stringify(analysis, null, 2));
  console.log(`📄 Données JSON exportées: ${jsonPath}\n`);
}

// Exécution
try {
  main();
} catch (error) {
  console.error('❌ Erreur fatale:', error.message);
  process.exit(1);
}
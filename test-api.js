const axios = require('axios');

// CONFIGURATION
const API_URL = 'http://localhost:9000/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVX0lkIjoiOWU4MDg4YjEtNGNiNC00Y2RmLTg0MzUtMmVhMDAzOTEzZWZhIiwiVV9FbWFpbCI6ImFiLnRoaW9uZ2FuZUBxdWFsaXNvZnQuc24iLCJ0ZW5hbnRJZCI6IlFTLTIwMjYtSkFOViIsIlVfUm9sZSI6IlNVUEVSX0FETUlOIiwiaWF0IjoxNzY5NDg1MDA2LCJleHAiOjE3NzIwNzcwMDZ9.ycaGSYeLZYR_wbttdZGfV8dyB1cEGmEPoWiRSPguZcM'; // Colle ici ton JWT sans le mot "Bearer"

const client = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
});

const routes = [
  { name: 'IDENTITÉ TENANT', method: 'get', url: '/admin/tenant/me' },
  { name: 'CHRONOGRAMME GLOBAL', method: 'get', url: '/gouvernance/planning' },
  { name: 'VEILLE RÉGLEMENTAIRE', method: 'get', url: '/gouvernance/planning?type=VEILLE_REGLEMENTAIRE' },
  { name: 'PERFORMANCE GOUVERNANCE', method: 'get', url: '/gouvernance/performance' },
  { name: 'LISTE DES PROCESSUS', method: 'get', url: '/processus' },
  { name: 'MASTER DATA (ADMIN)', method: 'get', url: '/admin/master-data' },
];

async function runDiagnostics() {
  console.log('🚀 DÉMARRAGE DU DIAGNOSTIC QUALISOFT ELITE...\n');

  for (const route of routes) {
    try {
      const start = Date.now();
      const response = await client[route.method](route.url);
      const duration = Date.now() - start;

      console.log(`✅ [${route.name}]`);
      console.log(`   URL: ${API_URL}${route.url}`);
      console.log(`   Statut: ${response.status} OK (${duration}ms)`);
      console.log(`   Données: ${Array.isArray(response.data) ? response.data.length + ' éléments' : 'Objet reçu'}\n`);
    } catch (error) {
      console.log(`❌ [${route.name}] ÉCHEC`);
      console.log(`   URL: ${API_URL}${route.url}`);
      if (error.response) {
        console.log(`   Erreur: ${error.response.status} - ${error.response.data.message || 'Non trouvé'}`);
      } else {
        console.log(`   Erreur: ${error.message}`);
      }
      console.log('');
    }
  }
  console.log('🏁 DIAGNOSTIC TERMINÉ.');
}

runDiagnostics();
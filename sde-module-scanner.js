/**
 * 🛰️ QUALISOFT SDE - MOTEUR D'AUDIT ARCHITECTURAL (V2 - RADAR ABSOLU)
 * -------------------------------------------------------------------------
 * Rôle : Scanner, classifier et documenter l'intégralité des modules de l'application.
 * Exécution : node sde-module-scanner.js
 * -------------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

// --- ⚙️ CONFIGURATION DU KERNEL ---
const CONFIG = {
    targetDir: '.', // Démarre le scan depuis la racine absolue du terminal
    outputFile: './sde-architecture-report.md',
    // On ignore les dossiers compilés/lourds pour que le scan soit instantané
    ignoreDirs: ['node_modules', '.git', '.next', 'dist', 'build', 'public', 'assets'],
    ignoreFiles: ['layout.tsx', 'globals.css'], 
    families: {
        'quality': { id: 'QUALITY', label: '🛡️ QUALITÉ & AMÉLIORATION CONTINUE (ISO 9001 §9, §10)' },
        'rh': { id: 'RH', label: '🎓 RESSOURCES HUMAINES & GPEC (ISO 9001 §7.2)' },
        'compliance': { id: 'COMPLIANCE', label: '⚖️ CONFORMITÉ & VEILLE LÉGALE (ISO §6.1.3)' },
        'senegal-legal': { id: 'COMPLIANCE', label: '⚖️ CONFORMITÉ & VEILLE LÉGALE (ISO §6.1.3)' },
        'requirements': { id: 'COMPLIANCE', label: '⚖️ CONFORMITÉ & VEILLE LÉGALE (ISO §6.1.3)' },
        'direction': { id: 'DIRECTION', label: '🏛️ STRATÉGIE & REVUE DE DIRECTION (ISO 9001 §5, §9.3)' },
        'core': { id: 'CORE', label: '⚙️ NOYAU SDE & INFRASTRUCTURE' },
        'types': { id: 'CORE', label: '⚙️ TYPES & INTERFACES SDE' },
        'components': { id: 'UI', label: '🎨 COMPOSANTS ATOMIQUES (UI/UX)' }
    }
};

// --- 🧭 MOTEUR RÉCURSIF DE RECHERCHE PROFONDE ---
function walkSync(dir, callback) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Si le dossier n'est pas dans la liste noire, on plonge dedans
            if (!CONFIG.ignoreDirs.includes(file)) {
                walkSync(filePath, callback);
            }
        } else {
            // C'est un fichier, on vérifie si c'est du TS/TSX et s'il ne faut pas l'ignorer
            if ((filePath.endsWith('.tsx') || filePath.endsWith('.ts')) && !CONFIG.ignoreFiles.includes(file)) {
                callback(filePath);
            }
        }
    }
}

// --- 🧠 EXTRACTEUR D'INTELLIGENCE (SCAN LEXICAL) ---
function extractMetadata(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Extraction des 35 premières lignes pour trouver nos cartouches de commentaires SDE
    const headerLines = content.split('\n').slice(0, 35).join('\n');

    // Regex tolérantes (insensibles à la casse, gèrent les espaces multiples)
    const nomMatch = headerLines.match(/\*\s*(?:NOM ABSOLU|MODULE)\s*:\s*(.*)/i);
    const fonctionMatch = headerLines.match(/\*\s*(?:FONCTION|RÔLE)\s*:\s*(.*)/i);
    const isoMatch = headerLines.match(/(ISO\s\d{4,5}[^.\n]*|§\d+\.\d+(?:\.\d+)?)/i);

    return {
        nom: nomMatch ? nomMatch[1].trim() : path.basename(filePath),
        fonction: fonctionMatch ? fonctionMatch[1].trim() : 'Module détecté sans cartouche SDE.',
        iso: isoMatch ? isoMatch[1].trim() : 'Non spécifié',
    };
}

// --- 🗂️ CLASSIFICATEUR DE FAMILLES ---
function determineFamily(filePath) {
    // Normalisation du chemin pour Windows (\ devient /)
    const normalizedPath = filePath.toLowerCase().replace(/\\/g, '/');
    let detectedFamily = '🧩 AUTRES MODULES NON CLASSIFIÉS';

    for (const [key, familyData] of Object.entries(CONFIG.families)) {
        // On cherche le mot clé entouré de slashs (ex: /quality/) ou en nom de fichier
        if (normalizedPath.includes(`/${key}/`) || normalizedPath.includes(`/${key}.`)) {
            detectedFamily = familyData.label;
            break;
        }
    }
    return detectedFamily;
}

// --- 🚀 ORCHESTRATEUR PRINCIPAL ---
function generateArchitectureReport() {
    console.log('\n======================================================');
    console.log('🛰️ SDE MATRIX - INITIALISATION DU SCAN D\'ARCHITECTURE...');
    console.log('======================================================\n');

    const modules = [];

    try {
        walkSync(CONFIG.targetDir, (filePath) => {
            const family = determineFamily(filePath);
            const metadata = extractMetadata(filePath);

            modules.push({
                // On s'assure que le rendu soit propre en console, même sous Windows
                path: filePath.replace(/\\/g, '/'),
                family: family,
                ...metadata
            });
        });
    } catch (error) {
        console.error("❌ ERREUR CRITIQUE PENDANT LE SCAN :", error.message);
        return;
    }

    if (modules.length === 0) {
        console.log("❌ ERREUR : Aucun fichier .ts ou .tsx trouvé depuis la racine.");
        return;
    }

    // Regroupement par famille SDE
    const groupedModules = modules.reduce((acc, mod) => {
        if (!acc[mod.family]) acc[mod.family] = [];
        acc[mod.family].push(mod);
        return acc;
    }, {});

    // Génération du document Markdown
    let markdown = `# 🛰️ SDE MATRIX - CARTOGRAPHIE DES MODULES\n`;
    markdown += `*Généré automatiquement le : ${new Date().toLocaleString('fr-FR')}*\n\n`;
    markdown += `Ce document recense l'architecture de la plateforme, classée par piliers normatifs.\n\n`;

    for (const [family, mods] of Object.entries(groupedModules)) {
        markdown += `## ${family}\n\n`;
        markdown += `| Module / Chemin Absolu | Fonction SDE / Rôle | Norme Associée |\n`;
        markdown += `| :--- | :--- | :--- |\n`;
        
        console.log(`\n${family}`);
        console.log('------------------------------------------------------');

        mods.sort((a, b) => a.path.localeCompare(b.path)).forEach(mod => {
            markdown += `| **${mod.nom}**<br>\`${mod.path}\` | ${mod.fonction} | *${mod.iso}* |\n`;
            console.log(`  ➤ ${mod.path}`);
            console.log(`    ↳ ${mod.fonction}`);
        });
        markdown += `\n`;
    }

    // Écriture du fichier de sortie
    fs.writeFileSync(CONFIG.outputFile, markdown, 'utf-8');

    console.log('\n======================================================');
    console.log(`✅ SCAN TERMINÉ : ${modules.length} modules (.ts/.tsx) détectés et cartographiés.`);
    console.log(`📄 RAPPORT MARKDOWN GÉNÉRÉ : ${path.resolve(CONFIG.outputFile)}`);
    console.log('======================================================\n');
}

// Exécution
generateArchitectureReport();
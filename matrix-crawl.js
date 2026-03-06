const fs = require('fs');
const path = require('path');

/**
 * 🛰️ MATRIX CRAWLER v3.0 (SPECIAL CLUSTER FRONTEND)
 * ---------------------------------------------------------------------------
 * RÔLE : Audit des routes et extraction des métadonnées ISO.
 * CIBLE : ./frontend/src/app ou ./frontend/app
 * ---------------------------------------------------------------------------
 * RÉVISION : 06 Mars 2026 | 00:35 GMT
 */

function findAppDir(currentDir) {
    const candidates = [
        path.join(currentDir, 'frontend', 'src', 'app'),
        path.join(currentDir, 'frontend', 'app'),
        path.join(currentDir, 'src', 'app'),
        path.join(currentDir, 'app')
    ];

    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    return null;
}

function analyzePage(filePath, route) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extraction des en-têtes Elite-SDE
    const moduleMatch = content.match(/MODULE\s*[:\-]\s*([^\n*]*)/i);
    const roleMatch = content.match(/RÔLE\s*[:\-]\s*([^\n*]*)/i);
    const functionMatch = content.match(/FONCTION\s*[:\-]\s*([^\n*]*)/i);

    console.log(`\x1b[36m[ROUTE]\x1b[0m ${route.replace(/\\/g, '/') || '/'}`);
    console.log(`   \x1b[90mFichier:\x1b[0m ${path.relative(process.cwd(), filePath)}`);
    
    if (moduleMatch) console.log(`   \x1b[32mModule:\x1b[0m ${moduleMatch[1].trim()}`);
    if (roleMatch) console.log(`   \x1b[35mRôle:\x1b[0m ${roleMatch[1].trim()}`);
    if (functionMatch) console.log(`   \x1b[34mFonction:\x1b[0m ${functionMatch[1].trim()}`);
    
    // Détection auto des clauses ISO basées sur le texte
    const isoMatch = content.match(/ISO\s*\d+/gi);
    if (isoMatch) console.log(`   \x1b[33mConformité:\x1b[0m ${[...new Set(isoMatch)].join(', ')}`);
    
    console.log('   --------------------------------------------------');
}

function crawl(dir, route = '') {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Nettoyage des segments Next.js (parenthèses et crochets)
            const cleanSegment = file.startsWith('(') && file.endsWith(')') ? '' : file;
            const nextRoute = path.join(route, cleanSegment);
            crawl(fullPath, nextRoute);
        } else if (file.startsWith('page.')) {
            analyzePage(fullPath, route);
        }
    });
}

const root = process.cwd();
const appPath = findAppDir(root);

console.log("\x1b[1m\x1b[44m SDE MATRIX : AUDIT GLOBAL DU CLUSTER \x1b[0m");
console.log(`\x1b[90mRoot: ${root}\x1b[0m\n`);

if (appPath) {
    console.log(`\x1b[32m✔ Noyau détecté : ${path.relative(root, appPath)}\x1b[0m\n`);
    crawl(appPath);
    console.log(`\n\x1b[1m\x1b[32m[AUDIT TERMINÉ]\x1b[0m Utilisez ces routes pour sceller votre Sidebar.`);
} else {
    console.log("\x1b[31m✖ ERREUR : Structure introuvable.\x1b[0m");
    console.log("Vérifiez la présence du dossier 'app' dans 'frontend/src/'.");
}
// /backend/scripts/scan-modules.js

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function findFiles(dir, pattern) {
    const results = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && item !== 'node_modules' && item !== 'dist') {
            results.push(...findFiles(fullPath, pattern));
        } else if (pattern.test(item) && item !== 'app.module.ts') {
            results.push(fullPath);
        }
    }
    return results;
}

function extractClassName(content) {
    const match = content.match(/export\s+class\s+(\w+Module)\s+/);
    return match ? match[1] : null;
}

console.log('\n🔍 Scan des modules NestJS...\n');
console.log('// Copiez ces lignes dans app.module.ts :\n');

const moduleFiles = findFiles(srcDir, /\.module\.ts$/);
const imports = [];

for (const file of moduleFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const className = extractClassName(content);
    
    if (className) {
        const relativePath = path.relative(path.join(srcDir, 'app.module.ts'), file)
            .replace(/\.ts$/, '')
            .replace(/\\/g, '/') // Windows fix
            .replace(/^\.\.\//, './');
        
        // Correction du chemin pour app.module.ts
        const importPath = relativePath.startsWith('.') 
            ? relativePath 
            : './' + relativePath;
            
        imports.push({ className, importPath: importPath.replace('./../', '../') });
    }
}

// Afficher les imports
imports.sort((a, b) => a.className.localeCompare(b.className));
imports.forEach(m => {
    console.log(`import { ${m.className} } from '${m.importPath}';`);
});

console.log('\n// Et ajoutez dans le tableau imports: []\n');
console.log('imports: [');
imports.forEach((m, i) => {
    console.log(`  ${m.className}${i < imports.length - 1 ? ',' : ''}`);
});
console.log(']');

console.log(`\n✅ ${imports.length} module(s) trouvé(s)`);
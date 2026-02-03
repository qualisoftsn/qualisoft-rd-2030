# 🚀 QUALISOFT RD 2030 : MANIFESTE ET ARCHITECTURE DU NOYAU

## 1. VISION ET PHILOSOPHIE "ELITE MS"

**Qualisoft** est un écosystème SaaS de **SMI (Système de Management Intégré)** conçu pour transformer la contrainte normative en puissance digitale.

* **L'Esprit :** Une interface "Cockpit" où chaque pixel transpire la précision et la performance.
* **La Lettre :** Conformité absolue aux normes **ISO 9001, 14001 et 45001**.
* **La Garantie :** Zéro régression. Chaque bug rencontré (comme les IDs `undefined` ou les arguments Prisma manquants) a donné lieu à une fortification du code.

---

## 2. UI/UX CHARTER (ÉLECTRONIQUE & VIBRANT)

Le design n'est pas négociable. Il doit être **Elite, Sombre et Radical**.

* **Style :** `font-black`, `uppercase`, `italic`.
* **Palette :** Fond `#0B0F1A`, Bleu Royal (Sécurité), Orange Vibrant (Alertes/Incidents), Vert Émeraude (Environnement).
* **Composants :** Formes organiques complexes (`rounded-[4rem]`), Glassmorphism, et Toasts de notification (`react-hot-toast`) pour chaque micro-interaction.

---

## 3. SÉCURITÉ ET AUTHENTIFICATION (LE VERROU)

Le système repose sur un triptyque de fer : **Bcryptjs, JWT et Token de session**.

### 🔒 Cryptographie & Accès

* **Bcryptjs :** Hachage des mots de passe avec un sel de 10 rounds. Aucun mot de passe n'existe en clair, même pour l'administrateur.
* **JWT (JSON Web Token) :** Chaque requête est signée. Le token contient le `U_Id`, le `tenantId` et le `role`.
* **Sécurité des Routes :** Utilisation systématique du `JwtAuthGuard`. Aucune route n'est ouverte sans validation du porteur du token.

### 🛡️ Le "Compte Éternel" (Master Seed)

Pour garantir la résilience du système, le fichier `seed.ts` contient le **Compte Éternel** :

* **Tenant Maître :** Un tenant racine qui ne peut être supprimé.
* **Utilisateur Racine :** Un compte Super-Admin capable de restaurer les accès et de superviser l'infrastructure globale.
* **Données de Base :** Injection automatique des typologies d'incidents, des processus standards (SMI, RH, Production) et des rôles.

---

## 4. LOGIQUE MULTI-TENANT (ISOLATION ABSOLUE)

C'est le cœur du réacteur. Qualisoft est une plateforme **SaaS multi-locataire**.

* **Isolation des données :** Chaque table (Utilisateurs, Causeries, Incidents, Réclamations) possède une colonne `tenantId`.
* **Le Filtre de Fer :** Chaque appel Prisma dans les services *doit* inclure `where: { tenantId }`.
* **Sécurité au Niveau Requête :** Le `tenantId` est extrait directement du JWT par le `Req()`. L'utilisateur ne peut jamais injecter un `tenantId` manuellement dans le corps d'une requête pour voir les données d'un concurrent.

---

## 5. ARCHITECTURE TECHNIQUE & PRISMA

### 🛠️ Le Noyau (Backend)

* **NestJS :** Modularité totale. Chaque module (Causeries, SSE, Reclamations) est indépendant mais partage le `PrismaService`.
* **DTOs (Data Transfer Objects) :** Validation stricte via `class-validator`. Si un champ obligatoire manque (comme le `CS_AnimateurId`), la requête est rejetée par NestJS avant même d'atteindre Prisma (400 Bad Request).

### 📊 Prisma & Database

* **Scalaires vs Relations :** Utilisation des IDs directs (`CS_AnimateurId`) pour la rapidité, et des relations `connect` pour l'intégrité Many-to-Many (Participants).
* **Suppression Logique :** On ne supprime rien. On utilise `CS_IsActive: false` pour conserver la traçabilité historique exigée par l'ISO.

---

## 6. LOGIQUE MÉTIER SPÉCIFIQUE (REVENUE & FIXÉE)

| Module | Fonctionnalité Clé | Option Retenue |
| --- | --- | --- |
| **Causeries** | Sensibilisation §7.3 | Émargement par QR Code (Token SHA-256) |
| **SSE** | Registre Incidents | Calcul automatique IF/IG et Taux de Recyclage |
| **Réclamations** | Satisfaction Client | Liaison automatique au PAQ (Plan d'Action Qualité) |
| **GPEC** | Habilitations | Alertes automatiques de recyclage sur expiration |

---

## 7. PROTOCOLE ANTI-RÉGRESSION

Après les difficultés rencontrées sur la liaison des IDs, nous avons arrêté les règles suivantes :

1. **Typage Strict :** On utilise toujours `U_Id` pour les utilisateurs (et non `userId` ou `id`).
2. **Mapping Automatique :** Le Front-end envoie systématiquement les dates au format ISO et les textes en `UPPERCASE` pour les thèmes.
3. **Logs de Debug :** Chaque crash Prisma est intercepté et logué avec le modèle exact et le tenant concerné pour une intervention en moins de 5 minutes.

---

> **L'Esprit Qualisoft :** "La technologie doit être invisible, la preuve doit être absolue, l'interface doit être une expérience."

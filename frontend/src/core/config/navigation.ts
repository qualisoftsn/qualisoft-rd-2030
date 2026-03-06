/**
 * 🛰️ REGISTRE SOUVERAIN DES MODULES (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Indexation exhaustive des modules par famille opérationnelle.
 * ALIGNEMENT : ISO 9001, 14001, 27001, 45001 (Annex SL).
 * ARCHITECTURE : High-Density Navigation Map.
 * ---------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 23:55 GMT
 */

export const MASTER_NAVIGATION = [
  {
    id: "gouvernance",
    label: "I. Leadership & Stratégie",
    iso: "§5 (9001, 14001, 45001)",
    items: [
      { id: "dashboard", path: "/dashboard", label: "Cockpit Exécutif", icon: "LayoutDashboard", desc: "Pilotage temps réel" },
      { id: "revue", path: "/dashboard/revue-direction", label: "Revue de Direction", icon: "FileSearch", desc: "Arbitrage §9.3" },
      { id: "objectifs", path: "/dashboard/objectifs", label: "Objectifs & Cibles", icon: "Target", desc: "Planification §6.2" },
      { id: "enjeux", path: "/dashboard/enjeux", label: "Analyse SWOT/PESTEL", icon: "Globe", desc: "Contexte §4.1" }
    ]
  },
  {
    id: "risques",
    label: "II. Maîtrise des Risques",
    iso: "§6.1 (Toutes Normes)",
    items: [
      { id: "risks-q", path: "/dashboard/risks/qualite", label: "Risques & Opportunités", icon: "AlertTriangle", desc: "Q-SMI §6.1.1" },
      { id: "risks-env", path: "/dashboard/risks/environnement", label: "Aspects Environnementaux", icon: "Leaf", desc: "E-SMI §6.1.2" },
      { id: "risks-sst", path: "/dashboard/risks/sst", label: "Risques Professionnels", icon: "HardHat", desc: "S-SMI §6.1.2.1" },
      { id: "is-ms", path: "/dashboard/risks/cyber", label: "Sécurité Information", icon: "ShieldAlert", desc: "ISO 27001 A.5" }
    ]
  },
  {
    id: "ressources",
    label: "III. Support & Compétences",
    iso: "§7 (9001)",
    items: [
      { id: "users", path: "/dashboard/users", label: "Habilitations Agents", icon: "Users", desc: "Compétences §7.2" },
      { id: "tiers", path: "/dashboard/tiers", label: "Registre des Tiers", icon: "Building", desc: "Parties Intéressées §4.2" },
      { id: "metrologie", path: "/dashboard/metrologie", label: "Parc Équipements", icon: "Microscope", desc: "Traçabilité §7.1.5" },
      { id: "formation", path: "/dashboard/formations", icon: "GraduationCap", label: "Plan de Formation", desc: "Sensibilisation §7.3" }
    ]
  },
  {
    id: "documents",
    label: "IV. Information Documentée",
    iso: "§7.5 (Toutes Normes)",
    items: [
      { id: "ged", path: "/dashboard/ged", label: "GED Bibliothèque", icon: "FolderLock", desc: "Maîtrise §7.5.3" },
      { id: "workflows", path: "/dashboard/workflows", label: "Flux d'Approbation", icon: "GitBranch", desc: "Circuit de validation" },
      { id: "archives", path: "/dashboard/archives", label: "Archives Légales", icon: "Archive", desc: "Conservation scellée" }
    ]
  },
  {
    id: "operationnel",
    label: "V. Maîtrise Opérationnelle",
    iso: "§8 (Production)",
    items: [
      { id: "processus", path: "/dashboard/processus", label: "Cartographie Processus", icon: "Network", desc: "Approche processus §4.4" },
      { id: "purchasing", path: "/dashboard/achats", label: "Maîtrise Prestataires", icon: "ShoppingCart", desc: "Externalisation §8.4" },
      { id: "sse", path: "/dashboard/sse", label: "Monitoring HSEQ", icon: "ShieldCheck", desc: "Opérations §8.1" }
    ]
  },
  {
    id: "amelioration",
    label: "VI. Évaluation & Performance",
    iso: "§9 & §10 (Amélioration)",
    items: [
      { id: "audit", path: "/dashboard/audit-center", label: "Centre d'Audit", icon: "ClipboardCheck", desc: "Audit Interne §9.2" },
      { id: "nc", path: "/dashboard/non-conformites", label: "Non-Conformités", icon: "Zap", desc: "Correction §10.2" },
      { id: "actions", path: "/dashboard/actions", label: "Actions Correctives", icon: "Activity", desc: "CAPA Management" },
      { id: "satisfaction", path: "/dashboard/satisfaction", label: "Satisfaction Clients", icon: "MessageSquare", desc: "Surveillance §9.1.2" }
    ]
  },
  {
    id: "admin",
    label: "VII. Kernel Matrix",
    iso: "Système Souverain",
    items: [
      { id: "matrix", path: "/admin/matrix", label: "Cockpit Nœuds", icon: "Fingerprint", desc: "Administration Multi-Tenant" },
      { id: "security", path: "/admin/security", label: "Global Security", icon: "Terminal", desc: "Monitoring Kernel" },
      { id: "billing", path: "/admin/billing", label: "Flux Financiers", icon: "CreditCard", desc: "Monétisation" }
    ]
  }
];
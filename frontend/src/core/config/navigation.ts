/**
 * 🛰️ REGISTRE SOUVERAIN DES ROUTES (v9.5)
 * ALIGNEMENT : ISO Annex SL (High-Level Structure)
 * ---------------------------------------------------------------------------
 */
export const MASTER_NAV = [
  {
    id: "strategie",
    label: "I. Leadership & Stratégie",
    iso: "§4, §5 & §6.2",
    items: [
      { title: "Cockpit Global SMI", path: "/dashboard/smi-global", icon: "LayoutDashboard", desc: "Performance consolidée §9.1" },
      { title: "Revue de Direction", path: "/dashboard/gouvernance/copil", icon: "FileSearch", desc: "Arbitrage stratégique §9.3" },
      { title: "ROI de Conformité", path: "/dashboard/analytics/roi", icon: "TrendingUp", desc: "Rentabilité du SMI §9.1.3" }, 
      { title: "Objectifs & Cibles", path: "/dashboard/objectifs", icon: "Target", desc: "Planification §6.2" },
      { title: "Veille Réglementaire", path: "/dashboard/gouvernance/compliance", icon: "ShieldCheck", desc: "Exigences légales §6.1.3" }
    ]
  },
  {
    id: "documents",
    label: "II. Maîtrise Documentaire",
    iso: "§7.5",
    items: [
      { title: "GED Bibliothèque", path: "/dashboard/ged", icon: "FolderLock", desc: "Information documentée §7.5.3" },
      { title: "Flux & Workflows", path: "/dashboard/workflows", icon: "GitBranch", desc: "Circuit de validation BPMN" },
      { title: "Chambre Forte", path: "/dashboard/archives", icon: "Archive", desc: "Archives immuables" }
    ]
  },
  {
    id: "performance",
    label: "III. Performance Processus",
    iso: "§4.4 & §8",
    items: [
      { title: "Cartographie Master", path: "/dashboard/processus", icon: "Network", desc: "Approche processus §4.4" },
      { title: "Analyse des Risques", path: "/dashboard/risks", icon: "AlertTriangle", desc: "Menaces & Opportunités §6.1" },
      { title: "Registre des Tiers", path: "/dashboard/tiers", icon: "Users", desc: "Parties intéressées §4.2" },
      { title: "Sites & Implantations", path: "/dashboard/sites", icon: "Database", desc: "Périmètre du SMI §4.3" }
    ]
  },
  {
    id: "amelioration",
    label: "IV. Audit & Amélioration",
    iso: "§9 & §10",
    items: [
      { title: "Audit Center", path: "/dashboard/audit-center", icon: "ClipboardCheck", desc: "Audits internes §9.2" },
      { title: "Non-Conformités", path: "/dashboard/non-conformites", icon: "Zap", desc: "Traitement des écarts §10.2" },
      { title: "CAPA / Amélioration", path: "/dashboard/improvement", icon: "Activity", desc: "Cycle PDCA complet §10.3" },
      { title: "Plans d'Actions (PAQ)", path: "/dashboard/paq", icon: "Microscope", desc: "Suivi des programmes" }
    ]
  },
  {
    id: "hseq",
    label: "V. HSEQ (Santé & Env.)",
    iso: "ISO 45001 / 14001",
    items: [
      { title: "Hub SSE Global", path: "/dashboard/sse", icon: "HardHat", desc: "Sécurité au travail §8.1" },
      { title: "Performance Env.", path: "/dashboard/environment", icon: "Leaf", desc: "Impacts & Déchets §8.1.3" },
      { title: "Causeries & Formations", path: "/dashboard/sse/causeries", icon: "GraduationCap", desc: "Sensibilisation §7.3" }
    ]
  },
  {
    id: "support",
    label: "VI. RH & Support",
    iso: "§7.1 & §7.2",
    items: [
      { title: "Hub RH & Talents", path: "/dashboard/rh", icon: "Fingerprint", desc: "Compétences §7.2" },
      { title: "Registre des Agents", path: "/dashboard/users", icon: "Users", desc: "Habilitations SMI" },
      { title: "Parc Équipements", path: "/dashboard/equipment", icon: "Settings", desc: "Infrastructures §7.1.3" }
    ]
  },
  {
    id: "matrix",
    label: "VII. Administration Matrix",
    iso: "Kernel Sovereign",
    items: [
      { title: "Matrix Cockpit", path: "/dashboard/matrix", icon: "Cpu", desc: "Surveillance multi-tenant" },
      { title: "SMI Structure", path: "/dashboard/settings/structure", icon: "Layers", desc: "Configuration Kernel" },
      { title: "Logs & Sécurité", path: "/dashboard/matrix/logs", icon: "Terminal", desc: "Audit trail système" }
    ]
  }
];
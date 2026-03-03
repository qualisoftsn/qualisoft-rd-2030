/**
 * 🛰️ MODULE : elite-sde.ts
 * -------------------------------------------------------------------------
 * RÔLE : Référentiel intégral des types et énumérations du Noyau Matrix.
 * RÉVISION : 03 Mars 2026 | 02:31 GMT
 * -------------------------------------------------------------------------
 * NOTE : Ce fichier est le miroir typé du schéma Prisma. 
 * Sécurisation stricte des flux de données SDE.
 */

// --- TYPES DE BASE SCELLÉS ---

export type JsonValue = 
  | string 
  | number 
  | boolean 
  | { [key: string]: JsonValue } 
  | JsonValue[] 
  | null;

// ==========================================
// 1. ÉNUMÉRATIONS SYSTÈME (LOGIQUE MÉTIER)
// ==========================================

export enum Plan {
  ESSAI = "ESSAI",
  EMERGENCE = "EMERGENCE",
  CROISSANCE = "CROISSANCE",
  ENTREPRISE = "ENTREPRISE",
  GROUPE = "GROUPE"
}

export enum SubscriptionStatus {
  TRIAL = "TRIAL",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  EXPIRED = "EXPIRED",
  PENDING = "PENDING"
}

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN", // Master Architect
  ADMIN = "ADMIN",             // Gestionnaire de Tenant
  USER = "USER",              // Utilisateur standard
  PILOTE = "PILOTE",          // Responsable de processus
  COPILOTE = "COPILOTE",
  AUDITEUR = "AUDITEUR",
  HSE = "HSE",
  SAFETY_OFFICER = "SAFETY_OFFICER",
  RQ = "RQ",
  DIRECTION = "DIRECTION",
  OBSERVATEUR = "OBSERVATEUR",
  MANAGER = "MANAGER"
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
  CRITICAL = "CRITICAL"
}

// --- FLUX QSE / HSE ---
export enum ContextType { ENJEU_INTERNE = "ENJEU_INTERNE", ENJEU_EXTERNE = "ENJEU_EXTERNE", PARTIE_INTERESSEE = "PARTIE_INTERESSEE", REGLEMENTAIRE = "REGLEMENTAIRE" }
export enum PartyType { CLIENT = "CLIENT", AUTORITE = "AUTORITE", ACTIONNAIRE = "ACTIONNAIRE", EMPLOYE = "EMPLOYE", FOURNISSEUR = "FOURNISSEUR", CONCURRENT = "CONCURRENT", COLLECTIVITE = "COLLECTIVITE", ONG = "ONG" }
export enum ObjectiveStatus { BROUILLON = "BROUILLON", EN_COURS = "EN_COURS", ATTEINT = "ATTEINT", NON_ATTEINT = "NON_ATTEINT", REPORTE = "REPORTE", ANNULE = "ANNULE" }
export enum PAQStatus { BROUILLON = "BROUILLON", EN_COURS = "EN_COURS", CLOTURE = "CLOTURE", ARCHIVE = "ARCHIVE" }
export enum DocStatus { BROUILLON = "BROUILLON", EN_REVUE = "EN_REVUE", APPROUVE = "APPROUVE", REJETE = "REJETE", ARCHIVE = "ARCHIVE", OBSOLETE = "OBSOLETE" }
export enum NotificationType { INFO = "INFO", WARNING = "WARNING", SUCCESS = "SUCCESS", DANGER = "DANGER", SSE_ALERT = "SSE_ALERT", DEADLINE_ALERT = "DEADLINE_ALERT" }
export enum HabStatus { ACTIVE = "ACTIVE", EXPIRED = "EXPIRED", REVOKED = "REVOKED", PENDING = "PENDING" }
export enum DocCategory { PROCEDURE = "PROCEDURE", MANUEL = "MANUEL", ENREGISTREMENT = "ENREGISTREMENT", CONSIGNE = "CONSIGNE", RAPPORT = "RAPPORT", FORMULAIRE = "FORMULAIRE", AUTRE = "AUTRE" }
export enum AuditType { INTERNE = "INTERNE", EXTERNE = "EXTERNE", CERTIFICATION = "CERTIFICATION", SURVEILLANCE = "SURVEILLANCE", TIERCE_PARTIE = "TIERCE_PARTIE" }
export enum AuditStatus { PLANIFIE = "PLANIFIE", EN_COURS = "EN_COURS", TERMINE = "TERMINE", ANNULE = "ANNULE" }
export enum FindingType { POINT_FORT = "POINT_FORT", CONFORMITE = "CONFORMITE", OBSERVATION = "OBSERVATION", NC_MINEURE = "NC_MINEURE", NC_MAJEURE = "NC_MAJEURE" }
export enum NCGravity { MINEURE = "MINEURE", MAJEURE = "MAJEURE", CRITIQUE = "CRITIQUE" }
export enum NCStatus { DETECTION = "DETECTION", ANALYSE = "ANALYSE", ACTION_EN_COURS = "ACTION_EN_COURS", VERIFICATION = "VERIFICATION", CLOTURE = "CLOTURE", EN_COURS = "EN_COURS" }
export enum NCSource { INTERNAL_AUDIT = "INTERNAL_AUDIT", EXTERNAL_AUDIT = "EXTERNAL_AUDIT", CLIENT_COMPLAINT = "CLIENT_COMPLAINT", SUPPLIER = "SUPPLIER", INCIDENT_SAFETY = "INCIDENT_SAFETY", PROCESS_REVIEW = "PROCESS_REVIEW", MANAGEMENT_REVIEW = "MANAGEMENT_REVIEW" }
export enum ActionStatus { A_FAIRE = "A_FAIRE", EN_COURS = "EN_COURS", A_VALIDER = "A_VALIDER", TERMINEE = "TERMINEE", NON_EFFICACE = "NON_EFFICACE", ANNULEE = "ANNULEE", EN_RETARD = "EN_RETARD" }
export enum ActionType { CORRECTIVE = "CORRECTIVE", PREVENTIVE = "PREVENTIVE", AMELIORATION = "AMELIORATION" }
export enum ActionOrigin { AUDIT = "AUDIT", NON_CONFORMITE = "NON_CONFORMITE", RECLAMATION = "RECLAMATION", REVUE_DIRECTION = "REVUE_DIRECTION", COPIL = "COPIL", RISQUE = "RISQUE", SSE = "SSE", OBJECTIF = "OBJECTIF", LEGAL = "LEGAL", ALERTE = "ALERTE", AUTRE = "AUTRE" }
export enum TicketStatus { OPEN = "OPEN", IN_PROGRESS = "IN_PROGRESS", RESOLVED = "RESOLVED", CLOSED = "CLOSED", ARCHIVED = "ARCHIVED" }
export enum ReclamationStatus { NOUVELLE = "NOUVELLE", EN_ANALYSE = "EN_ANALYSE", ACTION_EN_COURS = "ACTION_EN_COURS", TRAITEE = "TRAITEE", REJETEE = "REJETEE" }
export enum SSEType { ACCIDENT_TRAVAIL = "ACCIDENT_TRAVAIL", ACCIDENT_TRAVAIL_TRAJET = "ACCIDENT_TRAVAIL_TRAJET", DOMMAGE_MATERIEL = "DOMMAGE_MATERIEL", PRESQU_ACCIDENT = "PRESQU_ACCIDENT", SITUATION_DANGEREUSE = "SITUATION_DANGEREUSE", MALADIE_PRO = "MALADIE_PRO", INCIDENT_ENVIRONNEMENTAL = "INCIDENT_ENVIRONNEMENTAL" }
export enum MeetingStatus { PLANIFIE = "PLANIFIE", EN_COURS = "EN_COURS", TERMINE = "TERMINE", ANNULE = "ANNULE" }
export enum IVStatus { BROUILLON = "BROUILLON", SOUMIS = "SOUMIS", VALIDE = "VALIDE", RENVOYE = "RENVOYE" }
export enum ReviewStatus { BROUILLON = "BROUILLON", EN_COURS = "EN_COURS", VALIDEE = "VALIDEE", CLOTUREE = "CLOTUREE" }
export enum RiskStatus { IDENTIFIE = "IDENTIFIE", EVALUE = "EVALUE", TRAITE = "TRAITE", ACCEPTE = "ACCEPTE", SURVEILLE = "SURVEILLE", CRITIQUE = "CRITIQUE", ANNULE = "ANNULE" }
export enum TierType { CLIENT = "CLIENT", FOURNISSEUR = "FOURNISSEUR", PARTENAIRE = "PARTENAIRE", ETAT = "ETAT", SOUS_TRAITANT = "SOUS_TRAITANT" }
export enum TransactionStatus { EN_COURS = "EN_COURS", COMPLETE = "COMPLETE", ECHOUEE = "ECHOUEE", A_REFAIRE = "A_REFAIRE" }
export enum PaymentMethod { WAVE = "WAVE", ORANGE_MONEY = "ORANGE_MONEY", CREDIT_CARD = "CREDIT_CARD", BANK_TRANSFER = "BANK_TRANSFER", ESSAI = "ESSAI" }
export enum GovernanceType { COPIL = "COPIL", REVUE_DIRECTION = "REVUE_DIRECTION", REVUE_PROCESSUS = "REVUE_PROCESSUS", AUDIT_INTERNE = "AUDIT_INTERNE", AUDIT_EXTERNE = "AUDIT_EXTERNE", VEILLE_REGLEMENTAIRE = "VEILLE_REGLEMENTAIRE", SEANCE_PROCESSUS = "SEANCE_PROCESSUS" }
export enum ActivityStatus { PLANNED = "PLANNED", IN_PROGRESS = "IN_PROGRESS", DONE = "DONE", POSTPONED = "POSTPONED", CANCELLED = "CANCELLED" }
export enum WorkflowStatus { EN_ATTENTE = "EN_ATTENTE", APPROUVE = "APPROUVE", REJETE = "REJETE", ANNULE = "ANNULE" }
export enum ChangeAction { CREATE = "CREATE", UPDATE = "UPDATE", DELETE = "DELETE", RESTORE = "RESTORE" }
export enum ProcessFamily { PILOTAGE = "PILOTAGE", OPERATIONNEL = "OPERATIONNEL", SUPPORT = "SUPPORT" }
export enum SurveyTarget { CLIENT = "CLIENT", SUPPLIER = "SUPPLIER", EMPLOYEE = "EMPLOYEE" }

// ==========================================
// 2. MODÈLES CORE (INTERFACES)
// ==========================================

export interface Tenant {
  T_Id: string;
  T_Name: string;
  T_Email: string;
  T_Domain: string;
  T_Plan: Plan;
  T_SubscriptionStatus: SubscriptionStatus;
  T_SubscriptionEndDate?: Date | string | null;
  T_IsActive: boolean;
  T_CreatedAt: Date | string;
  T_UpdatedAt: Date | string;
  T_Address?: string | null;
  T_Phone?: string | null;
  T_CeoName?: string | null;
  T_ContractDuration: number;
  T_TacitRenewal: boolean;
}

export interface User {
  U_Id: string;
  U_Email: string;
  U_FirstName?: string | null;
  U_LastName?: string | null;
  U_Phone?: string | null;
  U_Role: Role;
  U_IsActive: boolean;
  U_CreatedAt: Date | string;
  U_UpdatedAt: Date | string;
  U_FirstLogin: boolean;
  U_LastLoginAt?: Date | string | null;
  tenantId: string;
  U_SiteId?: string | null;
  U_OrgUnitId?: string | null;
  U_AssignedProcessId?: string | null;
  U_Competences?: UserCompetence[]; // Typage scellé
  tenant?: Tenant; // Inclusion optionnelle pour les jointures
}

export interface Site {
  S_Id: string;
  S_Name: string;
  S_Address?: string | null;
  S_City?: string | null;
  S_Country?: string | null;
  S_IsActive: boolean;
  tenantId: string;
  S_CreatedAt: Date | string;
  S_UpdatedAt: Date | string;
}

export interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_Description?: string | null;
  PR_Objectifs?: string | null;
  PR_Ressources?: string | null;
  PR_Surveillance?: string | null;
  PR_Version: number;
  PR_DateRevision?: Date | string | null;
  PR_TypeId: string;
  PR_IsActive: boolean;
  PR_PiloteId: string;
  PR_CoPiloteId?: string | null;
  tenantId: string;
  PR_CreatedAt: Date | string;
  PR_UpdatedAt: Date | string;
  pilote?: User;
}

export interface PAQ {
  PAQ_Id: string;
  PAQ_Title: string;
  PAQ_Description?: string | null;
  PAQ_Year: number;
  PAQ_Status: PAQStatus;
  PAQ_Budget?: number | null;
  PAQ_DateCloture?: Date | string | null;
  PAQ_IsActive: boolean;
  PAQ_ProcessusId: string;
  PAQ_QualityManagerId: string;
  tenantId: string;
  PAQ_CreatedAt: Date | string;
  PAQ_UpdatedAt: Date | string;
  processus?: Processus;
}

export interface Action {
  ACT_Id: string;
  ACT_Title: string;
  ACT_Description?: string | null;
  ACT_Origin: ActionOrigin;
  ACT_Type: ActionType;
  ACT_Status: ActionStatus;
  ACT_Priority: Priority;
  ACT_IsActive: boolean;
  ACT_CreatedAt: Date | string;
  ACT_Deadline?: Date | string | null;
  ACT_CompletedAt?: Date | string | null;
  ACT_UpdatedAt: Date | string;
  ACT_ResponsableId: string;
  ACT_CreatorId: string;
  ACT_PAQId: string;
  ACT_NCId?: string | null;
  ACT_ReclamationId?: string | null;
  ACT_AuditId?: string | null;
  ACT_MeetingId?: string | null;
  ACT_SSEEventId?: string | null;
  ACT_RiskId?: string | null;
  tenantId: string;
  responsable?: User;
}

export interface NonConformite {
  NC_Id: string;
  NC_Code: string;
  NC_Title: string;
  NC_Description: string;
  NC_AnalyseCauses?: string | null;
  NC_ActionsImmediates?: string | null;
  NC_Efficacite?: string | null;
  NC_Gravite: NCGravity;
  NC_Statut: NCStatus;
  NC_Source: NCSource;
  NC_IsActive: boolean;
  NC_CreatedAt: Date | string;
  NC_UpdatedAt: Date | string;
  NC_ProcessusId?: string | null;
  NC_ReclamationId?: string | null;
  NC_AuditId?: string | null;
  NC_DetectorId?: string | null;
  tenantId: string;
  processus?: Processus;
}

// ==========================================
// 3. TYPES SYSTÈME & SÉCURITÉ
// ==========================================

export interface UserCompetence {
  UC_UserId: string;
  UC_CompetenceId: string;
  UC_NiveauActuel: number;
  UC_IsActive: boolean;
}

export interface Signature {
  SIG_Id: string;
  SIG_EntityType: string;
  SIG_EntityId: string;
  SIG_Hash: string;
  SIG_Metadata?: JsonValue;
  SIG_UserId: string;
  SIG_IsActive: boolean;
  SIG_CreatedAt: Date | string;
  tenantId: string;
}

export interface Notification {
  N_Id: string;
  N_Title: string;
  N_Message: string;
  N_Type: NotificationType;
  N_IsRead: boolean;
  N_IsActive: boolean;
  N_CreatedAt: Date | string;
  userId: string;
  tenantId: string;
}

export interface VitrineContent {
  id: string;
  type: "FORMATION" | "ACTUALITE" | "SERVICE";
  title: string;
  slug: string; 
  content: string;
  category?: string;
  imageUrl?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  published: boolean;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * FICHIER DE TYPAGE INTÉGRAL - QUALISOFT RD 2030
 * -------------------------------------------------------------------------
 * Ce fichier est la copie miroir du schéma Prisma.
 * Aucune utilisation de 'any'.
 */

// --- TYPES DE BASE ---

export type JsonValue = 
  | string 
  | number 
  | boolean 
  | { [key: string]: JsonValue } 
  | JsonValue[] 
  | null;


// ==========================================
// 1. ÉNUMÉRATIONS
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
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  USER = "USER",
  PILOTE = "PILOTE",
  COPILOTE = "COPILOTE",
  AUDITEUR = "AUDITEUR",
  HSE = "HSE",
  SAFETY_OFFICER = "SAFETY_OFFICER",
  RQ = "RQ",
  DIRECTION = "DIRECTION",
  OBSERVATEUR = "OBSERVATEUR",
  MANAGER = "MANAGER",
  
}

export enum ContextType {
  ENJEU_INTERNE = "ENJEU_INTERNE",
  ENJEU_EXTERNE = "ENJEU_EXTERNE",
  PARTIE_INTERESSEE = "PARTIE_INTERESSEE",
  REGLEMENTAIRE = "REGLEMENTAIRE"
}

export enum PartyType {
  CLIENT = "CLIENT",
  AUTORITE = "AUTORITE",
  ACTIONNAIRE = "ACTIONNAIRE",
  EMPLOYE = "EMPLOYE",
  FOURNISSEUR = "FOURNISSEUR",
  CONCURRENT = "CONCURRENT",
  COLLECTIVITE = "COLLECTIVITE",
  ONG = "ONG"
}

export enum ObjectiveStatus {
  BROUILLON = "BROUILLON",
  EN_COURS = "EN_COURS",
  ATTEINT = "ATTEINT",
  NON_ATTEINT = "NON_ATTEINT",
  REPORTE = "REPORTE",
  ANNULE = "ANNULE"
}

export enum PAQStatus {
  BROUILLON = "BROUILLON",
  EN_COURS = "EN_COURS",
  CLOTURE = "CLOTURE",
  ARCHIVE = "ARCHIVE"
}

export enum DocStatus {
  BROUILLON = "BROUILLON",
  EN_REVUE = "EN_REVUE",
  APPROUVE = "APPROUVE",
  REJETE = "REJETE",
  ARCHIVE = "ARCHIVE",
  OBSOLETE = "OBSOLETE"
}

export enum NotificationType {
  INFO = "INFO",
  WARNING = "WARNING",
  SUCCESS = "SUCCESS",
  DANGER = "DANGER",
  SSE_ALERT = "SSE_ALERT",
  DEADLINE_ALERT = "DEADLINE_ALERT"
}

export enum HabStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  REVOKED = "REVOKED",
  PENDING = "PENDING"
}

export enum DocCategory {
  PROCEDURE = "PROCEDURE",
  MANUEL = "MANUEL",
  ENREGISTREMENT = "ENREGISTREMENT",
  CONSIGNE = "CONSIGNE",
  RAPPORT = "RAPPORT",
  FORMULAIRE = "FORMULAIRE",
  AUTRE = "AUTRE"
}

export enum AuditType {
  INTERNE = "INTERNE",
  EXTERNE = "EXTERNE",
  CERTIFICATION = "CERTIFICATION",
  SURVEILLANCE = "SURVEILLANCE",
  TIERCE_PARTIE = "TIERCE_PARTIE"
}

export enum AuditStatus {
  PLANIFIE = "PLANIFIE",
  EN_COURS = "EN_COURS",
  TERMINE = "TERMINE",
  ANNULE = "ANNULE"
}

export enum FindingType {
  POINT_FORT = "POINT_FORT",
  CONFORMITE = "CONFORMITE",
  OBSERVATION = "OBSERVATION",
  NC_MINEURE = "NC_MINEURE",
  NC_MAJEURE = "NC_MAJEURE"
}

export enum NCGravity {
  MINEURE = "MINEURE",
  MAJEURE = "MAJEURE",
  CRITIQUE = "CRITIQUE"
}

export enum NCStatus {
  DETECTION = "DETECTION",
  ANALYSE = "ANALYSE",
  ACTION_EN_COURS = "ACTION_EN_COURS",
  VERIFICATION = "VERIFICATION",
  CLOTURE = "CLOTURE",
  EN_COURS = "EN_COURS"
}

export enum NCSource {
  INTERNAL_AUDIT = "INTERNAL_AUDIT",
  EXTERNAL_AUDIT = "EXTERNAL_AUDIT",
  CLIENT_COMPLAINT = "CLIENT_COMPLAINT",
  SUPPLIER = "SUPPLIER",
  INCIDENT_SAFETY = "INCIDENT_SAFETY",
  PROCESS_REVIEW = "PROCESS_REVIEW",
  MANAGEMENT_REVIEW = "MANAGEMENT_REVIEW"
}

export enum ActionStatus {
  A_FAIRE = "A_FAIRE",
  EN_COURS = "EN_COURS",
  A_VALIDER = "A_VALIDER",
  TERMINEE = "TERMINEE",
  NON_EFFICACE = "NON_EFFICACE",
  ANNULEE = "ANNULEE",
  EN_RETARD = "EN_RETARD"
}

export enum ActionType {
  CORRECTIVE = "CORRECTIVE",
  PREVENTIVE = "PREVENTIVE",
  AMELIORATION = "AMELIORATION"
}

export enum ActionOrigin {
  AUDIT = "AUDIT",
  NON_CONFORMITE = "NON_CONFORMITE",
  RECLAMATION = "RECLAMATION",
  REVUE_DIRECTION = "REVUE_DIRECTION",
  COPIL = "COPIL",
  RISQUE = "RISQUE",
  SSE = "SSE",
  OBJECTIF = "OBJECTIF",
  LEGAL = "LEGAL",
  ALERTE = "ALERTE",
  AUTRE = "AUTRE"
}

export enum TicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
  ARCHIVED = "ARCHIVED"
}

export enum ReclamationStatus {
  NOUVELLE = "NOUVELLE",
  EN_ANALYSE = "EN_ANALYSE",
  ACTION_EN_COURS = "ACTION_EN_COURS",
  TRAITEE = "TRAITEE",
  REJETEE = "REJETEE"
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
  CRITICAL = "CRITICAL"
}

export enum SSEType {
  ACCIDENT_TRAVAIL = "ACCIDENT_TRAVAIL",
  ACCIDENT_TRAVAIL_TRAJET = "ACCIDENT_TRAVAIL_TRAJET",
  DOMMAGE_MATERIEL = "DOMMAGE_MATERIEL",
  PRESQU_ACCIDENT = "PRESQU_ACCIDENT",
  SITUATION_DANGEREUSE = "SITUATION_DANGEREUSE",
  MALADIE_PRO = "MALADIE_PRO",
  INCIDENT_ENVIRONNEMENTAL = "INCIDENT_ENVIRONNEMENTAL"
}

export enum MeetingStatus {
  PLANIFIE = "PLANIFIE",
  EN_COURS = "EN_COURS",
  TERMINE = "TERMINE",
  ANNULE = "ANNULE"
}

export enum IVStatus {
  BROUILLON = "BROUILLON",
  SOUMIS = "SOUMIS",
  VALIDE = "VALIDE",
  RENVOYE = "RENVOYE"
}

export enum ReviewStatus {
  BROUILLON = "BROUILLON",
  EN_COURS = "EN_COURS",
  VALIDEE = "VALIDEE",
  CLOTUREE = "CLOTUREE"
}

export enum RiskStatus {
  IDENTIFIE = "IDENTIFIE",
  EVALUE = "EVALUE",
  TRAITE = "TRAITE",
  ACCEPTE = "ACCEPTE",
  SURVEILLE = "SURVEILLE",
  CRITIQUE = "CRITIQUE",
  ANNULE = "ANNULE"
}

export enum TierType {
  CLIENT = "CLIENT",
  FOURNISSEUR = "FOURNISSEUR",
  PARTENAIRE = "PARTENAIRE",
  ETAT = "ETAT",
  SOUS_TRAITANT = "SOUS_TRAITANT"
}

export enum TransactionStatus {
  EN_COURS = "EN_COURS",
  COMPLETE = "COMPLETE",
  ECHOUEE = "ECHOUEE",
  A_REFAIRE = "A_REFAIRE"
}

export enum PaymentMethod {
  WAVE = "WAVE",
  ORANGE_MONEY = "ORANGE_MONEY",
  CREDIT_CARD = "CREDIT_CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  ESSAI = "ESSAI"
}

export enum GovernanceType {
  COPIL = "COPIL",
  REVUE_DIRECTION = "REVUE_DIRECTION",
  REVUE_PROCESSUS = "REVUE_PROCESSUS",
  AUDIT_INTERNE = "AUDIT_INTERNE",
  AUDIT_EXTERNE = "AUDIT_EXTERNE",
  VEILLE_REGLEMENTAIRE = "VEILLE_REGLEMENTAIRE",
  SEANCE_PROCESSUS = "SEANCE_PROCESSUS"
}

export enum ActivityStatus {
  PLANNED = "PLANNED",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  POSTPONED = "POSTPONED",
  CANCELLED = "CANCELLED"
}

export enum WorkflowStatus {
  EN_ATTENTE = "EN_ATTENTE",
  APPROUVE = "APPROUVE",
  REJETE = "REJETE",
  ANNULE = "ANNULE"
}

export enum ChangeAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  RESTORE = "RESTORE"
}

export enum ProcessFamily {
  PILOTAGE = "PILOTAGE",
  OPERATIONNEL = "OPERATIONNEL",
  SUPPORT = "SUPPORT"
}

export enum SurveyTarget {
  CLIENT = "CLIENT",
  SUPPLIER = "SUPPLIER",
  EMPLOYEE = "EMPLOYEE"
}


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
  U_Competences: any;
  U_Id: string;
  U_Email: string;
  U_PasswordHash: string;
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

export interface OrgUnitType {
  OUT_Id: string;
  OUT_Label: string;
  OUT_Description?: string | null;
  OUT_IsActive: boolean;
  OUT_CreatedAt: Date | string;
  tenantId: string;
}

export interface OrgUnit {
  OU_Id: string;
  OU_Name: string;
  OU_Code?: string | null;
  OU_TypeId: string;
  OU_ParentId?: string | null;
  OU_SiteId: string;
  tenantId: string;
  OU_IsActive: boolean;
  OU_CreatedAt: Date | string;
  OU_UpdatedAt: Date | string;
}

export interface ProcessType {
  PT_Id: string;
  PT_Label: string;
  PT_Description?: string | null;
  PT_Color?: string | null;
  PT_Family: ProcessFamily;
  PT_IsActive: boolean;
  PT_CreatedAt: Date | string;
  tenantId: string;
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
}

export interface Action {
  [x: string]: any;
  ACT_Responsable: any;
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
  ACT_LegalRequirementId?: string | null;
  ACT_RegulatoryRequirementId?: string | null;
}

export interface PAQ {
  PAQ_Processus: any;
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
}

export interface Risk {
  RS_Id: string;
  RS_Libelle: string;
  RS_Activite?: string | null;
  RS_Tache?: string | null;
  RS_Causes?: string | null;
  RS_Description?: string | null;
  RS_Contexte?: string | null;
  RS_PartiesInteressees?: string | null;
  RS_Probabilite: number;
  RS_Gravite: number;
  RS_Maitrise: number;
  RS_Score: number;
  RS_Status: RiskStatus;
  RS_Mesures?: string | null;
  RS_Acteurs?: string | null;
  RS_NextReview?: Date | string | null;
  RS_IsActive: boolean;
  RS_CreatedAt: Date | string;
  RS_UpdatedAt: Date | string;
  RS_ExigencesLegales?: string | null;
  RS_TypeId: string;
  RS_ProcessusId: string;
  RS_Opportunite?: string | null;
  tenantId: string;
}

export interface RiskType {
  RT_Id: string;
  RT_Label: string;
  RT_Description?: string | null;
  RT_IsActive: boolean;
  RT_CreatedAt: Date | string;
  tenantId: string;
}

export interface SSEEvent {
  SSE_Id: string;
  SSE_Type: SSEType;
  SSE_DateEvent: Date | string;
  SSE_Lieu: string;
  SSE_Description: string;
  SSE_AvecArret: boolean;
  SSE_NbJoursArret: number;
  SSE_Metadata?: JsonValue;
  SSE_IsActive: boolean;
  SSE_CreatedAt: Date | string;
  SSE_UpdatedAt: Date | string;
  SSE_ReporterId?: string | null;
  SSE_CreatorId?: string | null;
  SSE_VictimId?: string | null;
  SSE_SiteId: string;
  SSE_ProcessusId?: string | null;
  tenantId: string;
}

export interface Causerie {
  CS_Id: string;
  CS_Theme: string;
  CS_Date: Date | string;
  CS_CompteRendu?: string | null;
  CS_IsActive: boolean;
  CS_CreatedAt: Date | string;
  CS_UpdatedAt: Date | string;
  CS_AnimateurId: string;
  tenantId: string;
}

export interface Document {
  DOC_Id: string;
  DOC_Title: string;
  DOC_Description?: string | null;
  DOC_Category: DocCategory;
  DOC_Status: DocStatus;
  DOC_CurrentVersion: number;
  DOC_IsArchived: boolean;
  DOC_IsActive: boolean;
  DOC_CreatedAt: Date | string;
  DOC_UpdatedAt: Date | string;
  DOC_Reference?: string | null;
  DOC_NextReviewDate?: Date | string | null;
  DOC_ReviewFrequencyMonths: number;
  DOC_OwnerId?: string | null;
  DOC_Tags: string[];
  DOC_ArchivedAt?: Date | string | null;
  DOC_ArchivedById?: string | null;
  tenantId: string;
  DOC_SiteId?: string | null;
  DOC_ProcessusId?: string | null;
  DOC_RegulatoryRequirementId?: string | null;
}

export interface DocumentVersion {
  DV_Id: string;
  DV_VersionNumber: number;
  DV_FileUrl: string;
  DV_FileName: string;
  DV_FileSize: number;
  DV_FileType?: string | null;
  DV_Status: DocStatus;
  DV_CreatedAt: Date | string;
  DV_DocumentId: string;
  DV_ApprovedById?: string | null;
  DV_ApprovedAt?: Date | string | null;
  DV_RejectionComment?: string | null;
  DV_CreatedById: string;
  DV_ChangeDescription?: string | null;
}

export interface Preuve {
  PV_Id: string;
  PV_Commentaire?: string | null;
  PV_FileUrl: string;
  PV_FileName: string;
  PV_IsActive: boolean;
  PV_CreatedAt: Date | string;
  PV_AuditId?: string | null;
  PV_NCId?: string | null;
  PV_ActionId?: string | null;
  PV_DocumentId?: string | null;
  tenantId: string;
}

export interface Audit {
  AU_Id: string;
  AU_Reference: string;
  AU_Title: string;
  AU_Scope: string;
  AU_Type: AuditType;
  AU_NormesRef: string[];
  AU_DateAudit: Date | string;
  AU_DateRapport?: Date | string | null;
  AU_Status: AuditStatus;
  AU_IsActive: boolean;
  AU_CreatedAt: Date | string;
  AU_UpdatedAt: Date | string;
  AU_LeadId?: string | null;
  AU_SiteId: string;
  AU_ProcessusId?: string | null;
  tenantId: string;
}

export interface Finding {
  FI_Id: string;
  FI_Description: string;
  FI_Type: FindingType;
  FI_IsActive: boolean;
  FI_AuditId: string;
}

export interface NonConformite {
  NC_AnalyseCauses: string;
  NC_ActionsImmediates: string;
  NC_Efficacite: string;
  NC_Id: string;
  NC_Code: string;
  NC_Title: string;
 // NC_Id: string;
  NC_Libelle: string;
  NC_Description: string;
  NC_Diagnostic?: string | null;
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
}

export interface SenegalLegalRequirement {
  SLR_Id: string;
  SLR_Category: string;
  SLR_Title: string;
  SLR_Description?: string | null;
  SLR_Reference: string;
  SLR_Domain?: string | null;
  SLR_Authority: string;
  SLR_Deadline?: Date | string | null;
  SLR_Status: string;
  SLR_Evidence?: string | null;
  SLR_Comment?: string | null;
  SLR_IsActive: boolean;
  SLR_CreatedAt: Date | string;
  SLR_UpdatedAt: Date | string;
  tenantId: string;
}

export interface LegalChecklist {
  LC_Id: string;
  LC_Standard: string;
  LC_Clause: string;
  LC_Title: string;
  LC_Description?: string | null;
  LC_Criteria?: string | null;
  LC_IsMandatory: boolean;
  LC_SenegalSpecific: boolean;
  LC_Reference?: string | null;
  LC_IsActive: boolean;
  LC_CreatedAt: Date | string;
  tenantId: string;
}

export interface ChecklistResponse {
  CR_Id: string;
  CR_ChecklistId: string;
  CR_Response: string;
  CR_Evidence?: string | null;
  CR_Comment?: string | null;
  CR_IsCompliant: boolean;
  CR_CreatedAt: Date | string;
  CR_UpdatedAt: Date | string;
  tenantId: string;
}

export interface OrganizationContext {
  OC_Id: string;
  OC_Type: ContextType;
  OC_Title: string;
  OC_Description: string;
  OC_Impact?: string | null;
  OC_ActionsPlanif?: string | null;
  OC_ReviewDate?: Date | string | null;
  OC_IsActive: boolean;
  OC_CreatedAt: Date | string;
  OC_UpdatedAt: Date | string;
  tenantId: string;
}

export interface InterestedParty {
  IP_Id: string;
  IP_Name: string;
  IP_Type: PartyType;
  IP_Needs: string;
  IP_Expectations: string;
  IP_Requirements?: string | null;
  IP_IsActive: boolean;
  IP_CreatedAt: Date | string;
  IP_UpdatedAt: Date | string;
  tenantId: string;
}

export interface QualityObjective {
  QO_Id: string;
  QO_Title: string;
  QO_Description?: string | null;
  QO_Target: string;
  QO_Deadline: Date | string;
  QO_Status: ObjectiveStatus;
  QO_Progress: number;
  QO_IsActive: boolean;
  QO_CreatedAt: Date | string;
  QO_UpdatedAt: Date | string;
  QO_ProcessusId?: string | null;
  QO_OwnerId: string;
  tenantId: string;
}

export interface Indicator {
  IND_Id: string;
  IND_Code: string;
  IND_Libelle: string;
  IND_Unite: string;
  IND_Cible: number;
  IND_Frequence: string;
  IND_IsActive: boolean;
  IND_CreatedAt: Date | string;
  IND_UpdatedAt: Date | string;
  IND_ProcessusId: string;
  IND_ObjectiveId?: string | null;
  tenantId: string;
}

export interface IndicatorValue {
  IV_Id: string;
  IV_Month: number;
  IV_Year: number;
  IV_Actual: number;
  IV_Status: IVStatus;
  IV_Comment?: string | null;
  IV_IsActive: boolean;
  IV_CreatedAt: Date | string;
  IV_UpdatedAt: Date | string;
  IV_IndicatorId: string;
}

export interface Reclamation {
  REC_SolutionProposed: string;
  Tier: any;
  REC_Id: string;
  REC_Reference: string;
  REC_Object: string;
  REC_Description: string;
  REC_Status: ReclamationStatus;
  REC_Source?: string | null;
  REC_DateReceipt: Date | string;
  REC_DateTransmitted?: Date | string | null;
  REC_Gravity: Priority;
  REC_Deadline?: Date | string | null;
  REC_CreatedAt: Date | string;
  REC_UpdatedAt: Date | string;
  REC_PreuveURL?: string | null;
  REC_PreuveName?: string | null;
  REC_TierId: string;
  REC_ProcessusId?: string | null;
  REC_OwnerId: string;
  tenantId: string;
}

export interface Tier {
  TR_Id: string;
  TR_Name: string;
  TR_Email?: string | null;
  TR_Type: TierType;
  TR_IsActive: boolean;
  TR_UpdatedAt: Date | string;
  tenantId: string;
}

export interface Consumption {
  CON_Id: string;
  CON_Type: string;
  CON_Value: number;
  CON_Unit: string;
  CON_Month: number;
  CON_Year: number;
  CON_Cost?: number | null;
  CON_IsActive: boolean;
  CON_CreatedAt: Date | string;
  CON_SiteId: string;
  CON_CreatorId?: string | null;
  tenantId: string;
}

export interface Waste {
  WAS_Id: string;
  WAS_Label: string;
  WAS_Weight: number;
  WAS_Type: string;
  WAS_Treatment: string;
  WAS_Month: number;
  WAS_Year: number;
  WAS_IsActive: boolean;
  WAS_CreatedAt: Date | string;
  WAS_SiteId: string;
  tenantId: string;
}

export interface SSEStats {
  ST_Id: string;
  ST_Mois: number;
  ST_Annee: number;
  ST_NbAccidents: number;
  ST_TauxFrequence: number;
  ST_TauxGravite: number;
  ST_IsActive: boolean;
  ST_CreatedAt: Date | string;
  tenantId: string;
}

export interface GovernanceActivity {
  GA_Id: string;
  GA_Num?: string | null;
  GA_Title: string;
  GA_Type: GovernanceType;
  GA_DatePlanned: Date | string;
  GA_Deadline?: Date | string | null;
  GA_Status: ActivityStatus;
  GA_IsActive: boolean;
  GA_CreatedAt: Date | string;
  GA_UpdatedAt: Date | string;
  tenantId: string;
}

export interface Meeting {
  MG_Id: string;
  MG_Title: string;
  MG_Date: Date | string;
  MG_Status: MeetingStatus;
  MG_Report?: string | null;
  MG_IsActive: boolean;
  MG_CreatedAt: Date | string;
  MG_UpdatedAt: Date | string;
  MG_ProcessId?: string | null;
  tenantId: string;
}

export interface MeetingAttendee {
  MA_Id: string;
  MA_MeetingId: string;
  MA_UserId: string;
  MA_Present: boolean;
}

export interface Equipment {
  EQ_Id: string;
  EQ_Reference: string;
  EQ_Name: string;
  EQ_DateService: Date | string;
  EQ_ProchaineVGP: Date | string;
  EQ_Status: string;
  EQ_IsActive: boolean;
  EQ_UpdatedAt: Date | string;
  tenantId: string;
}

export interface Competence {
  CP_Id: string;
  CP_Name: string;
  CP_NiveauRequis: number;
  CP_IsActive: boolean;
  tenantId: string;
}

export interface UserCompetence {
  UC_UserId: string;
  UC_CompetenceId: string;
  UC_NiveauActuel: number;
  UC_IsActive: boolean;
}

export interface Formation {
  FOR_Id: string;
  FOR_Title: string;
  FOR_Date: Date | string;
  FOR_Status: string;
  FOR_Expiry?: Date | string | null;
  FOR_Provider?: string | null;
  FOR_IsActive: boolean;
  FOR_UpdatedAt: Date | string;
  FOR_UserId: string;
  tenantId: string;
}

export interface ProcessReview {
  PRV_Id: string;
  PRV_Month: number;
  PRV_Year: number;
  PRV_Status: ReviewStatus;
  PRV_DocRef?: string | null;
  PRV_PerformanceAnalysis?: string | null;
  PRV_AuditAnalysis?: string | null;
  PRV_ResourcesAnalysis?: string | null;
  PRV_RiskAnalysis?: string | null;
  PRV_Decisions?: string | null;
  PRV_PiloteSigned: boolean;
  PRV_RQSigned: boolean;
  PRV_UpdatedAt: Date | string;
  PRV_ProcessusId: string;
  tenantId: string;
}

export interface RevueDirection {
  RD_Id: string;
  RD_Periode: string;
  RD_Date: Date | string;
  RD_IsActive: boolean;
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

export interface UserHabilitation {
  UH_Id: string;
  UH_Label: string;
  UH_DateObtained: Date | string;
  UH_ExpiryDate?: Date | string | null;
  UH_Status: HabStatus;
  UH_IsActive: boolean;
  UH_UpdatedAt: Date | string;
  userId: string;
  tenantId: string;
}

export interface ApprovalWorkflow {
  AW_Id: string;
  AW_EntityType: string;
  AW_EntityId: string;
  AW_Step: number;
  AW_Status: WorkflowStatus;
  AW_ApprovedAt?: Date | string | null;
  AW_ApproverId: string;
  AW_Comment?: string | null;
  AW_CreatedAt: Date | string;
  tenantId: string;
}

export interface ChangeLog {
  CL_Id: string;
  CL_EntityType: string;
  CL_EntityId: string;
  CL_Action: ChangeAction;
  CL_UserId: string;
  CL_Timestamp: Date | string;
  tenantId: string;
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

export interface SecurityAuditLog {
  SAL_Id: string;
  SAL_Action: string;
  SAL_Timestamp: Date | string;
  SAL_UserId: string;
  tenantId: string;
}

export interface Transaction {
  TX_Id: string;
  TX_Amount: number;
  TX_Currency: string;
  TX_Reference: string;
  TX_Status: TransactionStatus;
  TX_PaymentMethod: PaymentMethod;
  TX_IsActive: boolean;
  TX_CreatedAt: Date | string;
  TX_ProofUrl?: string | null;
  TX_AdminComment?: string | null;
  tenantId: string;
}

export interface Ticket {
  TK_Id: string;
  TK_Subject: string;
  TK_Status: TicketStatus;
  TK_Priority: Priority;
  TK_Response?: string | null;
  TK_ResponseAt?: Date | string | null;
  TK_IsActive: boolean;
  TK_CreatedAt: Date | string;
  TK_UpdatedAt: Date | string;
  tenantId: string;
}

export interface RegulatoryRequirement {
  RR_Id: string;
  RR_Title: string;
  RR_Description: string;
  RR_Category: string;
  RR_Type: string;
  RR_Reference: string;
  RR_Authority: string;
  RR_DueDate: Date | string;
  RR_Frequency?: number | null;
  RR_LastCompliance?: Date | string | null;
  RR_Status: string;
  RR_Priority: string;
  RR_EvidenceUrl?: string | null;
  RR_Comment?: string | null;
  RR_IsRecurring: boolean;
  RR_IsActive: boolean;
  RR_CreatedAt: Date | string;
  RR_UpdatedAt: Date | string;
  tenantId: string;
}

export interface Alert {
  AL_Id: string;
  AL_Title: string;
  AL_Message: string;
  AL_Type: string;
  AL_Priority: string;
  AL_Status: string;
  AL_DueDate: Date | string;
  AL_TriggerDate: Date | string;
  AL_ResolveDate?: Date | string | null;
  AL_IsPushSent: boolean;
  AL_IsEmailSent: boolean;
  AL_IsSmsSent: boolean;
  AL_IsActive: boolean;
  AL_RequirementId?: string | null;
  AL_AuditId?: string | null;
  AL_ActionId?: string | null;
  tenantId: string;
}

export interface AlertRecipient {
  AR_Id: string;
  AR_AlertId: string;
  AR_UserId: string;
  AR_ReadAt?: Date | string | null;
  AR_Status: string;
}

export interface LegalUpdate {
  LU_Id: string;
  LU_Title: string;
  LU_Summary: string;
  LU_Content: string;
  LU_Source: string;
  LU_PublicationDate: Date | string;
  LU_EffectiveDate?: Date | string | null;
  LU_Category: string;
  LU_Impact: string;
  LU_IsPublished: boolean;
  LU_PublishedAt?: Date | string | null;
  tenantId: string;
}

export interface ComplianceCalendar {
  CC_Id: string;
  CC_Title: string;
  CC_Description?: string | null;
  CC_Date: Date | string;
  CC_Type: string;
  CC_IsMandatory: boolean;
  CC_IsRecurring: boolean;
  CC_Frequency?: number | null;
  CC_LastDone?: Date | string | null;
  CC_NextDue: Date | string;
  tenantId: string;
}

export interface SurveyCampaign {
  SC_Id: string;
  SC_TenantId: string;
  SC_Title: string;
  SC_Target: SurveyTarget;
  SC_Status: string;
  SC_Questions: JsonValue;
  SC_CreatedAt: Date | string;
  SC_UpdatedAt: Date | string;
}

export interface SurveyResult {
  RES_Id: string;
  RES_CampaignId: string;
  RES_Score: number;
  RES_Details?: JsonValue;
  RES_Comment?: string | null;
  RES_Respondent?: string | null;
  RES_Date: Date | string;
  RES_Status: string;
}

export interface VitrineContent {
  id: string;
  type:      string;   // "FORMATION", "ACTUALITE", "SERVICE"
  title:     string;
  slug:     string; 
  content:   string;
  category?:  string;
  imageUrl?:  string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
}
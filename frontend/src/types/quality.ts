// FICHIER : src/types/quality.ts
// RÔLE : Définitions partagées pour le module Qualité ISO 9001

// 1. ÉNUMÉRATIONS (Pour matcher avec Prisma et l'UI)
export type NCSource = 
  | 'CLIENT_COMPLAINT' 
  | 'INTERNAL_AUDIT' 
  | 'EXTERNAL_AUDIT' 
  | 'SUPPLIER' 
  | 'INCIDENT_SAFETY';

export type NCStatus = 
  | 'OPEN' 
  | 'ANALYSE' 
  | 'ACTION_REQUIRED' 
  | 'RESOLVED' 
  | 'CLOSED';

export type ActionStatus = 
  | 'OPEN' 
  | 'IN_PROGRESS' 
  | 'DONE' 
  | 'VERIFIED';

// 2. INTERFACES (Pour les données API)
export interface UserIdentity {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
}

export interface Processus {
  PR_Id: string;
  PR_Libelle: string;
  PR_Pilote?: UserIdentity;
}

export interface ActionCorrective {
  ACT_Id: string;
  ACT_Title: string;
  ACT_Description?: string;
  ACT_Status: ActionStatus;
  ACT_Deadline: string;
  ACT_ResponsableId?: string;
  ACT_Responsable?: UserIdentity;
  ACT_OriginType: 'NC' | 'AUDIT' | 'RISK' | 'MEETING';
  ACT_OriginId: string;
}

export interface NonConformite {
  NC_Id: string;
  NC_Libelle: string;
  NC_Description: string;
  NC_Source: NCSource;
  NC_ProcessusId: string;
  NC_Processus?: Processus;
  NC_DetectorId: string;
  NC_Detector?: UserIdentity;
  NC_CreatedAt: string;
  NC_Statut: NCStatus;
  NC_Diagnostic?: string; // L'analyse des causes (Ishikawa/5P)
  NC_Actions?: ActionCorrective[]; // La liaison vitale
}
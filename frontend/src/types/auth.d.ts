/**
 * CHEMIN ABSOLU : /frontend/src/types/auth.d.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Typage global de l'identité Matrix.
 */

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'USER' 
  | 'PILOTE' 
  | 'COPILOTE' 
  | 'AUDITEUR' 
  | 'DIRECTION';

export interface MatrixSession {
  U_Id: string;
  U_Email: string;
  U_Role: UserRole;
  tenantId: string;
  U_TenantName: string;
  assignedProcessId: string | null;
}
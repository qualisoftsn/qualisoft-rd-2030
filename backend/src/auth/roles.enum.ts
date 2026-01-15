export enum Role {
  CLIENT = 'CLIENT',
  INTERNAL_AUDIT = 'INTERNAL_AUDIT',
  EXTERNAL_AUDIT = 'EXTERNAL_AUDIT',
  SUPPLIER = 'SUPPLIER',
  INCIDENT_SAFETY = 'INCIDENT_SAFETY', // Focus terrain/sécurité
  USER = 'USER',
  PILOTE = 'PILOTE',      // Responsable de processus/action
  COPILOTE = 'COPILOTE',  // Adjoint de processus
  ADMIN = 'ADMIN',        // Admin local (Tenant)
  SUPER_ADMIN = 'SUPER_ADMIN', // Contrôle total (Multi-tenant)
}
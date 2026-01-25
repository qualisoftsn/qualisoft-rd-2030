import { Role } from './roles.enum';

export const canDelete = (userRole: string) => {
  return [Role.ADMIN, Role.SUPER_ADMIN].includes(userRole as Role);
};

export const canEditAction = (userRole: string) => {
  return [Role.PILOTE, Role.COPILOTE, Role.ADMIN, Role.SUPER_ADMIN].includes(userRole as Role);
};

export const isAuditor = (userRole: string) => {
  return [Role.INTERNAL_AUDIT, Role.EXTERNAL_AUDIT].includes(userRole as Role);
};

export const canManageSubscription = (userRole: string) => {
  return [Role.ADMIN, Role.SUPER_ADMIN].includes(userRole as Role);
};
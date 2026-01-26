import { SetMetadata } from '@nestjs/common';

/**
 * CLÉ DE MÉTADONNÉE POUR LES ROUTES PUBLIQUES
 * Utilisée par les Guards pour bypasser la vérification JWT et Tenant.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * DÉCORATEUR @Public()
 * Permet d'exposer une route sans authentification (Login, Register, etc.)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
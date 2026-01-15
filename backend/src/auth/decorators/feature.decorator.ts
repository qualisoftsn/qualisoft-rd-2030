import { SetMetadata } from '@nestjs/common';

// Permet d'utiliser @RequireFeature('AUDIT') sur les contrôleurs
export const RequireFeature = (feature: string) => SetMetadata('feature', feature);
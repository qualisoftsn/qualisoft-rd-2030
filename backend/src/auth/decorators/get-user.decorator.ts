import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Décorateur personnalisé pour extraire l'utilisateur (ou une propriété)
 * directement depuis la requête (injecté par Passport JWT)
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si on demande une propriété spécifique : @GetUser('tenantId')
    if (data && user) {
      return user[data];
    }

    // Sinon on retourne l'objet utilisateur complet
    return user;
  },
);
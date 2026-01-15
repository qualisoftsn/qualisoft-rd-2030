import { Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class PaymentService {
  prisma: any;
  // Simule la vérification du statut avant accès au Dashboard
  async checkSubscription(tenantId: string) {
    // Logique : Si le paiement par virement est "En attente" ou Orange Money validé
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    
    if (tenant.status === 'CANCELED') {
      throw new ForbiddenException('Abonnement expiré. Veuillez régulariser via Wave ou Carte Bancaire.');
    }
    return true;
  }
}
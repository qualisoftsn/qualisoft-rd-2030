import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async checkSubscription(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ 
      where: { T_Id: tenantId } 
    });
    
    if (!tenant) throw new NotFoundException('Instance introuvable.');

    // Logique SaaS : Blocage si statut annulé ou impayé
    if (tenant.T_SubscriptionStatus === 'EXPIRED') {
      throw new ForbiddenException('Abonnement résilié. Veuillez régulariser via Wave, Orange Money ou Carte Bancaire.');
    }
    
    return true;
  }
}
import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * ✅ DÉCLARATION MANUELLE (WAVE / ORANGE)
   * Enregistre la référence et le lien de la capture (TX_ProofUrl)
   */
  async declare(data: any, T_Id: string) {
    const { amount, reference, method, plan, proofUrl } = data;

    if (!reference || !amount) {
      throw new BadRequestException("La référence et le montant sont obligatoires.");
    }

    // Vérifier si cette référence n'a pas déjà été soumise (Anti-fraude)
    const existing = await this.prisma.transaction.findUnique({
      where: { TX_Reference: reference }
    });

    if (existing) {
      throw new ConflictException("Cette référence de transaction a déjà été soumise.");
    }

    // Création de la transaction liée au Tenant avec la preuve
    return await this.prisma.transaction.create({
      data: {
        TX_Reference: reference,
        TX_Amount: parseFloat(amount),
        TX_Currency: 'XOF',
        TX_Status: TransactionStatus.EN_COURS,
        TX_PaymentMethod: method as PaymentMethod,
        TX_ProofUrl: proofUrl, // ✅ Sauvegarde du lien vers la capture d'écran
        tenantId: T_Id,
        TX_AdminComment: `Déclaration manuelle pour le plan ${plan}`
      },
    });
  }

  /**
   * ✅ INITIALISATION (Paiement automatique futur)
   */
  async initialize(data: any, T_Id: string) {
    const { plan, amount, currency } = data;

    if (!plan || !amount) {
      throw new BadRequestException("Données de transaction incomplètes.");
    }

    const reference = `QS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return await this.prisma.transaction.create({
      data: {
        TX_Reference: reference,
        TX_Amount: parseFloat(amount),
        TX_Currency: currency || 'XOF',
        TX_Status: TransactionStatus.EN_COURS,
        TX_PaymentMethod: PaymentMethod.WAVE, 
        tenantId: T_Id,
      },
    });
  }

  async findAll(T_Id: string) {
    return this.prisma.transaction.findMany({
      where: { tenantId: T_Id },
      orderBy: { TX_CreatedAt: 'desc' }
    });
  }
}
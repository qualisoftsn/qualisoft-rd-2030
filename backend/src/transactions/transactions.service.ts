/**
 * 🛰️ MODULE : TransactionsService
 * -------------------------------------------------------------------------
 * RÔLE : Gestion atomique des flux financiers avec nomenclature scellée.
 * RÉVISION : 03 Mars 2026 | 15:10 GMT
 */

import { Injectable, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus } from '@prisma/client';
import { DeclareTransactionDto, InitializeTransactionDto } from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * ✅ DÉCLARATION MANUELLE (WAVE / ORANGE)
   * Nomenclature miroir du schéma Prisma.
   */
  async declare(dto: DeclareTransactionDto, T_Id: string) {
    // 1. Vérification anti-fraude sur référence unique
    const existing = await this.prisma.transaction.findUnique({
      where: { TX_Reference: dto.TX_Reference }
    });

    if (existing) {
      throw new ConflictException("RÉFÉRENCE MATRICIELLE EXISTANTE : Ce flux a déjà été déclaré.");
    }

    // 2. Création avec nomenclature TX_
    return await this.prisma.transaction.create({
      data: {
        TX_Reference: dto.TX_Reference,
        TX_Amount: dto.TX_Amount,
        TX_Currency: 'XOF',
        TX_Status: TransactionStatus.EN_COURS,
        TX_PaymentMethod: dto.TX_PaymentMethod,
        TX_ProofUrl: dto.TX_ProofUrl,
        tenantId: T_Id,
        TX_AdminComment: `Déclaration manuelle pour upgrade vers plan ${dto.T_Plan}`
      },
    });
  }

  /**
   * ✅ INITIALISATION (Passerelle Auto)
   */
  async initialize(dto: InitializeTransactionDto, T_Id: string) {
    const reference = `QS-ELITE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return await this.prisma.transaction.create({
      data: {
        TX_Reference: reference,
        TX_Amount: dto.TX_Amount,
        TX_Currency: dto.TX_Currency || 'XOF',
        TX_Status: TransactionStatus.EN_COURS,
        TX_PaymentMethod: 'WAVE', // Méthode par défaut pour l'init auto
        tenantId: T_Id,
        TX_AdminComment: `Flux automatique initié pour le plan ${dto.T_Plan}`
      },
    });
  }

  /**
   * 📜 HISTORIQUE MASTER (CRM)
   */
  async findPendingForAdmin() {
    return this.prisma.tenant.findMany({
      where: {
        T_Transactions: { some: { TX_Status: TransactionStatus.EN_COURS } }
      },
      include: {
        T_Transactions: {
          where: { TX_Status: TransactionStatus.EN_COURS },
          orderBy: { TX_CreatedAt: 'desc' }
        }
      }
    });
  }

  async findAll(T_Id: string) {
    return this.prisma.transaction.findMany({
      where: { tenantId: T_Id },
      orderBy: { TX_CreatedAt: 'desc' }
    });
  }
}
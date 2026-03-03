/**
 * 🛰️ MODULE : transaction.dto.ts
 * -------------------------------------------------------------------------
 * RÔLE : Validation et typage des flux financiers entrants.
 * SÉCURITÉ : Alignement strict sur la nomenclature Prisma Qualisoft.
 * RÉVISION : 03 Mars 2026 | 16:15 GMT
 * -------------------------------------------------------------------------
 */

import { IsEnum, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { PaymentMethod, Plan } from '@prisma/client';

/**
 * 🔑 PROTOCOLE : Déclaration manuelle (Wave / Orange Money)
 * Utilisé par le client pour soumettre une preuve de paiement.
 */
export class DeclareTransactionDto {
  @IsNumber({}, { message: "Le montant (TX_Amount) doit être un nombre valide." })
  @Min(1, { message: "Le montant ne peut pas être inférieur à 1 XOF." })
  TX_Amount: number=1;

  @IsString({ message: "La référence (TX_Reference) est obligatoire." })
  TX_Reference: string=" ";

  @IsEnum(PaymentMethod, { message: "Méthode de paiement non reconnue par le Kernel." })
  TX_PaymentMethod: PaymentMethod= "WAVE";

  @IsEnum(Plan, { message: "Le plan visé (T_Plan) n'existe pas dans le référentiel." })
  T_Plan: Plan="ESSAI";

  @IsUrl({}, { message: "Le lien de la preuve (TX_ProofUrl) doit être une URL valide." })
  @IsOptional()
  TX_ProofUrl?: string;
}

/**
 * 🔑 PROTOCOLE : Initialisation de flux automatique
 * Utilisé pour préparer un paiement via passerelle (Futur).
 */
export class InitializeTransactionDto {
  @IsEnum(Plan, { message: "Plan invalide pour l'initialisation." })
  T_Plan: Plan="ESSAI";

  @IsNumber()
  @Min(1)
  TX_Amount: number=1;

  @IsString()
  @IsOptional()
  TX_Currency?: string;
}
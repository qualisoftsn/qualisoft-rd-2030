import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenericCrudService } from '../common/generic-crud.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly model = 'user';

  constructor(
    private prisma: PrismaService,
    private genericCrud: GenericCrudService,
  ) {}

  /**
   * Création d'un utilisateur avec hachage et mapping de rôle
   */
  async create(tenantId: string, dto: any) {
    const { U_Email, U_Password, U_Role, ...rest } = dto;

    // 1. Mapping des rôles (UX -> Système)
    const roleMapping: Record<string, any> = {
      "Pilote de Processus": "PILOTE",
      "Administrateur SMI": "ADMIN",
      "Co-Pilote": "COPILOTE",
      "USER": "USER"
    };
    const finalRole = roleMapping[U_Role] || U_Role;

    // 2. Vérification d'unicité de l'email
    const existing = await this.prisma.user.findUnique({ 
      where: { U_Email } 
    });
    
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé par un autre collaborateur.');
    }

    // 3. Hachage du mot de passe (Sécurité)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(U_Password || 'Qualisoft2026!', salt);

    try {
      // 4. Appel au moteur générique pour la création physique
      return await this.genericCrud.create(this.model, tenantId, {
        ...rest,
        U_Email,
        U_PasswordHash: hashedPassword,
        U_Role: finalRole,
      });
    } catch (e: any) {
      throw new BadRequestException("Erreur lors de la création : " + e.message);
    }
  }

  /**
   * Liste tous les utilisateurs de l'entreprise
   */
  async findAll(tenantId: string) {
    return this.genericCrud.findAll(this.model, tenantId);
  }

  /**
   * Récupère un utilisateur spécifique
   */
  async findOne(id: string, tenantId: string) {
    const pk = 'U_Id';
    const user = await this.prisma.user.findFirst({
      where: { [pk]: id, tenantId },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return user;
  }

  /**
   * Mise à jour d'un utilisateur (gère aussi le changement de mot de passe)
   */
  async update(id: string, tenantId: string, dto: any) {
    const updateData = { ...dto };

    // Si un nouveau mot de passe est fourni, on le hache
    if (updateData.U_Password) {
      const salt = await bcrypt.genSalt(10);
      updateData.U_PasswordHash = await bcrypt.hash(updateData.U_Password, salt);
      delete updateData.U_Password;
    }

    // Gestion du mapping de rôle en cas de modification
    if (updateData.U_Role) {
      const roleMapping: Record<string, any> = {
        "Pilote de Processus": "PILOTE",
        "Administrateur SMI": "ADMIN",
        "Co-Pilote": "COPILOTE",
      };
      updateData.U_Role = roleMapping[updateData.U_Role] || updateData.U_Role;
    }

    return this.genericCrud.update(this.model, id, tenantId, updateData);
  }

  /**
   * Suppression d'un utilisateur
   */
  async remove(id: string, tenantId: string) {
    return this.genericCrud.delete(this.model, id, tenantId);
  }
}
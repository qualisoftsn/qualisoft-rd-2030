import { Injectable, ConflictException, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenericCrudService } from '../common/generic-crud.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly model = 'user';

  constructor(
    private prisma: PrismaService,
    private genericCrud: GenericCrudService,
  ) {}

  async create(tenantId: string, dto: any) {
    const { U_Email, U_Password, U_Role, ...rest } = dto;

    // 1. Mapping des rôles UX -> Système
    const roleMapping: Record<string, string> = {
      "Pilote de Processus": "PILOTE",
      "Administrateur SMI": "ADMIN",
      "Co-Pilote": "COPILOTE",
      "USER": "USER"
    };
    const finalRole = roleMapping[U_Role] || U_Role;

    // 2. Vérification unicité email
    const existing = await this.prisma.user.findUnique({ where: { U_Email } });
    if (existing) throw new ConflictException('Cet email est déjà utilisé.');

    // 3. Sécurité : Hachage
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(U_Password || 'Qualisoft2026!', salt);

    try {
      return await this.genericCrud.create(this.model, tenantId, {
        ...rest,
        U_Email,
        U_PasswordHash: hashedPassword,
        U_Role: finalRole,
        U_IsActive: true,
        U_FirstLogin: true
      });
    } catch (e: any) {
      this.logger.error(`Erreur création utilisateur: ${e.message}`);
      throw new BadRequestException("Impossible de créer le collaborateur.");
    }
  }

  async findAll(tenantId: string, includeArchived = false) {
    return this.genericCrud.findAll(this.model, tenantId, includeArchived);
  }

  async findOne(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { U_Id: id, tenantId, U_IsActive: true },
      include: { U_Site: true, U_OrgUnit: true }
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return user;
  }

  async update(id: string, tenantId: string, dto: any) {
    const updateData = { ...dto };

    if (updateData.U_Password) {
      const salt = await bcrypt.genSalt(10);
      updateData.U_PasswordHash = await bcrypt.hash(updateData.U_Password, salt);
      delete updateData.U_Password;
    }

    if (updateData.U_Role) {
      const roleMapping: Record<string, string> = {
        "Pilote de Processus": "PILOTE",
        "Administrateur SMI": "ADMIN",
        "Co-Pilote": "COPILOTE",
      };
      updateData.U_Role = roleMapping[updateData.U_Role] || updateData.U_Role;
    }

    return this.genericCrud.update(this.model, id, tenantId, updateData);
  }

  async remove(id: string, tenantId: string) {
    return this.genericCrud.delete(this.model, id, tenantId);
  }
}
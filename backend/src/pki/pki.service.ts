import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PkiService {
  constructor(private prisma: PrismaService) {}

  async sign(entityId: string, entityType: string, userId: string, tenantId: string) {
    return this.prisma.signature.create({
      data: {
        SIG_EntityId: entityId,
        SIG_EntityType: entityType,
        SIG_UserId: userId,
        tenantId: tenantId,
        SIG_Hash: 'HASH_SHA256_STUB'
      }
    });
  }
}
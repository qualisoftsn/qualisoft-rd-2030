import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  Param, 
  Delete, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('formations')
export class FormationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getFormations(@Query('tenantId') tenantId: string) {
    if (!tenantId) {
      throw new HttpException('TenantId est requis', HttpStatus.BAD_REQUEST);
    }

    return this.prisma.formation.findMany({
      where: { tenantId: tenantId },
      include: {
        FOR_User: {
          select: {
            U_Id: true,
            U_FirstName: true,
            U_LastName: true,
          },
        },
      },
      orderBy: { FOR_Expiry: 'asc' },
    });
  }

  @Post()
  async createFormation(@Body() body: any) {
    try {
      const { FOR_Title, FOR_Date, FOR_Expiry, FOR_UserId, tenantId } = body;

      // Calcul du statut
      const status = FOR_Expiry && new Date(FOR_Expiry) < new Date() ? 'EXPIRE' : 'VALIDE';

      return await this.prisma.formation.create({
        data: {
          FOR_Title,
          FOR_Date: new Date(FOR_Date),
          FOR_Expiry: FOR_Expiry ? new Date(FOR_Expiry) : null,
          FOR_Status: status,
          FOR_UserId,
          tenantId,
        },
      });
    } catch (error: any) {
      // ✅ Correction de l'erreur TS18046
      throw new HttpException(
        "Erreur lors de la création de la formation : " + (error.message || "Erreur serveur"),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteFormation(@Param('id') id: string) {
    return this.prisma.formation.delete({
      where: { FOR_Id: id },
    });
  }
}
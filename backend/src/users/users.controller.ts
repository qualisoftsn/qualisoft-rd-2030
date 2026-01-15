import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service'; // ✅ Import nécessaire

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  // ✅ Injection correcte de PrismaService pour éviter les crashs sur findAll
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService 
  ) {}

  @Post()
  async create(@Request() req, @Body() createUserDto: any) {
    const tenantId = req.user.tenantId;
    return this.usersService.create(tenantId, createUserDto);
  }

  /**
   * ✅ NOUVELLE ROUTE : Pour la liste des pilotes dans la cartographie
   * Cette route est indispensable pour remplir ton formulaire de processus
   */
  @Get('pilotes')
  async findPilotes(@Request() req) {
    return this.prisma.user.findMany({
      where: { 
        tenantId: req.user.tenantId,
        // On récupère ceux qui ont les droits de pilotage
        U_Role: { in: ['PILOTE', 'ADMIN', 'SUPER_ADMIN'] }
      },
      select: {
        U_Id: true,
        U_FirstName: true,
        U_LastName: true,
      }
    });
  }

  @Get()
  async findAll(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.prisma.user.findMany({
      where: { tenantId: tenantId },
      include: {
        U_Site: true,
        U_OrgUnit: {
          include: { OU_Type: true }
        }
      }
    });
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    return this.prisma.user.update({
      where: { 
        U_Id: id, 
        tenantId: req.user.tenantId 
      },
      data: { U_IsActive: false }
    });
  }
}
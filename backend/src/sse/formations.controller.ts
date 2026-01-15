import { Controller, Get, Post, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('formations')
export class FormationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getFormations(@Query('tenantId') tenantId: string) {
    if (!tenantId) throw new HttpException('TenantId requis', HttpStatus.BAD_REQUEST);
    return this.prisma.formation.findMany({
      where: { tenantId: tenantId },
      include: { FOR_User: true },
      orderBy: { FOR_Date: 'asc' },
    });
  }

  @Post()
  async create(@Body() body: any) {
    return this.prisma.formation.create({
      data: {
        ...body,
        FOR_Date: new Date(body.FOR_Date),
        FOR_Expiry: body.FOR_Expiry ? new Date(body.FOR_Expiry) : null,
      },
    });
  }
}
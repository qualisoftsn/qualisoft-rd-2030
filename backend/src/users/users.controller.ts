import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Request, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService 
  ) {}

  @Post()
  async create(@Request() req, @Body() createUserDto: any) {
    return this.usersService.create(req.user.tenantId, createUserDto);
  }

  @Get('pilotes')
  async findPilotes(@Request() req) {
    return this.prisma.user.findMany({
      where: { 
        tenantId: req.user.tenantId,
        U_IsActive: true,
        U_Role: { in: ['PILOTE', 'ADMIN', 'SUPER_ADMIN'] }
      },
      select: { U_Id: true, U_FirstName: true, U_LastName: true }
    });
  }

  @Get()
  async findAll(@Request() req, @Query('all') all: string) {
    return this.usersService.findAll(req.user.tenantId, all === 'true');
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Request() req, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    return this.usersService.remove(id, req.user.tenantId);
  }
}
import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Gouvernance - COPIL & Revues')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  @ApiOperation({ summary: 'Planifier une nouvelle instance (COPIL/Revue)' })
  create(@Body() data: any, @Request() req) {
    return this.meetingsService.create(data, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer le calendrier des instances' })
  findAll(@Request() req) {
    return this.meetingsService.findAll(req.user.tenantId);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Enregistrer le compte-rendu et clôturer' })
  close(@Param('id') id: string, @Body() data: { report: string }, @Request() req) {
    return this.meetingsService.closeMeeting(id, data.report, req.user.tenantId);
  }
}
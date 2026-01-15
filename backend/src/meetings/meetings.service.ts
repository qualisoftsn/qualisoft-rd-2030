import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, T_Id: string) {
    return this.prisma.meeting.create({
      data: {
        MG_Title: data.title,
        MG_Actions: data.description,
        MG_Date: new Date(data.date),
        MG_Status: data.status,
        tenantId: T_Id
      }
    });
  }

  // Ajout de la méthode findAll manquante
  async findAll(T_Id: string) {
    return this.prisma.meeting.findMany({
      where: { tenantId: T_Id },
      include: { MG_Processus: true }
    });
  }

  async closeMeeting(MG_Id: string, report: string, T_Id: string) {
    return this.prisma.meeting.updateMany({
      where: { MG_Id, tenantId: T_Id },
      data: {
        MG_Status: 'TERMINE',
        MG_Report: report
      }
    });
  }
}
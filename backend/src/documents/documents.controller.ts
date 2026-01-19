import { 
  Controller, Get, Post, Body, UseGuards, Req, Param, 
  Patch, UseInterceptors, UploadedFile, BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/documents',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `DOC-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 }
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Req() req: any) {
    if (!file) throw new BadRequestException("Aucun fichier reçu.");

    const documentData = {
      ...body,
      DV_FileName: file.originalname,
      DV_FileUrl: file.path,
      DV_FileSize: file.size
    };

    return this.documentsService.create(documentData, req.user.tenantId, req.user.U_Id);
  }

  @Post(':id/revise')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/documents',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `REV-${uniqueSuffix}${extname(file.originalname)}`);
      },
    })
  }))
  async reviseFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) throw new BadRequestException("Fichier de révision manquant.");

    const revisionData = {
      DV_FileName: file.originalname,
      DV_FileUrl: file.path,
      DV_FileSize: file.size
    };

    return this.documentsService.createNewVersion(id, revisionData, req.user.tenantId, req.user.U_Id);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.documentsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.documentsService.findOne(id, req.user.tenantId);
  }
}
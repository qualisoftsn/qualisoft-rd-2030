import {
  BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus,
  NotFoundException, Param, Patch, Post, Query, Req, Res, StreamableFile,
  UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CreateRevisionDto } from './dto/revision.dto';
import { ApprovalDto } from './dto/approval.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';

// --- CONFIGURATION MULTER AVEC ISOLATION PAR TENANT ---
const storage = (prefix: string) => diskStorage({
  destination: (req: any, file, cb) => {
    const tenantId = req.user?.tenantId || 'default';
    const uploadPath = join('.', 'uploads', 'documents', tenantId);

    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${prefix}-${uniqueSuffix}${extname(safeName)}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedMimes.includes(file.mimetype)) cb(null, true);
  else cb(new BadRequestException('Format non supporté. PDF ou Word uniquement.'), false);
};

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('stats')
  async getStats(@Req() req: any) {
    return this.documentsService.getStats(req.user.tenantId);
  }

  @Get('iso')
  async findAllIso(@Req() req: any, @Query() filters: QueryDocumentsDto) {
    return this.documentsService.findAllIso(req.user.tenantId, filters);
  }

  @Get()
  async findAll(@Req() req: any, @Query() filters: QueryDocumentsDto) {
    return this.documentsService.findAll(req.user.tenantId, filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.documentsService.findOne(id, req.user.tenantId);
  }

  @Get(':id/preview')
  async preview(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    return this.documentsService.getFileForPreview(id, req.user.tenantId, res);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: storage('DOC'), fileFilter }))
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@UploadedFile() file: Express.Multer.File, @Body() createDto: CreateDocumentDto, @Req() req: any) {
    if (!file) throw new BadRequestException("Fichier requis.");
    return this.documentsService.create(createDto, file, req.user.tenantId, req.user.U_Id);
  }

  @Post('uploads')
  @UseInterceptors(FileInterceptor('file', { storage: storage('DOC'), fileFilter }))
  async uploadIso(@UploadedFile() file: Express.Multer.File, @Body('metadata') metadataString: string, @Req() req: any) {
    if (!file) throw new BadRequestException("Fichier manquant.");
    const metadata = JSON.parse(metadataString) as CreateDocumentDto;
    return this.documentsService.create(metadata, file, req.user.tenantId, req.user.U_Id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateDocumentDto, @Req() req: any) {
    return this.documentsService.update(id, dto, req.user.tenantId);
  }

  @Post(':id/revise')
  @UseInterceptors(FileInterceptor('file', { storage: storage('REV'), fileFilter }))
  async revise(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() revisionDto: CreateRevisionDto, @Req() req: any) {
    if (!file) throw new BadRequestException("Fichier requis.");
    return this.documentsService.createNewVersion(id, revisionDto, file, req.user.tenantId, req.user.U_Id);
  }

  @Post(':id/versions/:versionId/approve')
  async approve(@Param('id') id: string, @Param('versionId') versionId: string, @Body() approvalDto: ApprovalDto, @Req() req: any) {
    return this.documentsService.approveVersion(id, versionId, approvalDto, req.user.tenantId, req.user.U_Id);
  }

  @Get(':id/versions/:versionId/download')
  async downloadVersion(@Param('id') id: string, @Param('versionId') versionId: string, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    const { stream, fileName, fileSize, contentType } = await this.documentsService.downloadVersion(id, versionId, req.user.tenantId);
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      'Content-Length': fileSize
    });
    return stream;
  }

  @Post('bulk-download')
  @HttpCode(HttpStatus.OK)
  async bulkDownload(@Body('ids') ids: string[], @Req() req: any, @Res() res: Response) {
    return this.documentsService.bulkDownload(ids, req.user.tenantId, res);
  }

  @Delete(':id')
  async archive(@Param('id') id: string, @Req() req: any) {
    return this.documentsService.archive(id, req.user.tenantId, req.user.U_Id);
  }
}
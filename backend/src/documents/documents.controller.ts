import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CreateRevisionDto } from './dto/revision.dto';
import { ApprovalDto } from './dto/approval.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';

// --- CONFIGURATION DU STOCKAGE PHYSIQUE (§7.5.3.2) ---
const storage = (prefix: string) => diskStorage({
  destination: './uploads/documents',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${prefix}-${uniqueSuffix}${extname(safeName)}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedMimes.includes(file.mimetype)) cb(null, true);
  else cb(new BadRequestException('Format non supporté. PDF ou Word uniquement.'), false);
};

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /** 📊 KPIs : Statistiques de la GED */
  @Get('stats')
  async getStats(@Req() req: any) {
    return this.documentsService.getStats(req.user.tenantId);
  }

  /** 📋 Liste ISO : Route appelée par le Frontend au chargement */
  @Get('iso')
  async findAllIso(@Req() req: any, @Query() filters: QueryDocumentsDto) {
    return this.documentsService.findAllIso(req.user.tenantId, filters);
  }

  /** 🔍 Recherche : Vue standard des documents */
  @Get()
  async findAll(@Req() req: any, @Query() filters: QueryDocumentsDto) {
    return this.documentsService.findAll(req.user.tenantId, filters);
  }

  /** 📄 Détails : Lecture d'un document spécifique */
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.documentsService.findOne(id, req.user.tenantId);
  }

  /** 👁️ Aperçu : Visualisation du fichier (PDF Inline) */
  @Get(':id/preview')
  async preview(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    return this.documentsService.getFileForPreview(id, req.user.tenantId, res);
  }

  /** 🏗️ Création : Upload standard (JSON Body) */
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: storage('DOC'),
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
  }))
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @UploadedFile() file: Express.Multer.File, 
    @Body() createDto: CreateDocumentDto, 
    @Req() req: any
  ) {
    if (!file) throw new BadRequestException("Le fichier binaire est requis.");
    return this.documentsService.create(createDto, file, req.user.tenantId, req.user.U_Id);
  }

  /** 🚀 Upload ISO : Gère le FormData du Frontend (JSON Stringified) */
  @Post('upload-iso')
  @UseInterceptors(FileInterceptor('file', {
    storage: storage('DOC'),
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
  }))
  async uploadIso(
    @UploadedFile() file: Express.Multer.File,
    @Body('metadata') metadataString: string,
    @Req() req: any
  ) {
    if (!file) throw new BadRequestException("Fichier manquant.");
    if (!metadataString) throw new BadRequestException("Métadonnées manquantes.");
    
    try {
      const metadata = JSON.parse(metadataString) as CreateDocumentDto;
      return this.documentsService.create(metadata, file, req.user.tenantId, req.user.U_Id);
    } catch (e) {
      throw new BadRequestException("Format des métadonnées invalide.");
    }
  }

  /** 📝 Mise à jour : Modification des métadonnées (Niveau §7.5.3) */
  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string, 
    @Body() dto: UpdateDocumentDto, 
    @Req() req: any
  ) {
    return this.documentsService.update(id, dto, req.user.tenantId);
  }

  /** 🔄 Révision : Création d'une nouvelle version majeure */
  @Post(':id/revise')
  @UseInterceptors(FileInterceptor('file', {
    storage: storage('REV'),
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
  }))
  async revise(
    @Param('id') id: string, 
    @UploadedFile() file: Express.Multer.File, 
    @Body() revisionDto: CreateRevisionDto, 
    @Req() req: any
  ) {
    if (!file) throw new BadRequestException("Fichier de révision requis.");
    return this.documentsService.createNewVersion(id, revisionDto, file, req.user.tenantId, req.user.U_Id);
  }

  /** ✅ Approbation : Validation du document par un responsable */
  @Post(':id/versions/:versionId/approve')
  async approve(
    @Param('id') id: string, 
    @Param('versionId') versionId: string, 
    @Body() approvalDto: ApprovalDto, 
    @Req() req: any
  ) {
    return this.documentsService.approveVersion(id, versionId, approvalDto, req.user.tenantId, req.user.U_Id);
  }

  /** 📥 Download : Récupération physique du fichier */
  @Get(':id/versions/:versionId/download')
  async downloadVersion(
    @Param('id') id: string, 
    @Param('versionId') versionId: string, 
    @Req() req: any, 
    @Res({ passthrough: true }) res: Response
  ) {
    const { stream, fileName, fileSize, contentType } = await this.documentsService.downloadVersion(id, versionId, req.user.tenantId);
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      'Content-Length': fileSize
    });
    return stream;
  }

  /** 📦 Bulk : Téléchargement groupé au format ZIP */
  @Post('bulk-download')
  @HttpCode(HttpStatus.OK)
  async bulkDownload(@Body('ids') ids: string[], @Req() req: any, @Res() res: Response) {
    if (!Array.isArray(ids) || ids.length === 0) throw new BadRequestException("Sélection vide.");
    return this.documentsService.bulkDownload(ids, req.user.tenantId, res);
  }

  /** 📁 Archivage : Retrait du master actif (§7.5.3.2) */
  @Delete(':id')
  async archive(@Param('id') id: string, @Req() req: any) {
    return this.documentsService.archive(id, req.user.tenantId, req.user.U_Id);
  }
}
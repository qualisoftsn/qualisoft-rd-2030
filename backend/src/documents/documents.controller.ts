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
      destination: './uploads/documents', // Dossier physique sur le serveur
      filename: (req, file, cb) => {
        // On génère un nom unique : DOC-Timestamp-Random.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 } // Limite 10MB
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Req() req) {
    if (!file) throw new BadRequestException("Aucun fichier n'a été téléchargé.");

    // On prépare les données pour le service
    const documentData = {
      ...body,
      DV_FileName: file.originalname,
      DV_FileUrl: file.path, // Le chemin relatif vers le fichier
      DV_FileSize: file.size,
      DV_Checksum: file.filename, // On utilise le nom unique comme identifiant
    };

    return this.documentsService.create(documentData, req.user.tenantId, req.user.U_Id);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.documentsService.findAll(req.user.tenantId);
  }
}
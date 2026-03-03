/**
 * 🛰️ MODULE : FilesController.ts
 * -------------------------------------------------------------------------
 * RÔLE : Point d'entrée pour l'upload de fichiers tiers (Preuves, Pièces).
 * RÉVISION : 04 Mars 2026 | 09:15 GMT
 */

import { 
  Controller, Post, UseInterceptors, UploadedFile, 
  UseGuards, BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Aucun fichier détecté dans le flux.");

    return {
      url: `/uploads/general/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype
    };
  }
}
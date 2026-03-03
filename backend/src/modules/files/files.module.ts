/**
 * 🛰️ MODULE : FilesModule.ts
 * -------------------------------------------------------------------------
 * RÔLE : Gestion du stockage physique et de l'intégrité des fichiers.
 * CONFIG : Multer Engine avec isolation par horodatage.
 * RÉVISION : 04 Mars 2026 | 09:10 GMT
 */

import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads', 'general');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          cb(null, `FILE-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10 Mo
    }),
  ],
  controllers: [FilesController],
})
export class FilesModule {}
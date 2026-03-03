/**
 * 🛰️ MODULE : FilesService.ts
 * -------------------------------------------------------------------------
 * RÔLE : Gestion du cycle de vie physique des fichiers (SMI Matrix).
 * FONCTIONS : Résolution de chemins, Nettoyage des orphelins, Sécurité.
 * RÉVISION : 04 Mars 2026 | 10:10 GMT
 * -------------------------------------------------------------------------
 */

import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly uploadRoot = join(process.cwd(), 'uploads');

  constructor(private configService: ConfigService) {}

  /**
   * 🔍 RÉSOLUTION D'URL SOUVERAINE
   * Convertit un chemin relatif de base de données en URL absolue pour le Frontend.
   */
  generatePublicUrl(filename: string, subFolder: string = 'general'): string {
    const baseUrl = this.configService.get('API_URL') || 'http://localhost:9000';
    return `${baseUrl}/uploads/${subFolder}/${filename}`;
  }

  /**
   * 🛡️ VÉRIFICATION D'INTÉGRITÉ
   * Vérifie si le fichier existe réellement sur le disque du Kernel.
   */
  validateFileExists(filename: string, subFolder: string = 'general'): boolean {
    const fullPath = join(this.uploadRoot, subFolder, filename);
    return existsSync(fullPath);
  }

  /**
   * 🗑️ PROTOCOLE DE SUPPRESSION (Nettoyage Matrix)
   * Supprime physiquement un fichier pour éviter la saturation du stockage.
   * Utilisé lors de la suppression d'une Preuve ou d'une version de Document.
   */
  async deletePhysicalFile(filename: string, subFolder: string = 'general'): Promise<void> {
    const fullPath = join(this.uploadRoot, subFolder, filename);

    try {
      if (existsSync(fullPath)) {
        unlinkSync(fullPath);
        this.logger.log(`[NETTOYAGE] Fichier supprimé avec succès : ${filename}`);
      } else {
        this.logger.warn(`[ATTENTION] Tentative de suppression d'un fichier inexistant : ${filename}`);
      }
    } catch (error) {
      this.logger.error(`Erreur : ${error instanceof Error ? error.message : 'Erreur Inconnue'}`);
      throw new InternalServerErrorException("Rupture lors de l'épuration du stockage.");
    }
  }

  /**
   * 📁 RÉCUPÉRATION DU CHEMIN ABSOLU
   * Utile pour les flux de téléchargement (StreamableFile).
   */
  getAbsoluteInternalPath(filename: string, subFolder: string = 'general'): string {
    const path = join(this.uploadRoot, subFolder, filename);
    if (!existsSync(path)) {
      throw new NotFoundException("La ressource physique est introuvable sur ce nœud.");
    }
    return path;
  }
}
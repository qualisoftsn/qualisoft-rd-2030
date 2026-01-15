import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import { EmailService } from '../../common/email.service'; // ✅ Chemin vérifié

const execPromise = promisify(exec);

@Injectable()
export class BackupTaskService implements OnModuleInit {
  private readonly logger = new Logger('BACKUP_SYSTEM');
  private readonly backupFolder = join(process.cwd(), 'backups');
  private readonly MASTER_EMAIL = 'ab.thiongane@qualisoft.sn';

  constructor(private emailService: EmailService) {}

  onModuleInit() {
    if (!existsSync(this.backupFolder)) {
      mkdirSync(this.backupFolder, { recursive: true });
      this.logger.log('📁 Dossier de sauvegarde initialisé à la racine.');
    }
  }

  /**
   * 🛡️ UNITÉ DE SAUVEGARDE NUCLÉAIRE
   * Fréquence : Chaque nuit à 03:00 (Heure de Dakar)
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async executeFullBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `QUALISOFT_DB_${timestamp}.sql`;
    const filePath = join(this.backupFolder, fileName);
    const compressedPath = `${filePath}.gz`;

    this.logger.log('🚀 Lancement du cycle de maintenance nocturne...');

    try {
      // 1. Extraction via pg_dump (Docker)
      const containerName = process.env.DB_CONTAINER_NAME || 'postgres';
      const dbUser = process.env.DATABASE_USER || 'qualisoft_user';
      const dbName = process.env.DATABASE_NAME || 'qualisoft_db';

      await execPromise(`docker exec ${containerName} pg_dump -U ${dbUser} ${dbName} > ${filePath}`);

      // 2. Compression Gzip
      await execPromise(`gzip -f ${filePath}`);

      this.logger.log(`✅ Noyau Qualisoft sauvegardé et compressé : ${fileName}.gz`);

      // 3. Rotation (Nettoyage des fichiers de plus de 10 jours)
      this.cleanOldBackups(10);

    } catch (error: unknown) {
      // ✅ CORRECTION CRITIQUE : Type Guard pour extraire le message d'erreur proprement
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.logger.error(`❌ ÉCHEC DU BACKUP : ${errorMessage}`);

      // 4. ALERTE MASTER IMMÉDIATE
      await this.emailService.sendMail({
        to: this.MASTER_EMAIL,
        subject: '🚨 ALERTE : Échec de la sauvegarde Qualisoft RD 2030',
        text: `Urgence Master : La sauvegarde nocturne a échoué.\n\nErreur technique : ${errorMessage}\n\nLieu : Villa 247, Cité Cheikh Hann, Dakar.`,
      });
    }
  }

  private cleanOldBackups(retentionDays: number) {
    try {
      const files = readdirSync(this.backupFolder);
      const now = Date.now();

      files.forEach(file => {
        const path = join(this.backupFolder, file);
        const stats = statSync(path);
        const ageInDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);

        if (ageInDays > retentionDays) {
          unlinkSync(path);
          this.logger.warn(`🗑️ Archive obsolète supprimée : ${file}`);
        }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Erreur lors du nettoyage des backups : ${msg}`);
    }
  }

  // Permet à la console Master de lister les archives disponibles
  async getBackupsList() {
    if (!existsSync(this.backupFolder)) return [];
    return readdirSync(this.backupFolder)
      .filter(file => file.endsWith('.gz'))
      .map(file => {
        const stats = statSync(join(this.backupFolder, file));
        return {
          name: file,
          size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
          date: stats.mtime,
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
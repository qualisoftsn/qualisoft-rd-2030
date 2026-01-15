import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
// ✅ Import ajusté (vérifie bien que le dossier est 'common' au même niveau que 'admin')
import { EmailService } from '../../common/email.service'; // ✅ Chemin vérifié

const execPromise = promisify(exec);

@Injectable()
export class BackupTaskService implements OnModuleInit {
  private readonly logger = new Logger('BACKUP_SYSTEM');
  private readonly backupFolder = join(process.cwd(), 'backups');

  constructor(private readonly emailService: EmailService) {}

  onModuleInit() {
    if (!existsSync(this.backupFolder)) {
      mkdirSync(this.backupFolder, { recursive: true });
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async executeFullBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `QUALISOFT_DB_${timestamp}.sql`;
    const filePath = join(this.backupFolder, fileName);

    try {
      const containerName = process.env.DB_CONTAINER_NAME || 'postgres';
      const dbUser = process.env.DATABASE_USER || 'qualisoft_user';
      const dbName = process.env.DATABASE_NAME || 'qualisoft_db';

      // 1. pg_dump
      await execPromise(`docker exec ${containerName} pg_dump -U ${dbUser} ${dbName} > ${filePath}`);
      // 2. gzip
      await execPromise(`gzip -f ${filePath}`);
      
      this.logger.log(`✅ Backup réussi : ${fileName}.gz`);
      this.cleanOldBackups(10);

    } catch (error: unknown) {
      // ✅ Correction définitive de error.message
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ ÉCHEC DU BACKUP : ${errorMessage}`);
      
      await this.emailService.sendMail({
        to: 'ab.thiongane@qualisoft.sn',
        subject: '🚨 ALERTE : Échec Sauvegarde Qualisoft',
        text: `Urgence Master : La sauvegarde nocturne a échoué.\nErreur technique : ${errorMessage}`,
      });
    }
  }

  private cleanOldBackups(retentionDays: number) {
    try {
      const files = readdirSync(this.backupFolder);
      const now = Date.now();
      files.forEach(file => {
        const path = join(this.backupFolder, file);
        const age = (now - statSync(path).mtimeMs) / (1000 * 60 * 60 * 24);
        if (age > retentionDays) unlinkSync(path);
      });
    } catch (err: unknown) {
      this.logger.error("Erreur nettoyage backups");
    }
  }

  async getBackupsList() {
    if (!existsSync(this.backupFolder)) return [];
    return readdirSync(this.backupFolder).map(file => {
      const stats = statSync(join(this.backupFolder, file));
      return { name: file, size: (stats.size / 1024 / 1024).toFixed(2) + ' MB', date: stats.mtime };
    });
  }
}
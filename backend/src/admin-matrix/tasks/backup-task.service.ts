/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ SERVICE : BackupTaskService
 * RÔLE : Gestion des backups automatisés de la base de données
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class BackupTaskService {
  private readonly logger = new Logger(BackupTaskService.name);
  private readonly backupDir = process.env.BACKUP_PATH || '/var/backups/qualisoft';
  private readonly dbHost = process.env.DATABASE_HOST || 'localhost';
  private readonly dbName = process.env.DATABASE_NAME || 'qualisoft';
  private readonly dbUser = process.env.DATABASE_USER || 'qualisoft_user';

  /**
   * 🕐 BACKUP QUOTIDIEN (3h du matin)
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailyBackup(): Promise<void> {
    this.logger.log('🔄 Démarrage du backup quotidien...');
    
    try {
      await this.ensureBackupDir();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupDir, `qualisoft_${timestamp}.sql`);
      
      // Commande pg_dump
      const command = `PGPASSWORD=${process.env.DATABASE_PASSWORD} pg_dump -h ${this.dbHost} -U ${this.dbUser} ${this.dbName} > ${backupFile}`;
      
      await execAsync(command);
      
      // Compression
      await execAsync(`gzip ${backupFile}`);
      
      // Nettoyage des backups de plus de 30 jours
      await this.cleanupOldBackups();
      
      this.logger.log(`✅ Backup terminé : ${backupFile}.gz`);
    } catch (error) {
      this.logger.error('❌ Échec du backup:', error);
      throw error;
    }
  }

  /**
   * 🧹 NETTOYAGE DES ANCIENS BACKUPS
   */
  private async cleanupOldBackups(): Promise<void> {
    const files = fs.readdirSync(this.backupDir);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    for (const file of files) {
      if (!file.endsWith('.sql.gz')) continue;
      
      const filePath = path.join(this.backupDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtimeMs < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        this.logger.log(`🗑️ Ancien backup supprimé : ${file}`);
      }
    }
  }

  /**
   * 📁 CRÉATION DU RÉPERTOIRE DE BACKUP
   */
  private async ensureBackupDir(): Promise<void> {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true, mode: 0o700 });
      this.logger.log(`📁 Répertoire créé : ${this.backupDir}`);
    }
  }

  /**
   * 📥 RESTAURER UN BACKUP (manuel)
   */
  async restoreBackup(backupFile: string): Promise<void> {
    this.logger.log(`🔄 Restauration depuis : ${backupFile}`);
    
    try {
      const command = `PGPASSWORD=${process.env.DATABASE_PASSWORD} psql -h ${this.dbHost} -U ${this.dbUser} ${this.dbName} < ${backupFile}`;
      await execAsync(command);
      this.logger.log('✅ Restauration terminée');
    } catch (error) {
      this.logger.error('❌ Échec de la restauration:', error);
      throw error;
    }
  }

  /**
   * 📋 LISTER LES BACKUPS DISPONIBLES
   */
  async listBackups(): Promise<{ filename: string; size: string; date: string }[]> {
    const files = fs.readdirSync(this.backupDir)
      .filter(f => f.endsWith('.sql.gz'))
      .map(file => {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
          date: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return files;
  }
}
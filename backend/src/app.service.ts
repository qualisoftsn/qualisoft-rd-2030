import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getSystemStatus() {
    return {
      status: 'OK',
      version: '2.0.0-SaaS',
      engine: 'Qualisoft MS',
      timestamp: new Date().toISOString()
    };
  }
}
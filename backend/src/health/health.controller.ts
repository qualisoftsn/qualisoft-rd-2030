import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      platform: 'Qualisoft Elite RD-2030',
      node_env: process.env.NODE_ENV
    };
  }
}
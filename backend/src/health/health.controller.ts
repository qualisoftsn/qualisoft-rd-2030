import { Controller, Get } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';

// On utilise souvent ce décorateur pour bypasser le Guard JWT global
const Public = () => SetMetadata('isPublic', true);

@Controller('health')
export class HealthController {
  @Public() // Indique au Guard de laisser passer cette requête
  @Get()
  check() {
    return { 
        status: 'ok', 
        message: 'Qualisoft Elite API is live',
        timestamp: new Date().toISOString() 
    };
  }
}
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Injecté par JwtStrategy

    // 🛡️ On utilise les clés U_Role et tenantId définies dans JwtStrategy
    if (user && user.U_Role !== 'SUPER_ADMIN') {
      const tid = user.tenantId;

      // 1. On injecte dans les paramètres de requête (pour les GET)
      request.query.tenantId = tid;

      // 2. On injecte dans le corps (pour les POST/PUT/PATCH)
      if (request.body) {
        // Attention : Si tes DTOs attendent "tenantId" ou "tenantId", 
        // il faudra veiller à ce que tes services fassent le lien.
        request.body.tenantId = tid; 
      }
      
      console.log(`[TenantInterceptor] Isolation activée pour le Tenant: ${tid}`);
    }

    return next.handle();
  }
}
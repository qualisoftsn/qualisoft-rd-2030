/**
 * 🛰️ MODULE : TenantInterceptor
 * -------------------------------------------------------------------------
 * RÔLE : Injection forcée du tenantId pour Prisma.
 * RÉVISION : 03 Mars 2026 | 04:30 GMT
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; 

    // 🛡️ On force l'isolation pour tout utilisateur non-Master
    if (user && user.U_Role !== 'SUPER_ADMIN') {
      const tid = user.tenantId;

      // 1. Injection Query (GET)
      request.query.tenantId = tid;
      request.query.T_Id = tid;

      // 2. Injection Body (POST/PUT/PATCH)
      if (request.body) {
        request.body.tenantId = tid;
        request.body.T_Id = tid;
      }
    }

    return next.handle();
  }
}
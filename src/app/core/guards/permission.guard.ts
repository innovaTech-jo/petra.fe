import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function permissionGuard(permissionGuid: string): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/internal/login']);
    }
    if (auth.hasPermission(permissionGuid)) {
      return true;
    }
    return router.createUrlTree(['/internal']);
  };
}

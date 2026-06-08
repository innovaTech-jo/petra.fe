import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

import { PermissionId } from '../../shared/enums';

export function permissionGuard(permission: PermissionId): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/internal/login']);
    }
    if (auth.hasPermission(permission)) {
      return true;
    }
    return router.createUrlTree(['/internal']);
  };
}

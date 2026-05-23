import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { ApiBaseService } from './services/api-base.service';

/**
 * Attaches Bearer access token from `dcpUser`, refreshes on 401, retries once.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const api = inject(ApiBaseService);

  const url = req.url.toLowerCase();
  const isLogin = url.includes('/user/login') || url.includes('/reset-password');
  const isRefresh = url.includes('/refresh-token');
  const isAsset = url.includes('/assets/');

  if (isLogin || isRefresh || isAsset) {
    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (isLogin && (error.status === 401 || isTokenExpiredError(error))) {
          localStorage.removeItem('dcpUser');
          router.navigate(['/internal/login']);
        }
        return throwError(() => error);
      })
    );
  }

  let token: string | undefined;
  try {
    token = JSON.parse(localStorage.getItem('dcpUser') ?? '{}')?.token;
  } catch {
    token = undefined;
  }

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const expired = error.status === 401 || isTokenExpiredError(error);
      if (!expired) {
        return throwError(() => error);
      }

      return api.refreshToken().pipe(
        switchMap((tokens) => {
          const raw = localStorage.getItem('dcpUser');
          const user = raw ? JSON.parse(raw) : {};
          user.token = tokens.token;
          if (tokens.refreshToken != null) {
            user.refreshToken = tokens.refreshToken;
          }
          localStorage.setItem('dcpUser', JSON.stringify(user));
          const retry = req.clone({ setHeaders: { Authorization: `Bearer ${tokens.token}` } });
          return next(retry);
        }),
        catchError((refreshErr) => {
          localStorage.removeItem('dcpUser');
          router.navigate(['/internal/login']);
          return throwError(() => refreshErr);
        })
      );
    })
  );
};

function isTokenExpiredError(error: HttpErrorResponse): boolean {
  const body = error?.error;
  const msg =
    typeof body === 'string'
      ? body
      : (body?.message ?? body?.Message ?? body?.data ?? error?.message ?? '');
  const str = typeof msg === 'string' ? msg : JSON.stringify(msg || '');
  return str.includes('IDX10223') || str.includes('Lifetime validation') || str.includes('token expired');
}

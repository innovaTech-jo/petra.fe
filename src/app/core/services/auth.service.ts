import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest, UsersDto } from '../models';
import { ApiBaseService } from './api-base.service';

const SESSION_KEY = 'dcpUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiBaseService);

  readonly sessionUser = signal<UsersDto | null>(this.readSession());

  get permissions(): number[] {
    return this.sessionUser()?.permssions ?? [];
  }

  get token(): string | undefined {
    return this.sessionUser()?.token;
  }

  hasPermission(id: number | string): boolean {
    const perms = this.permissions;
    if (!perms.length) return true;
    return perms.some((p) => p === id || String(p) === String(id));
  }

  login(request: LoginRequest): Observable<UsersDto> {
    return this.api.postAnonymous<LoginRequest, UsersDto>('User/login', request).pipe(
      tap((user) => this.persistSession(user))
    );
  }

  /** Offline demo login — no API call. */
  loginOffline(user: UsersDto): UsersDto {
    this.persistSession(user);
    return user;
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this.sessionUser.set(null);
  }

  persistSession(user: UsersDto): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    this.sessionUser.set(user);
  }

  readSession(): UsersDto | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as UsersDto) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  updateSessionPermissions(permssions: number[]): void {
    const current = this.readSession();
    if (!current) return;
    const next = { ...current, permssions };
    this.persistSession(next);
  }
}

import { SearchParameters } from './models';
import { UsersDto } from './models';
import { Permissions, PermissionId } from '../shared/enums';
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';

/**
 * Shared session + search state for Petra admin screens.
 */
export class GceSoftBase {
  protected readonly auth = inject(AuthService);

  searchParameters: SearchParameters = {
    pagingParameters: { pageNumber: 1, pageSize: 10 },
    totalCount: 0
  };
  readonly systemPermissions = Permissions;

  get currentUser(): UsersDto | null {
    return this.auth.readSession();
  }

  get permissions(): number[] {
    return this.auth.permissions;
  }

  get currentUserId(): number {
    return this.currentUser?.id ?? 0;
  }

  get requesterDisplayName(): string {
    return this.currentUser?.fullName?.trim() ?? '';
  }

  get isArabic(): boolean {
    return (localStorage.getItem('selectedLanguage') ?? 'ar') === 'ar';
  }

  can(permission: PermissionId): boolean {
    return this.auth.hasPermission(permission);
  }

  search(term: string): void {
    this.searchParameters.keyword = term;
  }

  updateSessionFromUser(user: UsersDto): void {
    this.auth.persistSession(user);
  }
}

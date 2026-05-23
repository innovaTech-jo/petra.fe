import { inject, Injectable } from '@angular/core';
import { UsersDto } from './models';
import { UserService } from './services/user.service';

/** Refreshes `dcpUser` from the API user record after login. */
@Injectable({ providedIn: 'root' })
export class SessionProfileSyncService {
  private readonly userService = inject(UserService);

  syncSessionFromUserDirectory(): void {
    const raw = localStorage.getItem('dcpUser');
    if (!raw) return;
    let session: UsersDto;
    try {
      session = JSON.parse(raw) as UsersDto;
    } catch {
      return;
    }
    const userId = session.id?.trim();
    if (!userId) return;

    this.userService.getById(userId).subscribe({
      next: (u) => {
        const cur = localStorage.getItem('dcpUser');
        if (!cur) return;
        let s: UsersDto;
        try {
          s = JSON.parse(cur) as UsersDto;
        } catch {
          return;
        }
        if (s.id?.trim() !== userId) return;
        s.fullName = u.fullName ?? s.fullName;
        s.userName = u.userName ?? s.userName;
        s.email = u.email ?? s.email;
        s.active = u.active ?? s.active;
        s.permssions = u.permssions?.length ? u.permssions : s.permssions;
        s.userRoles = u.userRoles ?? s.userRoles;
        s.userGroups = u.userGroups ?? s.userGroups;
        localStorage.setItem('dcpUser', JSON.stringify(s));
      }
    });
  }
}

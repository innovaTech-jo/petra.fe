import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { GceSoftBase } from '../../core/gce-soft-base';
import {
  ApplicationService,
  GroupService,
  NotificationApiService,
  RoleService,
  SettingService,
  UserService
} from '../../core/services';
import { NotificationService } from '../../core/notification.service';
import { Permissions } from '../../shared/enums';

type StatCard = {
  label: string;
  count: number;
  link: string;
  permission?: string;
};

@Component({
  selector: 'app-dashboard-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css'
})
export class DashboardHomeComponent extends GceSoftBase implements OnInit {
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly groupService = inject(GroupService);
  private readonly applicationService = inject(ApplicationService);
  private readonly notificationServiceApi = inject(NotificationApiService);
  private readonly settingService = inject(SettingService);
  readonly toast = inject(NotificationService);

  loading = true;
  stats: StatCard[] = [];

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    const base = { pagingParameters: { pageNumber: 1, pageSize: 1 }, isByPass: false };

    forkJoin({
      users: this.userService.search({ ...base }),
      roles: this.roleService.search({ ...base }),
      groups: this.groupService.search({ ...base }),
      apps: this.applicationService.search({ ...base }),
      notifications: this.notificationServiceApi.search({ ...base }),
      settings: this.settingService.search({ ...base, term: '' })
    }).subscribe({
      next: (r) => {
        this.stats = [
          { label: '??????????', count: r.users.count, link: '/internal/users', permission: Permissions.Users },
          { label: '???????', count: r.roles.count, link: '/internal/user-roles', permission: Permissions.Roles },
          { label: '?????????', count: r.groups.count, link: '/internal/groups', permission: Permissions.Groups },
          {
            label: '?????????',
            count: r.apps.count,
            link: '/internal/applications',
            permission: Permissions.Applications
          },
          {
            label: '?????????',
            count: r.notifications.count,
            link: '/internal/notifications',
            permission: Permissions.Notifications
          },
          { label: '?????????', count: r.settings.count, link: '/internal/settings', permission: Permissions.Settings }
        ];
        this.loading = false;
      },
      error: (err: Error) => {
        this.loading = false;
        this.toast.showError(err.message || '???? ????? ???????? ???? ??????.');
      }
    });
  }

  visibleStats(): StatCard[] {
    return this.stats.filter((s) => !s.permission || this.can(s.permission));
  }
}

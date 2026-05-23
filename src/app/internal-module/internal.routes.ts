import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { permissionGuard } from '../core/guards/permission.guard';
import { Permissions } from '../shared/enums';
import { ApplicationsComponent } from './applications/applications.component';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { GroupsComponent } from './groups/groups.component';
import { InternalLayoutComponent } from './internal-layout/internal-layout.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { NotificationsPageComponent } from './notifications/notifications-page.component';
import { SettingsComponent } from './settings/settings.component';
import { UserRoleComponent } from './user-role/user-role.component';
import { UsersCrudComponent } from './users-crud/users-crud.component';

export const internalRoutes: Routes = [
  { path: 'login', component: LoginPageComponent },
  {
    path: '',
    component: InternalLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardHomeComponent },
      {
        path: 'users',
        component: UsersCrudComponent,
        canActivate: [permissionGuard(Permissions.Users)]
      },
      {
        path: 'user-roles',
        component: UserRoleComponent,
        canActivate: [permissionGuard(Permissions.Roles)]
      },
      {
        path: 'groups',
        component: GroupsComponent,
        canActivate: [permissionGuard(Permissions.Groups)]
      },
      {
        path: 'applications',
        component: ApplicationsComponent,
        canActivate: [permissionGuard(Permissions.Applications)]
      },
      {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [permissionGuard(Permissions.Settings)]
      },
      {
        path: 'notifications',
        component: NotificationsPageComponent,
        canActivate: [permissionGuard(Permissions.Notifications)]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];

import { Routes } from '@angular/router';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { InternalLayoutComponent } from './internal-layout/internal-layout.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { UserRoleComponent } from './user-role/user-role.component';
import { RoleFormComponent } from './user-role/role-form/role-form.component';
import { UserFormComponent } from './users-crud/user-form/user-form.component';
import { UsersCrudComponent } from './users-crud/users-crud.component';
import { IntegrationTypesComponent } from './integration-types/integration-types.component';
import { AttachmentTypesComponent } from './attachment-types/attachment-types.component';
import { RequestTypesComponent } from './request-types/request-types.component';
import { RequestTypeFormComponent } from './request-types/request-type-form/request-type-form.component';
import { WorkflowFormComponent } from './workflow-definition/workflow-form/workflow-form.component';

export const internalRoutes: Routes = [
  { path: 'login', component: LoginPageComponent },
  {
    path: '',
    component: InternalLayoutComponent,
    children: [
      { path: '', component: DashboardHomeComponent },
      { path: 'users/new', component: UserFormComponent },
      { path: 'users/:id/edit', component: UserFormComponent },
      { path: 'users', component: UsersCrudComponent },
      { path: 'user-roles/new', component: RoleFormComponent },
      { path: 'user-roles/:id/edit', component: RoleFormComponent },
      { path: 'user-roles', component: UserRoleComponent },
      { path: 'integration-types', component: IntegrationTypesComponent },
      { path: 'attachment-types', component: AttachmentTypesComponent },
      { path: 'request-types/new', component: RequestTypeFormComponent },
      { path: 'request-types/:id/edit', component: RequestTypeFormComponent },
      { path: 'request-types/:requestTypeId/workflow', component: WorkflowFormComponent },
      { path: 'request-types', component: RequestTypesComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];

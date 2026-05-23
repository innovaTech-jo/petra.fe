import { Routes } from '@angular/router';
import { ExternalHomeComponent } from './external-home/external-home.component';
import { ExternalLayoutComponent } from './external-layout/external-layout.component';
import { ExternalLoginComponent } from './external-login/external-login.component';
import { ExternalRequestsComponent } from './external-requests/external-requests.component';

export const externalRoutes: Routes = [
  { path: 'login', component: ExternalLoginComponent },
  {
    path: '',
    component: ExternalLayoutComponent,
    children: [
      { path: '', component: ExternalHomeComponent },
      { path: 'requests', component: ExternalRequestsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];

import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'internal' },
  {
    path: 'internal',
    loadChildren: () => import('./internal-module/internal.routes').then((m) => m.internalRoutes)
  },
  {
    path: 'external',
    loadChildren: () => import('./external-module/external.routes').then((m) => m.externalRoutes)
  },
  { path: '**', redirectTo: 'internal' }
];

import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

    {
    path: 'login',
    // canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    // canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'dashboard',
    // canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },

  {
    path: 'search',
    // canActivate: [authGuard],
    loadComponent: () => import('./features/search/search').then((m) => m.Search),
  },

  {
    path: 'projects',
    // canActivate: [authGuard],
    children: [
        {
        path: '',
        loadComponent: () =>
          import('./features/projects/project-list/project-list').then(
            (m) => m.ProjectList
          ),
      },
      {
        path: 'new',
        // canActivate: [roleGuard(['admin', 'manager'])],
        loadComponent: () =>
          import('./features/projects/project-create/project-create').then(
            (m) => m.ProjectCreate
          ),
      },
    ]
  }


];

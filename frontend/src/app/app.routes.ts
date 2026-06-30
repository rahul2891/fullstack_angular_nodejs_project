import { Routes } from '@angular/router';
import { projectResolver } from './core/guards/project.resolver';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

    {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },

  {
    path: 'search',
    canActivate: [authGuard],
    loadComponent: () => import('./features/search/search').then((m) => m.Search),
  },

  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
  },

  {
    path: 'projects',
    canActivate: [authGuard],
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
        canActivate: [roleGuard(['admin', 'manager'])],
        loadComponent: () =>
          import('./features/projects/project-create/project-create').then(
            (m) => m.ProjectCreate
          ),
      },
      {
        path: ':projectId/board',
        resolve: { project: projectResolver},
        loadComponent: () => import('./features/board/board').then((m) => m.Board),
      },
      {
        path: ':projectId/issues/new',
        loadComponent: () =>
          import('./features/issue-create/issue-create').then((m) => m.IssueCreate),
      },
      {
        path: ':projectId/issues/:issueId',
        loadComponent: () =>
          import('./features/issue-detail/issue-detail').then((m) => m.IssueDetail),
      },
    ]
  }


];

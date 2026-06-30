import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { EMPTY, catchError, map, take, tap } from 'rxjs';
import { ProjectsApiService } from '../services/projects-api.service';
import { Project } from '../models/domain.models';
import { IssuesActions } from '../../store/issues/issues.actions';

export const projectResolver: ResolveFn<Project | null> = (route) => {
  const projectsApi = inject(ProjectsApiService);
  const store = inject(Store);
  const router = inject(Router);

  const projectId = route.paramMap.get('projectId');
  if (!projectId) {
    router.navigate(['/projects']);
    return EMPTY;
  }

  // Kick off loading this project's issues into the store immediately -
  // the board component will pick them up via a selector + async pipe.
  store.dispatch(IssuesActions.loadIssues({ filters: { projectId } }));

  return projectsApi.getProject(projectId).pipe(
    take(1),
    map((res) => res.project),
    catchError(() => {
      router.navigate(['/projects']);
      return EMPTY;
    })
  );
};

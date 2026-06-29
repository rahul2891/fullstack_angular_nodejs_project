import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { ProjectsActions } from './projects.actions';
import { ProjectsApiService } from '../../core/services/projects-api.service';
import { NotificationService } from '../../core/services/notification.service';

@Injectable()
export class ProjectsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ProjectsApiService);
  private readonly notifications = inject(NotificationService);

  loadProjects$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectsActions.loadProjects),
      switchMap(() =>
        this.api.getProjects().pipe(
          map((res) => ProjectsActions.loadProjectsSuccess({ projects: res.projects })),
          catchError((err: HttpErrorResponse) =>
            of(ProjectsActions.loadProjectsFailure({ error: err.error?.message || 'Failed to load projects' }))
          )
        )
      )
    )
  );

  createProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectsActions.createProject),
      switchMap(({ payload }) =>
        this.api.createProject(payload).pipe(
          map((res) => ProjectsActions.createProjectSuccess({ project: res.project })),
          catchError((err: HttpErrorResponse) =>
            of(ProjectsActions.createProjectFailure({ error: err.error?.message || 'Failed to create project' }))
          )
        )
      )
    )
  );

  notifyOnCreateSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ProjectsActions.createProjectSuccess),
        tap(({ project }) => this.notifications.success(`Project "${project.name}" created`))
      ),
    { dispatch: false }
  );
}

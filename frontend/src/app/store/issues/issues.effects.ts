import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, exhaustMap, filter, map, of, switchMap } from 'rxjs';
import { IssuesActions } from './issues.actions';
import { IssuesApiService } from '../../core/services/issues-api.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { NotificationService } from '../../core/services/notification.service';

@Injectable()
export class IssuesEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(IssuesApiService);
  private readonly realtime = inject(RealtimeService);
  private readonly notifications = inject(NotificationService);

  loadIssues$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IssuesActions.loadIssues),
      switchMap(({ filters }) =>
        this.api.getIssues(filters).pipe(
          map((res) => IssuesActions.loadIssuesSuccess({ issues: res.issues })),
          catchError((err: HttpErrorResponse) =>
            of(IssuesActions.loadIssuesFailure({ error: err.error?.message || 'Failed to load issues' }))
          )
        )
      )
    )
  );

  createIssue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IssuesActions.createIssue),
      // exhaustMap: ignore further "create" clicks while one is in flight,
      // preventing accidental duplicate issue creation from a double-click.
      exhaustMap(({ payload }) =>
        this.api.createIssue(payload).pipe(
          map((res) => IssuesActions.createIssueSuccess({ issue: res.issue })),
          catchError((err: HttpErrorResponse) =>
            of(IssuesActions.createIssueFailure({ error: err.error?.message || 'Failed to create issue' }))
          )
        )
      )
    )
  );

  /**
   * The `previous` snapshot was captured by the calling component BEFORE
   * it dispatched updateIssue (see board.component.ts / issue-detail
   * component) - that's the only way to guarantee an accurate rollback
   * target, since by the time THIS effect runs, the reducer has already
   * applied the optimistic change and the store no longer holds the
   * pre-image anywhere.
   */
  updateIssue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IssuesActions.updateIssue),
      switchMap(({ id, changes, previous }) =>
        this.api.updateIssue(id, changes).pipe(
          map((res) => IssuesActions.updateIssueSuccess({ issue: res.issue })),
          catchError((err: HttpErrorResponse) =>
            of(
              IssuesActions.updateIssueFailure({
                id,
                previous,
                error: err.error?.message || 'Update failed',
              })
            )
          )
        )
      )
    )
  );

  deleteIssue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IssuesActions.deleteIssue),
      exhaustMap(({ id }) =>
        this.api.deleteIssue(id).pipe(
          map(() => IssuesActions.deleteIssueSuccess({ id })),
          catchError((err: HttpErrorResponse) =>
            of(IssuesActions.deleteIssueFailure({ error: err.error?.message || 'Failed to delete issue' }))
          )
        )
      )
    )
  );

  notifyOnFailures$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          IssuesActions.updateIssueFailure,
          IssuesActions.createIssueFailure,
          IssuesActions.deleteIssueFailure
        ),
        map((action) => this.notifications.error(action.error))
      ),
    { dispatch: false }
  );

  /**
   * Bridges the RealtimeService Observable into the store. This effect
   * is long-lived for the app's lifetime (the socket stream never
   * completes on its own) - that's fine, NgRx effects don't have to be
   * one-shot HTTP calls.
   */
  socketToStore$ = createEffect(() =>
    this.realtime.issueEvents$.pipe(
      map((event) => {
        switch (event.type) {
          case 'issue:created':
          case 'issue:updated':
            return IssuesActions.issueReceivedViaSocket({ issue: event.issue });
          case 'issue:deleted':
            return IssuesActions.issueRemovedViaSocket({ id: event.id });
          default:
            return null;
        }
      }),
      filter((action): action is NonNullable<typeof action> => action !== null)
    )
  );
}

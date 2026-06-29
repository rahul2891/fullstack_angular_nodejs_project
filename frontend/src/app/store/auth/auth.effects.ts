import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from "../../core/services/auth.service";
import { AuthActions } from './auth.actions';
import { NotificationService } from '../../core/services/notification.service';


@Injectable()
export class AuthEffects {
    private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ payload }) =>
        this.authService.login(payload).pipe(
          map((res) => AuthActions.loginSuccess({ user: res.user })),
          catchError((err: HttpErrorResponse) =>
            of(AuthActions.loginFailure({ error: err.error?.message || 'Login failed' }))
          )
        )
      )
    )
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ payload }) =>
        this.authService.register(payload).pipe(
          map((res) => AuthActions.registerSuccess({ user: res.user })),
          catchError((err: HttpErrorResponse) =>
            of(AuthActions.registerFailure({ error: err.error?.message || 'Registration failed' }))
          )
        )
      )
    )
  );


  redirectAfterAuthSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
        tap(() => {
          this.notifications.success('Welcome back!');
          this.router.navigate(['/dashboard']);
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
        })
      ),
    { dispatch: false }
  );

}
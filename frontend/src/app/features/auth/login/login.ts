import { Component, inject } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectAuthError, selectAuthLoading } from '../../../store/auth/auth.selectors';
import { AuthActions } from '../../../store/auth/auth.actions';

@Component({
    selector: 'pb-login',
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <form class="auth-card" [formGroup]="form" (ngSubmit)="submit()">
        <h1>Welcome back</h1>
        <p class="subtitle">Log in to PulseBoard</p>

        <label>
          Email
          <input type="email" formControlName="email" placeholder="you@company.com" />
          @if (form.get('email')?.touched && form.get('email')?.invalid) {
            <span class="field-error">A valid email is required.</span>
          }
        </label>

        <label>
          Password
          <input type="password" formControlName="password" placeholder="••••••••" />
          @if (form.get('password')?.touched && form.get('password')?.invalid) {
            <span class="field-error">Password is required.</span>
          }
        </label>

        @if (error$ | async) {
          <div class="form-error">{{ error$ | async }}</div>
        }

        <button type="submit" [disabled]="form.invalid || (loading$ | async)">
          {{ (loading$ | async) ? 'Logging in…' : 'Log in' }}
        </button>

        <p class="switch">
          Don't have an account? <a routerLink="/register">Sign up</a>
        </p>

        <div class="demo-hint">
          <strong>Demo accounts</strong> (password: <code>Password123!</code>)<br />
          admin&#64;pulseboard.dev · manager&#64;pulseboard.dev · member&#64;pulseboard.dev
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .auth-page {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: calc(100vh - 60px);
        background: #0c0c10;
      }
      .auth-card {
        width: 380px;
        background: #16161d;
        border: 1px solid #26262f;
        border-radius: 14px;
        padding: 32px;
        color: #e4e4eb;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      h1 {
        margin: 0;
        font-size: 22px;
      }
      .subtitle {
        margin: 0 0 8px;
        color: #9b9ba8;
        font-size: 14px;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 13px;
        color: #b6b6c2;
      }
      input {
        background: #1c1c24;
        border: 1px solid #2e2e38;
        border-radius: 8px;
        padding: 10px 12px;
        color: #f4f4f6;
        font-size: 14px;
      }
      input:focus {
        outline: none;
        border-color: #7c5cfc;
      }
      .field-error,
      .form-error {
        color: #f08a96;
        font-size: 12px;
      }
      button {
        margin-top: 8px;
        background: #7c5cfc;
        border: none;
        color: #fff;
        padding: 11px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
      }
      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .switch {
        text-align: center;
        font-size: 13px;
        color: #9b9ba8;
        margin: 4px 0 0;
      }
      .switch a {
        color: #a48dfd;
      }
      .demo-hint {
        margin-top: 12px;
        padding: 10px 12px;
        background: #1c1c24;
        border-radius: 8px;
        font-size: 11px;
        color: #8b8b97;
        line-height: 1.6;
      }
      .demo-hint code {
        background: #26262f;
        padding: 1px 4px;
        border-radius: 4px;
      }
    `,
  ],

})

export class Login {
   private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  readonly loading$ = this.store.select(selectAuthLoading);
  readonly error$ = this.store.select(selectAuthError);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.dispatch(AuthActions.login({ payload: this.form.getRawValue() }));
  }
}
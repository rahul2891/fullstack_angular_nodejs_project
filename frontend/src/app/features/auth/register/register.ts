import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { strongPasswordValidator } from "../../../shared/validators/custom-validators";

@Component({
    selector: 'pb-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <form class="auth-card" [formGroup]="form" (ngSubmit)="submit()">
        <h1>Create your account</h1>
        <p class="subtitle">Join PulseBoard as a member</p>

        <label>
          Name
          <input formControlName="name" placeholder="Jane Doe" />
        </label>

        <label>
          Email
          <input type="email" formControlName="email" placeholder="you@company.com" />
        </label>

        <label>
          Password
          <input type="password" formControlName="password" placeholder="••••••••" />
          @if (form.get('password')?.touched && form.get('password')?.hasError('strongPassword')) {
            <span class="field-error">
              Needs 8+ characters, an uppercase letter, and a number.
            </span>
          }
        </label>

        <label>
          Confirm password
          <input type="password" formControlName="confirmPassword" placeholder="••••••••" />
        </label>

        @if (form.touched && form.hasError('passwordMismatch')) {
          <span class="field-error">Passwords do not match.</span>
        }

        @if (error$ | async) {
          <div class="form-error">{{ error$ | async }}</div>
        }

        <button type="submit" [disabled]="form.invalid || (loading$ | async)">
          {{ (loading$ | async) ? 'Creating account…' : 'Create account' }}
        </button>

        <p class="switch">Already have an account? <a routerLink="/login">Log in</a></p>
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
    `,
  ],
})

export class Register {
    private readonly fb = inject(FormBuilder);

    readonly form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]],
    },);

    readonly error$ = new BehaviorSubject<string | null>(null);
    readonly loading$ = new BehaviorSubject(false);

    submit(): void {
        if (this.form.invalid) return;
        // TODO: wire up auth service
    }

}
import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { projectKeyFormatValidator } from "../../../shared/validators/custom-validators";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'pb-project-create',
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="page">
      <form class="card" [formGroup]="form" (ngSubmit)="submit()">
        <h1>New project</h1>

        <label>
          Project key
          <input formControlName="key" placeholder="e.g. PB" maxlength="6" />
          @if (form.get('key')?.touched && form.get('key')?.hasError('projectKeyFormat')) {
            <span class="field-error">2-6 letters only, e.g. "PB" or "INFRA".</span>
          }
        </label>

        <label>
          Name
          <input formControlName="name" placeholder="Project name" />
        </label>

        <label>
          Description
          <textarea formControlName="description" rows="3" placeholder="What is this project about?"></textarea>
        </label>

        <button type="submit" [disabled]="form.invalid">Create project</button>
      </form>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 480px;
        margin: 0 auto;
        padding: 32px 24px;
      }
      .card {
        background: #16161d;
        border: 1px solid #26262f;
        border-radius: 14px;
        padding: 28px;
        color: #e4e4eb;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      h1 {
        margin: 0 0 8px;
        font-size: 20px;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 13px;
        color: #b6b6c2;
      }
      input,
      textarea {
        background: #1c1c24;
        border: 1px solid #2e2e38;
        border-radius: 8px;
        padding: 10px 12px;
        color: #f4f4f6;
        font-size: 14px;
        font-family: inherit;
        resize: vertical;
      }
      .field-error {
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
      }
      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})

export class ProjectCreate {
    private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    key: ['', [Validators.required, projectKeyFormatValidator()]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
  });

  submit(): void {
     if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  }


}
import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AssigneePickerComponent } from "../../shared/components/assignee-picker/assignee-picker";
import { Store } from "@ngrx/store";
import { ActivatedRoute, Router } from "@angular/router";
import { Actions, ofType } from "@ngrx/effects";
import { UsersApiService } from "../../core/services/users-api.service";
import { ISSUE_PRIORITIES, User } from "../../core/models/domain.models";
import { uniqueIssueTitleValidator } from "../../shared/validators/unique-title.validator";
import { IssuesActions } from "../../store/issues/issues.actions";
import { take } from "rxjs";

@Component({
    selector: 'pb-issue-create',
    imports: [CommonModule, ReactiveFormsModule, AssigneePickerComponent],
  template: `
    <div class="page">
      <form class="card" [formGroup]="form" (ngSubmit)="submit()">
        <h1>New issue</h1>

        <label>
          Title
          <input formControlName="title" placeholder="e.g. Fix login redirect bug" />
          @if (form.get('title')?.pending) {
            <span class="field-hint">Checking title…</span>
          }
          @if (form.get('title')?.touched && form.get('title')?.hasError('titleTaken')) {
            <span class="field-error">An issue with this title already exists in this project.</span>
          }
        </label>

        <label>
          Description
          <textarea formControlName="description" rows="3" placeholder="Describe the issue…"></textarea>
        </label>

        <div class="row">
          <label>
            Priority
            <select formControlName="priority">
              @for (priority of priorities; track priority) {
                <option [value]="priority">{{ priority }}</option>
              }
            </select>
          </label>

          <label>
            Assignee
            <pb-assignee-picker formControlName="assigneeId" [users]="users" />
          </label>
        </div>

        <div class="checklist-section">
          <div class="checklist-header">
            <span>Checklist</span>
            <button type="button" class="btn-ghost-small" (click)="addChecklistItem()">+ Add item</button>
          </div>

          <div formArrayName="checklist">
            @for (group of checklist.controls; track $index; let i = $index) {
              <div class="checklist-row" [formGroupName]="i">
                <input type="checkbox" formControlName="done" />
                <input class="checklist-text" formControlName="text" placeholder="Checklist item…" />
                <button type="button" class="btn-remove" (click)="removeChecklistItem(i)">✕</button>
              </div>
            }
          </div>
        </div>

        <button type="submit" class="submit-btn" [disabled]="form.invalid">Create issue</button>
      </form>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 560px;
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
        gap: 16px;
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
      textarea,
      select {
        background: #1c1c24;
        border: 1px solid #2e2e38;
        border-radius: 8px;
        padding: 10px 12px;
        color: #f4f4f6;
        font-size: 14px;
        font-family: inherit;
      }
      textarea {
        resize: vertical;
      }
      .row {
        display: flex;
        gap: 16px;
      }
      .row label {
        flex: 1;
      }
      .field-error {
        color: #f08a96;
        font-size: 12px;
      }
      .field-hint {
        color: #8b8b97;
        font-size: 12px;
      }
      .checklist-section {
        border-top: 1px solid #26262f;
        padding-top: 14px;
      }
      .checklist-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        color: #b6b6c2;
        margin-bottom: 10px;
      }
      .btn-ghost-small {
        background: transparent;
        border: 1px solid #34343f;
        color: #c9c9d2;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
      }
      .checklist-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      .checklist-text {
        flex: 1;
      }
      .btn-remove {
        background: transparent;
        border: none;
        color: #71717e;
        cursor: pointer;
        font-size: 14px;
      }
      .submit-btn {
        margin-top: 8px;
        background: #7c5cfc;
        border: none;
        color: #fff;
        padding: 11px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      }
      .submit-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})

export class IssueCreate implements OnInit {
    private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly actions$ = inject(Actions);
  private readonly usersApi = inject(UsersApiService);

  readonly priorities = ISSUE_PRIORITIES;
  readonly projectId = this.route.snapshot.paramMap.get('projectId')!;
  users: User[] = [];

  readonly form = this.fb.nonNullable.group({
    title: this.fb.nonNullable.control(
      '',
      [Validators.required, Validators.minLength(3)],
      [uniqueIssueTitleValidator(() => this.projectId)]
    ),
    description: [''],
    priority: this.fb.nonNullable.control<'low' | 'medium' | 'high' | 'urgent'>('medium'),
    assigneeId: this.fb.control<string | null>(null),
    checklist: this.fb.array<ReturnType<typeof this.buildChecklistItem>>([]),
  });

  get checklist(): FormArray {
    return this.form.get('checklist') as FormArray;
  }

  ngOnInit(): void {
    this.usersApi.getUsers().subscribe((res) => (this.users = res.users));
  }

  private buildChecklistItem(text = '') {
    return this.fb.nonNullable.group({
      text: [text, Validators.required],
      done: [false],
    });
  }

  addChecklistItem(): void {
    this.checklist.push(this.buildChecklistItem());
  }

  removeChecklistItem(index: number): void {
    this.checklist.removeAt(index);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.actions$.pipe(ofType(IssuesActions.createIssueSuccess), take(1)).subscribe(() => {
      this.router.navigate(['/projects', this.projectId, 'board']);
    });

    this.store.dispatch(
      IssuesActions.createIssue({
        payload: {
          projectId: this.projectId,
          title: value.title,
          description: value.description,
          priority: value.priority,
          assigneeId: value.assigneeId,
        },
      })
    );
  }

}
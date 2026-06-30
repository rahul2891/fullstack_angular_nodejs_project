import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, map, switchMap } from 'rxjs';
import { IssuesActions } from '../../store/issues/issues.actions';
import { selectIssueById } from '../../store/issues/issues.selectors';
import { CommentsApiService } from '../../core/services/comments-api.service';
import { UsersApiService } from '../../core/services/users-api.service';
import {
  Comment,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  Issue,
  STATUS_LABELS,
  User,
} from '../../core/models/domain.models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { AssigneePickerComponent } from '../../shared/components/assignee-picker/assignee-picker';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { InitialsPipe } from '../../shared/pipes/initials.pipe';

@Component({
  selector: 'pb-issue-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogComponent,
    AssigneePickerComponent,
    RelativeTimePipe,
    InitialsPipe,
  ],
  template: `
    @if (issue$ | async; as issue) {
      <div class="page">
        <div class="main">
          <span class="key">{{ issue.key }}</span>
          <h1>{{ issue.title }}</h1>
          <p class="description">{{ issue.description || 'No description provided.' }}</p>

          @if (issue.checklist.length) {
            <div class="checklist">
              <h3>Checklist</h3>
              @for (item of issue.checklist; track item.id) {
                <label class="checklist-item">
                  <input type="checkbox" [checked]="item.done" disabled />
                  <span [class.done]="item.done">{{ item.text }}</span>
                </label>
              }
            </div>
          }

          <div class="comments">
            <h3>Comments</h3>
            @for (comment of comments$ | async; track comment.id) {
              <div class="comment">
                <span class="avatar" [style.background]="authorAvatarColor(comment)">
                  {{ authorName(comment) | initials }}
                </span>
                <div>
                  <div class="comment-meta">
                    <strong>{{ authorName(comment) }}</strong>
                    <span>{{ comment.createdAt | relativeTime }}</span>
                  </div>
                  <p>{{ comment.text }}</p>
                </div>
              </div>
            }

            <div class="add-comment">
              <input
                [formControl]="commentControl"
                placeholder="Add a comment…"
                (keyup.enter)="addComment(issue.id)"
              />
              <button (click)="addComment(issue.id)" [disabled]="!commentControl.value.trim()">
                Send
              </button>
            </div>
          </div>
        </div>

        <aside class="sidebar">
          <label>
            Status
            <select [value]="issue.status" (change)="changeStatus(issue, $any($event.target).value)">
              @for (status of statuses; track status) {
                <option [value]="status">{{ statusLabels[status] }}</option>
              }
            </select>
          </label>

          <label>
            Priority
            <select [value]="issue.priority" (change)="changePriority(issue, $any($event.target).value)">
              @for (priority of priorities; track priority) {
                <option [value]="priority">{{ priority }}</option>
              }
            </select>
          </label>

          <label>
            Assignee
            <pb-assignee-picker
              [users]="users"
              [ngModel]="issue.assigneeId"
              (ngModelChange)="changeAssignee(issue, $event)"
            />
          </label>

          <div class="meta">
            <span>Reporter: {{ reporterName(issue) }}</span>
            <span>Created {{ issue.createdAt | relativeTime }}</span>
            <span>Updated {{ issue.updatedAt | relativeTime }}</span>
          </div>

          <button class="btn-danger" (click)="confirmOpen = true">Delete issue</button>
        </aside>

        <pb-confirm-dialog
          [open]="confirmOpen"
          title="Delete this issue?"
          message="This permanently removes the issue. This cannot be undone."
          (confirm)="deleteIssue(issue.id)"
          (cancel)="confirmOpen = false"
        />
      </div>
    } @else {
      <p class="muted">Loading issue…</p>
    }
  `,
  styles: [
    `
      .page {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 32px;
        max-width: 960px;
        margin: 0 auto;
        padding: 32px 24px;
        color: #e4e4eb;
      }
      .key {
        font-family: monospace;
        color: #8b8b97;
        font-size: 13px;
      }
      h1 {
        margin: 4px 0 12px;
        font-size: 22px;
      }
      .description {
        color: #c9c9d2;
        line-height: 1.6;
      }
      h3 {
        font-size: 13px;
        text-transform: uppercase;
        color: #9b9ba8;
        margin: 24px 0 10px;
      }
      .checklist-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        margin-bottom: 6px;
      }
      .checklist-item .done {
        text-decoration: line-through;
        color: #71717e;
      }
      .comment {
        display: flex;
        gap: 10px;
        margin-bottom: 14px;
      }
      .comment .avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 600;
        color: #fff;
        flex-shrink: 0;
      }
      .comment-meta {
        display: flex;
        gap: 8px;
        font-size: 12px;
        color: #9b9ba8;
        margin-bottom: 2px;
      }
      .comment p {
        margin: 0;
        font-size: 14px;
      }
      .add-comment {
        display: flex;
        gap: 8px;
        margin-top: 14px;
      }
      .add-comment input {
        flex: 1;
        background: #1c1c24;
        border: 1px solid #2e2e38;
        border-radius: 8px;
        padding: 9px 12px;
        color: #f4f4f6;
        font-size: 14px;
      }
      .add-comment button {
        background: #7c5cfc;
        border: none;
        color: #fff;
        padding: 9px 16px;
        border-radius: 8px;
        cursor: pointer;
      }
      .add-comment button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .sidebar {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .sidebar label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 12px;
        color: #9b9ba8;
      }
      .sidebar select {
        background: #1c1c24;
        border: 1px solid #2e2e38;
        border-radius: 8px;
        padding: 8px 10px;
        color: #f4f4f6;
      }
      .meta {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 12px;
        color: #71717e;
        border-top: 1px solid #26262f;
        padding-top: 12px;
      }
      .btn-danger {
        background: transparent;
        border: 1px solid #5c2530;
        color: #f08a96;
        padding: 9px;
        border-radius: 8px;
        cursor: pointer;
        margin-top: 12px;
      }
      .muted {
        padding: 32px;
        color: #71717e;
      }
    `,
  ],
})
export class IssueDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly commentsApi = inject(CommentsApiService);
  private readonly usersApi = inject(UsersApiService);

  readonly statuses = ISSUE_STATUSES;
  readonly priorities = ISSUE_PRIORITIES;
  readonly statusLabels = STATUS_LABELS;

  readonly issueId = this.route.snapshot.paramMap.get('issueId')!;
  readonly projectId = this.route.snapshot.paramMap.get('projectId')!;

   issue$: Observable<Issue | undefined> = this.store.select(selectIssueById(this.issueId));
  comments$!: Observable<Comment[]>;

  users: User[] = [];
  confirmOpen = false;
  readonly commentControl = new FormControl('', { nonNullable: true });

   private readonly reloadComments$ = new Subject<void>();

  ngOnInit(): void {
    this.store.dispatch(IssuesActions.loadIssues({ filters: { projectId: this.projectId } }));

    this.usersApi.getUsers().subscribe((res) => (this.users = res.users));

    this.comments$ = this.reloadComments$.pipe(
      switchMap(() => this.commentsApi.getComments(this.issueId)),
      map((res) => res.comments)
    );
    this.reloadComments$.next();
  }

   authorName(comment: Comment): string {
    return this.users.find((u) => u.id === comment.authorId)?.name ?? 'Unknown';
  }

  authorAvatarColor(comment: Comment): string {
    return this.users.find((u) => u.id === comment.authorId)?.avatarColor ?? '#444';
  }

  reporterName(issue: Issue): string {
    return this.users.find((u) => u.id === issue.reporterId)?.name ?? 'Unknown';
  }

  addComment(issueId: string): void {
    const text = this.commentControl.value.trim();
    if (!text) return;
    this.commentsApi.addComment(issueId, text).subscribe(() => {
      this.commentControl.reset('');
      this.reloadComments$.next();
    });
  }

  changeStatus(issue: Issue, status: Issue['status']): void {
    this.store.dispatch(IssuesActions.updateIssue({ id: issue.id, changes: { status }, previous: issue }));
  }

  changePriority(issue: Issue, priority: Issue['priority']): void {
    this.store.dispatch(IssuesActions.updateIssue({ id: issue.id, changes: { priority }, previous: issue }));
  }

  changeAssignee(issue: Issue, assigneeId: string | null): void {
    this.store.dispatch(IssuesActions.updateIssue({ id: issue.id, changes: { assigneeId }, previous: issue }));
  }

  deleteIssue(issueId: string): void {
    this.store.dispatch(IssuesActions.deleteIssue({ id: issueId }));
    this.confirmOpen = false;
    this.router.navigate(['/projects', this.projectId, 'board']);
  }
}
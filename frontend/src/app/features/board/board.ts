import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { InitialsPipe } from "../../shared/pipes/initials.pipe";
import { Store } from "@ngrx/store";
import { UsersApiService } from "../../core/services/users-api.service";
import { RealtimeService } from "../../core/services/realtime.service";
import { Issue, ISSUE_STATUSES, IssueStatus, STATUS_LABELS, User } from "../../core/models/domain.models";
import { selectIssuesGroupedByStatus, selectIssuesLoading } from "../../store/issues/issues.selectors";
import { selectAllProjects } from "../../store/projects/projects.selectors";
import { debounceTime, distinctUntilChanged, map } from "rxjs";
import { IssuesActions } from "../../store/issues/issues.actions";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'pb-board',
    changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InitialsPipe],
  template: `
    <div class="page">
      <div class="toolbar">
        <h1>{{ projectName$ | async }} board</h1>
        <input
          class="search"
          placeholder="Search issues…"
          [formControl]="searchControl"
        />
        <a class="btn-primary" [routerLink]="['/projects', projectId, 'issues', 'new']">
          + New issue
        </a>
      </div>

      @if (loading$ | async) {
        <p class="muted">Loading board…</p>
      } @else {
        <div class="columns">
          @for (status of statuses; track status) {
            <div
              class="column"
              (dragover)="onDragOver($event)"
              (drop)="onDrop($event, status)"
            >
              <h2>
                {{ statusLabels[status] }}
                <span class="count">{{ (grouped$ | async)?.[status]?.length ?? 0 }}</span>
              </h2>

              <div class="cards">
                @for (issue of (grouped$ | async)?.[status]; track issue.id) {
                  <a
                    class="card"
                    draggable="true"
                    (dragstart)="onDragStart($event, issue)"
                    [routerLink]="['/projects', projectId, 'issues', issue.id]"
                  >
                    <span class="card-key">{{ issue.key }}</span>
                    <p class="card-title">{{ issue.title }}</p>
                    <div class="card-footer">
                      <span class="priority" [attr.data-priority]="issue.priority">
                        {{ issue.priority }}
                      </span>
                     @if (assigneeFor(issue)) {
  <span
    class="avatar"
    [style.background]="assigneeFor(issue)?.avatarColor"
    [title]="assigneeFor(issue)?.name"
  >
    {{ assigneeFor(issue)?.name | initials }}
  </span>
}
                    </div>
                  </a>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .page {
        padding: 24px;
        color: #e4e4eb;
      }
      .toolbar {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
      }
      h1 {
        font-size: 20px;
        margin: 0;
        flex-shrink: 0;
      }
      .search {
        flex: 1;
        max-width: 320px;
        background: #1c1c24;
        border: 1px solid #2e2e38;
        border-radius: 8px;
        padding: 9px 12px;
        color: #f4f4f6;
        font-size: 14px;
      }
      .btn-primary {
        background: #7c5cfc;
        color: #fff;
        text-decoration: none;
        padding: 9px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
      }
      .muted {
        color: #71717e;
      }
      .columns {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
      }
      .column {
        background: #14141a;
        border-radius: 12px;
        padding: 12px;
        min-height: 400px;
      }
      .column h2 {
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #9b9ba8;
        margin: 4px 8px 12px;
        display: flex;
        justify-content: space-between;
      }
      .count {
        background: #26262f;
        border-radius: 999px;
        padding: 1px 8px;
        font-size: 11px;
      }
      .cards {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .card {
        background: #1c1c24;
        border: 1px solid #2e2e38;
        border-radius: 10px;
        padding: 12px;
        text-decoration: none;
        color: #e4e4eb;
        cursor: grab;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .card:hover {
        border-color: #45455a;
      }
      .card-key {
        font-size: 11px;
        color: #8b8b97;
        font-family: monospace;
      }
      .card-title {
        margin: 0;
        font-size: 14px;
        line-height: 1.4;
      }
      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .priority {
        font-size: 10px;
        text-transform: uppercase;
        padding: 2px 7px;
        border-radius: 999px;
        background: #26262f;
        color: #c9c9d2;
      }
      .priority[data-priority='urgent'] {
        background: #3a1d22;
        color: #f08a96;
      }
      .priority[data-priority='high'] {
        background: #3a2c1d;
        color: #f0b07e;
      }
      .avatar {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 600;
        color: #fff;
      }
    `,
  ],
})

export class Board implements OnInit {
     private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly usersApi = inject(UsersApiService);
  private readonly realtime = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly statuses: IssueStatus[] = ISSUE_STATUSES;
  readonly statusLabels = STATUS_LABELS;

  readonly projectId = this.route.snapshot.paramMap.get('projectId')!;
  readonly loading$ = this.store.select(selectIssuesLoading);
  readonly grouped$ = this.store.select(selectIssuesGroupedByStatus);
  readonly projectName$ = this.store
    .select(selectAllProjects)
    .pipe(map((projects) => projects.find((p) => p.id === this.projectId)?.name ?? ''));

  readonly searchControl = new FormControl('', { nonNullable: true });

  private users: User[] = [];
  private draggedIssue: Issue | null = null;

  ngOnInit(): void {
    this.realtime.joinProject(this.projectId);
    this.destroyRef.onDestroy(() => this.realtime.leaveProject(this.projectId));

    this.usersApi.getUsers().subscribe((res) => (this.users = res.users));

    // Debounced search: wait 300ms after the user stops typing, and only
    // dispatch if the trimmed value actually changed since last time.
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => {
        this.store.dispatch(IssuesActions.setSearchTerm({ term }));
      });
  }

  assigneeFor(issue: Issue): User | undefined {
    return this.users.find((u) => u.id === issue.assigneeId);
  }

  onDragStart(event: DragEvent, issue: Issue): void {
    this.draggedIssue = issue;
    event.dataTransfer?.setData('text/plain', issue.id);
  }

  onDragOver(event: DragEvent): void {
    // Required - without preventDefault() the browser's default
    // "no drop allowed" behavior blocks the drop event from firing.
    event.preventDefault();
  }

  onDrop(event: DragEvent, newStatus: IssueStatus): void {
    event.preventDefault();
    if (!this.draggedIssue || this.draggedIssue.status === newStatus) {
      this.draggedIssue = null;
      return;
    }

    const previous = this.draggedIssue;
    this.store.dispatch(
      IssuesActions.updateIssue({
        id: previous.id,
        changes: { status: newStatus },
        previous,
      })
    );
    this.draggedIssue = null;
  }
}
import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { AuthService } from "../../core/services/auth.service";
import { STATUS_LABELS } from "../../core/models/domain.models";
import { selectAllIssues, selectIssuesLoading } from "../../store/issues/issues.selectors";
import { selectAllProjects } from "../../store/projects/projects.selectors";
import { combineLatest, map } from "rxjs";
import { ProjectsActions } from "../../store/projects/projects.actions";
import { IssuesActions } from "../../store/issues/issues.actions";
import { RouterLink } from "@angular/router";
import { RelativeTimePipe } from "../../shared/pipes/relative-time.pipe";
// import { RouterLink } from "@angular/router";

@Component({
    selector: 'pb-dashboard',
    imports: [CommonModule, RouterLink, RelativeTimePipe],
  template: `
    <div class="page">
      <h1>Welcome back, {{ authService.currentUser()?.name }} 👋</h1>

      <div class="stats">
        <div class="stat-card">
          <span class="value">{{ (myIssues$ | async)?.length ?? 0 }}</span>
          <span class="label">Assigned to you</span>
        </div>
        <div class="stat-card">
          <span class="value">{{ (projects$ | async)?.length ?? 0 }}</span>
          <span class="label">Active projects</span>
        </div>
        <div class="stat-card">
          <span class="value">{{ doneCount$ | async }}</span>
          <span class="label">Issues done</span>
        </div>
      </div>

      <section>
        <h2>Your issues</h2>
        @if (loading$ | async) {
          <p class="muted">Loading…</p>
        } @else if ((myIssues$ | async)?.length === 0) {
          <p class="muted">No issues assigned to you yet. Nicely done, or suspiciously quiet.</p>
        } @else {
          <ul class="issue-list">
            @for (issue of myIssues$ | async; track issue.id) {
              <li [routerLink]="['/projects', issue.projectId, 'issues', issue.id]">
                <span class="key">{{ issue.key }}</span>
                <span class="title">{{ issue.title }}</span>
                <span class="status" [attr.data-status]="issue.status">{{ statusLabels[issue.status] }}</span>
                <span class="time">{{ issue.updatedAt | relativeTime }}</span>
              </li>
            }
          </ul>
        }
      </section>

      <section>
        <h2>Your projects</h2>
        <div class="project-grid">
          @for (project of projects$ | async; track project.id) {
            <a class="project-card" [routerLink]="['/projects', project.id, 'board']">
              <span class="project-key">{{ project.key }}</span>
              <span class="project-name">{{ project.name }}</span>
              <span class="project-desc">{{ project.description }}</span>
            </a>
          }
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 960px;
        margin: 0 auto;
        padding: 32px 24px;
        color: #e4e4eb;
      }
      h1 {
        font-size: 24px;
        margin: 0 0 24px;
      }
      h2 {
        font-size: 16px;
        margin: 0 0 12px;
        color: #c9c9d2;
      }
      .stats {
        display: flex;
        gap: 16px;
        margin-bottom: 32px;
      }
      .stat-card {
        flex: 1;
        background: #16161d;
        border: 1px solid #26262f;
        border-radius: 12px;
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .stat-card .value {
        font-size: 28px;
        font-weight: 700;
      }
      .stat-card .label {
        font-size: 13px;
        color: #9b9ba8;
      }
      section {
        margin-bottom: 32px;
      }
      .muted {
        color: #71717e;
        font-size: 14px;
      }
      .issue-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .issue-list li {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #16161d;
        border: 1px solid #26262f;
        border-radius: 10px;
        padding: 12px 16px;
        cursor: pointer;
        font-size: 14px;
      }
      .issue-list li:hover {
        border-color: #3d3d4a;
      }
      .key {
        color: #8b8b97;
        font-family: monospace;
        font-size: 12px;
      }
      .title {
        flex: 1;
      }
      .status {
        font-size: 11px;
        padding: 3px 8px;
        border-radius: 999px;
        background: #26262f;
        color: #c9c9d2;
      }
      .status[data-status='done'] {
        background: #18372a;
        color: #6fd6a4;
      }
      .status[data-status='in_progress'] {
        background: #1f2c45;
        color: #7ea6f5;
      }
      .time {
        color: #71717e;
        font-size: 12px;
      }
      .project-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 12px;
      }
      .project-card {
        background: #16161d;
        border: 1px solid #26262f;
        border-radius: 12px;
        padding: 16px;
        text-decoration: none;
        display: flex;
        flex-direction: column;
        gap: 4px;
        color: #e4e4eb;
      }
      .project-card:hover {
        border-color: #3d3d4a;
      }
      .project-key {
        font-size: 11px;
        color: #a48dfd;
        font-weight: 700;
        letter-spacing: 0.04em;
      }
      .project-name {
        font-size: 15px;
        font-weight: 600;
      }
      .project-desc {
        font-size: 12px;
        color: #9b9ba8;
      }
    `,
  ],
})

export class Dashboard {
  private readonly store = inject(Store);
  readonly authService = inject(AuthService);
  readonly statusLabels = STATUS_LABELS;

  readonly loading$ = this.store.select(selectIssuesLoading);
  readonly projects$ = this.store.select(selectAllProjects);

  readonly myIssues$ = combineLatest([
    this.store.select(selectAllIssues),
    // AuthService.currentUser is a signal; toObservable would be the
    // "fully reactive" approach, but since we only need it once per
    // combineLatest emission and a signal read is synchronous, reading it
    // directly inside map() here is simpler and avoids importing
    // toObservable just for this. (See README for a discussion of when
    // to bridge signals -> observables instead.)
  ]).pipe(map(([issues]) => issues.filter((i) => i.assigneeId === this.authService.currentUser()?.id)));

  readonly doneCount$ = this.store
    .select(selectAllIssues)
    .pipe(map((issues) => issues.filter((i) => i.status === 'done').length));

  ngOnInit(): void {
    this.store.dispatch(ProjectsActions.loadProjects());
    this.store.dispatch(IssuesActions.loadIssues({ filters: {} }));
  }

}
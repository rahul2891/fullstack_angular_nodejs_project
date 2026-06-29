import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { HasRoleDirective } from "../../../shared/directives/has-role.directive";
import { Store } from "@ngrx/store";
import { ProjectsActions } from "../../../store/projects/projects.actions";
import { selectAllProjects, selectProjectsLoading } from "../../../store/projects/projects.selectors";

@Component({
    selector: 'pb-project-list',
    imports: [CommonModule, RouterLink, HasRoleDirective],
  template: `
    <div class="page">
      <div class="header">
        <h1>Projects</h1>
        <a *pbHasRole="['admin', 'manager']" routerLink="/projects/new" class="btn-primary">
          + New project
        </a>
      </div>

      @if (loading$ | async) {
        <p class="muted">Loading projects…</p>
      } @else {
        <div class="grid">
          @for (project of projects$ | async; track project.id) {
            <a class="card" [routerLink]="[project.id, 'board']">
              <span class="key">{{ project.key }}</span>
              <h3>{{ project.name }}</h3>
              <p>{{ project.description }}</p>
              <span class="members">{{ project.memberIds.length }} members</span>
            </a>
          }
        </div>
      }
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
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      h1 {
        font-size: 22px;
        margin: 0;
      }
      .btn-primary {
        background: #7c5cfc;
        color: #fff;
        text-decoration: none;
        padding: 9px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
      }
      .muted {
        color: #71717e;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
      }
      .card {
        background: #16161d;
        border: 1px solid #26262f;
        border-radius: 12px;
        padding: 18px;
        text-decoration: none;
        color: #e4e4eb;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .card:hover {
        border-color: #3d3d4a;
      }
      .key {
        font-size: 11px;
        color: #a48dfd;
        font-weight: 700;
      }
      h3 {
        margin: 0;
        font-size: 16px;
      }
      p {
        margin: 0;
        font-size: 13px;
        color: #9b9ba8;
      }
      .members {
        font-size: 12px;
        color: #71717e;
        margin-top: 4px;
      }
    `,
  ],
})

export class ProjectList implements OnInit {
    private readonly store = inject(Store);
  readonly projects$ = this.store.select(selectAllProjects);
  readonly loading$ = this.store.select(selectProjectsLoading);

 ngOnInit(): void {
    this.store.dispatch(ProjectsActions.loadProjects());
  }
}
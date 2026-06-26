import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
    selector: 'pb-dashboard',
    imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <h1>Welcome back, Rahul 👋</h1>

      <div class="stats">
        <div class="stat-card">
          <span class="value">Test</span>
          <span class="label">Assigned to you</span>
        </div>
        <div class="stat-card">
          <span class="value">Project</span>
          <span class="label">Active projects</span>
        </div>
        <div class="stat-card">
          <span class="value">Issue</span>
          <span class="label">Issues done</span>
        </div>
      </div>

      <section>
        <h2>Your issues</h2>
      </section>

      <section>
        <h2>Your projects</h2>

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

}
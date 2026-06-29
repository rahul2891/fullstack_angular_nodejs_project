import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Issue } from "../../core/models/domain.models";

@Component({
    selector: 'pb-search',
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <h1>Search issues</h1>
      <input
        class="search-input"
        [formControl]="searchControl"
        placeholder="Type at least 2 characters…"
        autofocus
      />

      @if (searching) {
        <p class="muted">Searching…</p>
      } @else if (searchControl.value.length >= 2 && results.length === 0) {
        <p class="muted">No issues match "{{ searchControl.value }}".</p>
      }

      <ul class="results">
        @for (issue of results; track issue.id) {
          <li [routerLink]="['/projects', issue.projectId, 'issues', issue.id]">
            <span class="key">{{ issue.key }}</span>
            <span class="title">{{ issue.title }}</span>
            <span class="status">{{ issue.status }}</span>
          </li>
        }
      </ul>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 640px;
        margin: 0 auto;
        padding: 32px 24px;
        color: #e4e4eb;
      }
      h1 {
        font-size: 20px;
        margin: 0 0 16px;
      }
      .search-input {
        width: 100%;
        background: #1c1c24;
        border: 1px solid #2e2e38;
        border-radius: 8px;
        padding: 12px 14px;
        color: #f4f4f6;
        font-size: 15px;
        margin-bottom: 16px;
      }
      .muted {
        color: #71717e;
        font-size: 14px;
      }
      .results {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .results li {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #16161d;
        border: 1px solid #26262f;
        border-radius: 10px;
        padding: 12px 14px;
        cursor: pointer;
        font-size: 14px;
      }
      .results li:hover {
        border-color: #3d3d4a;
      }
      .key {
        font-family: monospace;
        color: #8b8b97;
        font-size: 12px;
      }
      .title {
        flex: 1;
      }
      .status {
        color: #9b9ba8;
        font-size: 12px;
      }
    `,
  ],
})

export class Search {

     readonly searchControl = new FormControl('', { nonNullable: true });
  results: Issue[] = [];
  searching = false;
}
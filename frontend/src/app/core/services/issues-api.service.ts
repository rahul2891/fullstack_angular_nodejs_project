import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../tokens/app-config.token';
import {
  CreateIssueRequest,
  Issue,
  IssueFilters,
  UpdateIssueRequest,
} from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class IssuesApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base = `${this.config.apiUrl}/issues`;

  getIssues(filters: IssueFilters = {}): Observable<{ issues: Issue[] }> {
    let params = new HttpParams();
    if (filters.projectId) params = params.set('projectId', filters.projectId);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.assigneeId) params = params.set('assigneeId', filters.assigneeId);
    if (filters.search) params = params.set('search', filters.search);
    return this.http.get<{ issues: Issue[] }>(this.base, { params });
  }

  getIssue(id: string): Observable<{ issue: Issue }> {
    return this.http.get<{ issue: Issue }>(`${this.base}/${id}`);
  }

  createIssue(payload: CreateIssueRequest): Observable<{ issue: Issue }> {
    return this.http.post<{ issue: Issue }>(this.base, payload);
  }

  updateIssue(id: string, patch: UpdateIssueRequest): Observable<{ issue: Issue }> {
    return this.http.patch<{ issue: Issue }>(`${this.base}/${id}`, patch);
  }

  deleteIssue(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /**
   * Used by the issue-create form's ASYNC validator. Returns whether the
   * title is still available (true) or already taken in this project (false).
   */
  checkTitleAvailable(projectId: string, title: string, excludeId?: string): Observable<{ available: boolean }> {
    let params = new HttpParams().set('projectId', projectId).set('title', title);
    if (excludeId) params = params.set('excludeId', excludeId);
    return this.http.get<{ available: boolean }>(`${this.base}/check-title`, { params });
  }
}

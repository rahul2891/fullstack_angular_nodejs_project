import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../tokens/app-config.token';
import { Comment } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class CommentsApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  getComments(issueId: string): Observable<{ comments: Comment[] }> {
    return this.http.get<{ comments: Comment[] }>(`${this.config.apiUrl}/issues/${issueId}/comments`);
  }

  addComment(issueId: string, text: string): Observable<{ comment: Comment }> {
    return this.http.post<{ comment: Comment }>(`${this.config.apiUrl}/issues/${issueId}/comments`, { text });
  }
}

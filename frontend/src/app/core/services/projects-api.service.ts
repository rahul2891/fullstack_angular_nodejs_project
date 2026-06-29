import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../tokens/app-config.token';
import { CreateProjectRequest, Project } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class ProjectsApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base = `${this.config.apiUrl}/projects`;

  getProjects(): Observable<{ projects: Project[] }> {
    return this.http.get<{ projects: Project[] }>(this.base);
  }

  getProject(id: string): Observable<{ project: Project }> {
    return this.http.get<{ project: Project }>(`${this.base}/${id}`);
  }

  createProject(payload: CreateProjectRequest): Observable<{ project: Project }> {
    return this.http.post<{ project: Project }>(this.base, payload);
  }
}

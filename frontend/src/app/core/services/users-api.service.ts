import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../tokens/app-config.token';
import { User } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base = `${this.config.apiUrl}/users`;

  getUsers(): Observable<{ users: User[] }> {
    return this.http.get<{ users: User[] }>(this.base);
  }
}

import { HttpClient } from "@angular/common/http";
import { computed, inject, Injectable, signal } from "@angular/core";
import { APP_CONFIG } from "../tokens/app-config.token";
import { AuthResponse, LoginRequest, RefreshResponse, RegisterRequest, User } from "../models/domain.models";
import { BehaviorSubject, catchError, map, Observable, of, tap } from "rxjs";

const ACCESS_TOKEN_KEY = 'pb_access_token';
const REFRESH_TOKEN_KEY = 'pb_refresh_token';
const USER_KEY = 'pb_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

    private readonly _currentUser = signal<User | null>(this.readStoredUser());
  readonly currentUser = this._currentUser.asReadonly();

  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly role = computed(() => this._currentUser()?.role ?? null);

  private readonly authStateSubject = new BehaviorSubject<User | null>(this._currentUser());
  readonly isAuthenticated$ = this.authStateSubject.pipe(map((u) => u !== null));

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.config.apiUrl}/auth/login`, payload).pipe(
      tap((res) => this.persistSession(res))
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.config.apiUrl}/auth/register`, payload).pipe(
      tap((res) => this.persistSession(res))
    );
  }

  refreshAccessToken(): Observable<RefreshResponse | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return of(null);
    }
    return this.http
      .post<RefreshResponse>(`${this.config.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap((res) => this.persistSession(res)),
        catchError(() => {
          this.logout();
          return of(null);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
    this.authStateSubject.next(null);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }


   private persistSession(res: AuthResponse | RefreshResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, res.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._currentUser.set(res.user);
    this.authStateSubject.next(res.user);
  }



  private readStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
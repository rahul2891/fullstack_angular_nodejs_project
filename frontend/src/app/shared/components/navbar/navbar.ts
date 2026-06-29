import { Component, inject } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { Store } from "@ngrx/store";
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthActions } from "../../../store/auth/auth.actions";
import { HasRoleDirective } from "../../directives/has-role.directive";

@Component({
    selector: 'pb-navbar',
    imports: [RouterLink, RouterLinkActive, HasRoleDirective],
     template: `
    @if (authService.isAuthenticated()) {
      <nav class="navbar">
        <a routerLink="/dashboard" class="brand">PulseBoard</a>

        <div class="links">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/projects" routerLinkActive="active">Projects</a>
          <a routerLink="/search" routerLinkActive="active">Search</a>
          <a *pbHasRole="['admin']" routerLink="/admin" routerLinkActive="active">Admin</a>
        </div>

        <div class="user">
          <span
            class="avatar"
            [style.background]="authService.currentUser()?.avatarColor"
          >
            {{ initials() }}
          </span>
          <span class="name">{{ authService.currentUser()?.name }}</span>
          <span class="role-badge">{{ authService.currentUser()?.role }}</span>
          <button class="logout-btn" (click)="logout()">Logout</button>
        </div>
      </nav>
    }
  `,
  styles: [
    `
      .navbar {
        display: flex;
        align-items: center;
        gap: 24px;
        padding: 0 24px;
        height: 60px;
        background: #14141c;
        color: #f4f4f6;
        border-bottom: 1px solid #26262f;
      }
      .brand {
        font-weight: 700;
        font-size: 18px;
        color: #fff;
        text-decoration: none;
        letter-spacing: -0.02em;
      }
      .links {
        display: flex;
        gap: 16px;
        flex: 1;
      }
      .links a {
        color: #9b9ba8;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        padding: 8px 4px;
        border-bottom: 2px solid transparent;
      }
      .links a.active {
        color: #fff;
        border-bottom-color: #7c5cfc;
      }
      .user {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        color: #fff;
      }
      .name {
        font-size: 14px;
        font-weight: 500;
      }
      .role-badge {
        font-size: 11px;
        text-transform: uppercase;
        background: #26262f;
        color: #9b9ba8;
        padding: 2px 8px;
        border-radius: 999px;
      }
      .logout-btn {
        background: transparent;
        border: 1px solid #34343f;
        color: #d4d4db;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
      }
      .logout-btn:hover {
        background: #26262f;
      }
    `,
  ],
})

export class Navbar {
    readonly authService = inject(AuthService);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  initials(): string {
    const name = this.authService.currentUser()?.name ?? '';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
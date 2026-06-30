import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { UsersApiService } from '../../core/services/users-api.service';
import { ProjectsActions } from '../../store/projects/projects.actions';
import { selectAllProjects } from '../../store/projects/projects.selectors';
import { User } from '../../core/models/domain.models';
import { InitialsPipe } from '../../shared/pipes/initials.pipe';

@Component({
  selector: 'pb-admin',
  standalone: true,
  imports: [CommonModule, InitialsPipe],
  template: `
    <div class="page">
      <h1>Admin</h1>

      <section>
        <h2>All users</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            @for (user of users; track user.id) {
              <tr>
                <td>
                  <span class="avatar" [style.background]="user.avatarColor">{{ user.name | initials }}</span>
                </td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td><span class="role-badge">{{ user.role }}</span></td>
              </tr>
            }
          </tbody>
        </table>
      </section>

      <section>
        <h2>All projects</h2>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Name</th>
              <th>Members</th>
            </tr>
          </thead>
          <tbody>
            @for (project of projects$ | async; track project.id) {
              <tr>
                <td>{{ project.key }}</td>
                <td>{{ project.name }}</td>
                <td>{{ project.memberIds.length }}</td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 800px;
        margin: 0 auto;
        padding: 32px 24px;
        color: #e4e4eb;
      }
      h1 {
        font-size: 22px;
        margin: 0 0 24px;
      }
      h2 {
        font-size: 14px;
        text-transform: uppercase;
        color: #9b9ba8;
        margin: 0 0 12px;
      }
      section {
        margin-bottom: 32px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        background: #16161d;
        border: 1px solid #26262f;
        border-radius: 10px;
        overflow: hidden;
      }
      th,
      td {
        text-align: left;
        padding: 10px 14px;
        font-size: 13px;
        border-bottom: 1px solid #26262f;
      }
      th {
        color: #71717e;
        font-weight: 500;
        text-transform: uppercase;
        font-size: 11px;
      }
      .avatar {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 600;
        color: #fff;
      }
      .role-badge {
        background: #26262f;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 11px;
        text-transform: uppercase;
      }
    `,
  ],
})
export class Admin implements OnInit {
  private readonly usersApi = inject(UsersApiService);
  private readonly store = inject(Store);

  readonly projects$ = this.store.select(selectAllProjects);
  users: User[] = [];

  ngOnInit(): void {
    this.usersApi.getUsers().subscribe((res) => (this.users = res.users));
    this.store.dispatch(ProjectsActions.loadProjects());
  }
}

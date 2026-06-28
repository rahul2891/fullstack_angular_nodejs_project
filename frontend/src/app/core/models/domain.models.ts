export type Role = 'admin' | 'manager' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  memberIds: string[];
  createdAt: string;
}

export type IssueStatus = 'backlog' | 'in_progress' | 'review' | 'done';
export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Issue {
  id: string;
  projectId: string;
  key: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId: string | null;
  reporterId: string;
  checklist: ChecklistItem[];
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  issueId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// API request/response DTOs
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface CreateIssueRequest {
  projectId: string;
  title: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string | null;
  labels?: string[];
}

export type UpdateIssueRequest = Partial<
  Pick<Issue, 'title' | 'description' | 'status' | 'priority' | 'assigneeId' | 'labels' | 'checklist'>
>;

export interface IssueFilters {
  projectId?: string;
  status?: IssueStatus;
  assigneeId?: string;
  search?: string;
}

export interface CreateProjectRequest {
  name: string;
  key: string;
  description?: string;
}

export const ISSUE_STATUSES: IssueStatus[] = ['backlog', 'in_progress', 'review', 'done'];
export const ISSUE_PRIORITIES: IssuePriority[] = ['low', 'medium', 'high', 'urgent'];

export const STATUS_LABELS: Record<IssueStatus, string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  review: 'In Review',
  done: 'Done',
};

import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { IssuesActions } from './issues.actions';
import { Issue, IssueStatus } from '../../core/models/domain.models';

export interface IssuesState extends EntityState<Issue> {
  loading: boolean;
  error: string | null;
  statusFilter: IssueStatus | null;
  searchTerm: string;
  /** Tracks ids currently mid-flight for an optimistic update, so the UI
   *  can show a subtle "saving..." indicator per-card if desired. */
  pendingUpdateIds: string[];
}

export const issuesAdapter: EntityAdapter<Issue> = createEntityAdapter<Issue>({
  selectId: (issue) => issue.id,
  // Keep newest-first ordering by default; the board groups by status
  // anyway, so this primarily affects list views.
  sortComparer: (a, b) => (a.createdAt < b.createdAt ? 1 : -1),
});

export const initialIssuesState: IssuesState = issuesAdapter.getInitialState({
  loading: false,
  error: null,
  statusFilter: null,
  searchTerm: '',
  pendingUpdateIds: [],
});

export const issuesReducer = createReducer(
  initialIssuesState,

  on(IssuesActions.loadIssues, (state) => ({ ...state, loading: true, error: null })),

  on(IssuesActions.loadIssuesSuccess, (state, { issues }) =>
    issuesAdapter.setAll(issues, { ...state, loading: false })
  ),

  on(IssuesActions.loadIssuesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(IssuesActions.createIssueSuccess, (state, { issue }) => issuesAdapter.addOne(issue, state)),

  on(IssuesActions.createIssueFailure, (state, { error }) => ({ ...state, error })),

  // --- Optimistic update flow ---
  // 1) UPDATE ISSUE fires immediately: apply the change NOW (optimistic),
  //    and remember the id is "pending" in case we need to roll back.
  on(IssuesActions.updateIssue, (state, { id, changes }) => ({
    ...issuesAdapter.updateOne({ id, changes }, state),
    pendingUpdateIds: [...state.pendingUpdateIds, id],
  })),

  // 2) Success: server confirmed - merge the authoritative server copy
  //    (e.g. updatedAt) and clear the pending flag.
  on(IssuesActions.updateIssueSuccess, (state, { issue }) => ({
    ...issuesAdapter.upsertOne(issue, state),
    pendingUpdateIds: state.pendingUpdateIds.filter((pendingId) => pendingId !== issue.id),
  })),

  // 3) Failure: ROLL BACK to the previous snapshot we saved when the
  //    optimistic update was dispatched.
  on(IssuesActions.updateIssueFailure, (state, { id, previous }) => ({
    ...issuesAdapter.upsertOne(previous, state),
    pendingUpdateIds: state.pendingUpdateIds.filter((pendingId) => pendingId !== id),
    error: 'Update failed - change was reverted',
  })),

  on(IssuesActions.deleteIssueSuccess, (state, { id }) => issuesAdapter.removeOne(id, state)),

  on(IssuesActions.setStatusFilter, (state, { status }) => ({ ...state, statusFilter: status })),

  on(IssuesActions.setSearchTerm, (state, { term }) => ({ ...state, searchTerm: term })),

  // --- Realtime events: same adapter methods, different trigger ---
  on(IssuesActions.issueReceivedViaSocket, (state, { issue }) =>
    issuesAdapter.upsertOne(issue, state)
  ),

  on(IssuesActions.issueRemovedViaSocket, (state, { id }) => issuesAdapter.removeOne(id, state))
);

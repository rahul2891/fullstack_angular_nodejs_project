import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IssuesState, issuesAdapter } from './issues.reducer';
import { IssueStatus } from '../../core/models/domain.models';

export const selectIssuesState = createFeatureSelector<IssuesState>('issues');

const { selectAll, selectEntities, selectIds, selectTotal } =
  issuesAdapter.getSelectors(selectIssuesState);

export const selectAllIssues = selectAll;
export const selectIssueEntities = selectEntities;
export const selectIssueIds = selectIds;
export const selectTotalIssues = selectTotal;

export const selectIssuesLoading = createSelector(selectIssuesState, (state) => state.loading);
export const selectIssuesError = createSelector(selectIssuesState, (state) => state.error);
export const selectStatusFilter = createSelector(selectIssuesState, (state) => state.statusFilter);
export const selectSearchTerm = createSelector(selectIssuesState, (state) => state.searchTerm);
export const selectPendingUpdateIds = createSelector(
  selectIssuesState,
  (state) => state.pendingUpdateIds
);

/** Look up a single issue by id - returns undefined if not loaded yet. */
export const selectIssueById = (id: string) =>
  createSelector(selectIssueEntities, (entities) => entities[id]);


export const selectFilteredIssues = createSelector(
  selectAllIssues,
  selectStatusFilter,
  selectSearchTerm,
  (issues, statusFilter, searchTerm) => {
    let result = issues;
    if (statusFilter) {
      result = result.filter((issue) => issue.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (issue) =>
          issue.title.toLowerCase().includes(q) ||
          issue.key.toLowerCase().includes(q) ||
          issue.description.toLowerCase().includes(q)
      );
    }
    return result;
  }
);

export const selectIssuesGroupedByStatus = createSelector(selectFilteredIssues, (issues) => {
  const groups: Record<IssueStatus, typeof issues> = {
    backlog: [],
    in_progress: [],
    review: [],
    done: [],
  };
  for (const issue of issues) {
    groups[issue.status].push(issue);
  }
  return groups;
});

/** Issues assigned to a specific user - used by "My Issues" on the dashboard. */
export const selectIssuesByAssignee = (assigneeId: string) =>
  createSelector(selectAllIssues, (issues) => issues.filter((i) => i.assigneeId === assigneeId));

import { createReducer, on } from '@ngrx/store';
import { Issue } from '../../core/models/domain.models';
import { IssuesActions } from './issues.actions';

export interface IssuesState {
  list: Issue[];
  loading: boolean;
  error: string | null;
}

const initialState: IssuesState = {
  list: [],
  loading: false,
  error: null,
};

export const issuesReducer = createReducer(
  initialState,
  on(IssuesActions.loadIssues, (state) => ({ ...state, loading: true, error: null })),
  on(IssuesActions.loadIssuesSuccess, (state, { issues }) => ({ ...state, list: issues, loading: false })),
  on(IssuesActions.loadIssuesFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(IssuesActions.createIssueSuccess, (state, { issue }) => ({
    ...state,
    list: [...state.list, issue],
  })),
  on(IssuesActions.updateIssueSuccess, (state, { issue }) => ({
    ...state,
    list: state.list.map((i) => (i.id === issue.id ? issue : i)),
  })),
);

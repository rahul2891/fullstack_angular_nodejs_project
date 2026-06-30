import { createActionGroup, props } from '@ngrx/store';
import {
  CreateIssueRequest,
  Issue,
  IssueFilters,
  UpdateIssueRequest,
} from '../../core/models/domain.models';

export const IssuesActions = createActionGroup({
  source: 'Issues',
  events: {
    'Load Issues': props<{ filters: IssueFilters }>(),
    'Load Issues Success': props<{ issues: Issue[] }>(),
    'Load Issues Failure': props<{ error: string }>(),

    'Create Issue': props<{ payload: CreateIssueRequest }>(),
    'Create Issue Success': props<{ issue: Issue }>(),
    'Create Issue Failure': props<{ error: string }>(),

    'Update Issue': props<{ id: string; changes: UpdateIssueRequest; previous: Issue }>(),
    'Update Issue Success': props<{ issue: Issue }>(),
    'Update Issue Failure': props<{ id: string; previous: Issue; error: string }>(),

    'Delete Issue': props<{ id: string }>(),
    'Delete Issue Success': props<{ id: string }>(),
    'Delete Issue Failure': props<{ error: string }>(),

    'Set Status Filter': props<{ status: Issue['status'] | null }>(),
    'Set Search Term': props<{ term: string }>(),

    // ---- Realtime (socket-originated) events ----
    'Issue Received Via Socket': props<{ issue: Issue }>(),
    'Issue Removed Via Socket': props<{ id: string }>(),
  },
});

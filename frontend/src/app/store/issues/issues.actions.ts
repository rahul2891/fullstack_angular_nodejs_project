import { createActionGroup, props } from '@ngrx/store';
import { CreateIssueRequest, Issue, UpdateIssueRequest } from '../../core/models/domain.models';

export const IssuesActions = createActionGroup({
  source: 'Issues',
  events: {
    'Load Issues': props<{ projectId: string }>(),
    'Load Issues Success': props<{ issues: Issue[] }>(),
    'Load Issues Failure': props<{ error: string }>(),
    'Create Issue': props<{ payload: CreateIssueRequest }>(),
    'Create Issue Success': props<{ issue: Issue }>(),
    'Create Issue Failure': props<{ error: string }>(),
    'Update Issue': props<{ id: string; changes: UpdateIssueRequest }>(),
    'Update Issue Success': props<{ issue: Issue }>(),
    'Update Issue Failure': props<{ error: string }>(),
  },
});

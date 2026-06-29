import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CreateProjectRequest, Project } from '../../core/models/domain.models';

export const ProjectsActions = createActionGroup({
  source: 'Projects',
  events: {
    'Load Projects': emptyProps(),
    'Load Projects Success': props<{ projects: Project[] }>(),
    'Load Projects Failure': props<{ error: string }>(),
    'Create Project': props<{ payload: CreateProjectRequest }>(),
    'Create Project Success': props<{ project: Project }>(),
    'Create Project Failure': props<{ error: string }>(),
  },
});

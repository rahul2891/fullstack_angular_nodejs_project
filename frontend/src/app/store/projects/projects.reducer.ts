import { createReducer, on } from '@ngrx/store';
import { Project } from '../../core/models/domain.models';
import { ProjectsActions } from './projects.actions';

export interface ProjectsState {
  list: Project[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  list: [],
  loading: false,
  error: null,
};

export const projectsReducer = createReducer(
  initialState,
  on(ProjectsActions.loadProjects, (state) => ({ ...state, loading: true, error: null })),
  on(ProjectsActions.loadProjectsSuccess, (state, { projects }) => ({ ...state, list: projects, loading: false })),
  on(ProjectsActions.loadProjectsFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(ProjectsActions.createProjectSuccess, (state, { project }) => ({
    ...state,
    list: [...state.list, project],
  })),
);

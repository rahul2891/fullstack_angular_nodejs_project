import { createReducer, on } from '@ngrx/store';
import { ProjectsActions } from './projects.actions';
import { Project } from '../../core/models/domain.models';

export interface ProjectsState {
  items: Project[];
  selectedProjectId: string | null;
  loading: boolean;
  error: string | null;
}

export const initialProjectsState: ProjectsState = {
  items: [],
  selectedProjectId: null,
  loading: false,
  error: null,
};

export const projectsReducer = createReducer(
  initialProjectsState,

  on(ProjectsActions.loadProjects, (state) => ({ ...state, loading: true, error: null })),

  on(ProjectsActions.loadProjectsSuccess, (state, { projects }) => ({
    ...state,
    items: projects,
    loading: false,
  })),

  on(ProjectsActions.loadProjectsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ProjectsActions.createProjectSuccess, (state, { project }) => ({
    ...state,
    items: [...state.items, project],
  })),

  on(ProjectsActions.selectProject, (state, { projectId }) => ({
    ...state,
    selectedProjectId: projectId,
  }))
);

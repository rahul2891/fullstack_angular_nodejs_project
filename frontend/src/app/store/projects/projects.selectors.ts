import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProjectsState } from './projects.reducer';

export const selectProjectsState = createFeatureSelector<ProjectsState>('projects');

export const selectAllProjects = createSelector(selectProjectsState, (state) => state.items);
export const selectProjectsLoading = createSelector(selectProjectsState, (state) => state.loading);
export const selectSelectedProjectId = createSelector(
  selectProjectsState,
  (state) => state.selectedProjectId
);

export const selectSelectedProject = createSelector(
  selectAllProjects,
  selectSelectedProjectId,
  (projects, selectedId) => projects.find((p) => p.id === selectedId) ?? null
);

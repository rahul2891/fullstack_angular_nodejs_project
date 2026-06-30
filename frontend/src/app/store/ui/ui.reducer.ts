import { createReducer, on } from '@ngrx/store';
import { UiActions } from './ui.actions';

export interface UiState {
  sidebarCollapsed: boolean;
}

export const initialUiState: UiState = {
  sidebarCollapsed: false,
};

export const uiReducer = createReducer(
  initialUiState,
  on(UiActions.toggleSidebar, (state) => ({
    ...state,
    sidebarCollapsed: !state.sidebarCollapsed,
  }))
);

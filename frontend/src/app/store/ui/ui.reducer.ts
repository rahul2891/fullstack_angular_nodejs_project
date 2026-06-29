import { createReducer } from '@ngrx/store';

export interface UiState {
  sidebarOpen: boolean;
}

const initialState: UiState = {
  sidebarOpen: true,
};

export const uiReducer = createReducer(initialState);

import { createActionGroup, emptyProps } from '@ngrx/store';

export const UiActions = createActionGroup({
  source: 'UI',
  events: {
    'Toggle Sidebar': emptyProps(),
  },
});
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { APP_CONFIG } from './core/tokens/app-config.token';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

import { authReducer } from './store/auth/auth.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { projectsReducer } from './store/projects/projects.reducer';
import { ProjectsEffects } from './store/projects/projects.effects';
import { issuesReducer } from './store/issues/issues.reducer';
import { IssuesEffects } from './store/issues/issues.effects';
import { uiReducer } from './store/ui/ui.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    // provideAnimations(),

    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),

    provideRouter(routes),

    provideStore({
      auth: authReducer,
      projects: projectsReducer,
      issues: issuesReducer,
      ui: uiReducer,
      router: routerReducer,
    }),
    provideEffects([AuthEffects, ProjectsEffects, IssuesEffects]),
    provideRouterStore(),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode(), autoPause: true }),

     {
      provide: APP_CONFIG,
      useValue: {
        apiUrl: environment.apiUrl,
        socketUrl: environment.socketUrl,
        features: { realtimeBoard: true },
      },
    },
  ]
};

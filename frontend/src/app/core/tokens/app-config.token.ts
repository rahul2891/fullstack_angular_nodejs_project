import { InjectionToken } from '@angular/core';

export interface AppConfig {
  apiUrl: string;
  socketUrl: string;
  /** Example feature flag - toggled per environment without a code change. */
  features: {
    realtimeBoard: boolean;
  };
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
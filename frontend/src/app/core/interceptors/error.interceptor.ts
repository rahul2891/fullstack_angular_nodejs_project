import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  return next(req).pipe(
    catchError((err) => {
      if (err.status >= 500) {
        notifications.error('A server error occurred. Please try again.');
      }
      return throwError(() => err);
    })
  );
};

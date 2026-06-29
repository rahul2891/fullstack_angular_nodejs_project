import { Injectable } from '@angular/core';
import { Observable, Subject, scan } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

type ToastAction = { kind: 'add'; toast: Toast } | { kind: 'remove'; id: number };

let nextId = 1;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly actions$ = new Subject<ToastAction>();

  /** Accumulated, de-duplicated list of currently visible toasts. */
  readonly toasts$: Observable<Toast[]> = this.actions$.pipe(
    scan((toasts, action) => {
      if (action.kind === 'add') {
        return [...toasts, action.toast];
      }
      return toasts.filter((t) => t.id !== action.id);
    }, [] as Toast[])
  );

  success(message: string): void {
    this.push(message, 'success');
  }

  error(message: string): void {
    this.push(message, 'error');
  }

  info(message: string): void {
    this.push(message, 'info');
  }

  dismiss(id: number): void {
    this.actions$.next({ kind: 'remove', id });
  }

  private push(message: string, type: Toast['type']): void {
    const toast: Toast = { id: nextId++, message, type };
    this.actions$.next({ kind: 'add', toast });
    // Auto-dismiss after 4 seconds.
    setTimeout(() => this.dismiss(toast.id), 4000);
  }
}

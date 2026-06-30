import { Injectable, OnDestroy, inject } from '@angular/core';
import { Observable, Subject, fromEventPattern } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { APP_CONFIG } from '../tokens/app-config.token';
import { Issue, Comment } from '../models/domain.models';

export type IssueSocketEvent =
  | { type: 'issue:created'; issue: Issue }
  | { type: 'issue:updated'; issue: Issue }
  | { type: 'issue:deleted'; id: string; projectId: string }
  | { type: 'comment:created'; comment: Comment };

@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {
     private readonly config = inject(APP_CONFIG);
  private socket: Socket | null = null;
  private readonly destroyed$ = new Subject<void>();

  private getSocket(): Socket {
    if (!this.socket) {
      this.socket = io(this.config.socketUrl, { transports: ['websocket', 'polling'] });
    }
    return this.socket;
  }

  joinProject(projectId: string): void {
    this.getSocket().emit('project:join', projectId);
  }

  leaveProject(projectId: string): void {
    this.getSocket().emit('project:leave', projectId);
  }

  get issueEvents$(): Observable<IssueSocketEvent> {
    const socket = this.getSocket();

    const created$ = fromEventPattern<Issue>(
      (handler) => socket.on('issue:created', handler),
      (handler) => socket.off('issue:created', handler)
    );
    const updated$ = fromEventPattern<Issue>(
      (handler) => socket.on('issue:updated', handler),
      (handler) => socket.off('issue:updated', handler)
    );
    const deleted$ = fromEventPattern<{ id: string; projectId: string }>(
      (handler) => socket.on('issue:deleted', handler),
      (handler) => socket.off('issue:deleted', handler)
    );
    const commentCreated$ = fromEventPattern<Comment>(
      (handler) => socket.on('comment:created', handler),
      (handler) => socket.off('comment:created', handler)
    );

    return new Observable<IssueSocketEvent>((subscriber) => {
      const subs = [
        created$.subscribe((issue) => subscriber.next({ type: 'issue:created', issue })),
        updated$.subscribe((issue) => subscriber.next({ type: 'issue:updated', issue })),
        deleted$.subscribe((evt) =>
          subscriber.next({ type: 'issue:deleted', id: evt.id, projectId: evt.projectId })
        ),
        commentCreated$.subscribe((comment) =>
          subscriber.next({ type: 'comment:created', comment })
        ),
      ];
      return () => subs.forEach((s) => s.unsubscribe());
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.disconnect();
  }
  
}
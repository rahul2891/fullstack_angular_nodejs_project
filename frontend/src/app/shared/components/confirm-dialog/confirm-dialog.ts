import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'pb-confirm-dialog',
  standalone: true,
  template: `
    @if (open) {
      <div class="overlay" (click)="cancel.emit()">
        <div class="dialog" (click)="$event.stopPropagation()">
          <h3>{{ title }}</h3>
          <p>{{ message }}</p>
          <div class="actions">
            <button class="btn-ghost" (click)="cancel.emit()">Cancel</button>
            <button class="btn-danger" (click)="confirm.emit()">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 200;
      }
      .dialog {
        background: #1c1c24;
        border: 1px solid #2e2e38;
        border-radius: 12px;
        padding: 24px;
        width: 360px;
        color: #e4e4eb;
      }
      h3 {
        margin: 0 0 8px;
        font-size: 16px;
      }
      p {
        margin: 0 0 20px;
        font-size: 14px;
        color: #9b9ba8;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .btn-ghost {
        background: transparent;
        border: 1px solid #34343f;
        color: #d4d4db;
        padding: 8px 14px;
        border-radius: 6px;
        cursor: pointer;
      }
      .btn-danger {
        background: #d6455a;
        border: none;
        color: #fff;
        padding: 8px 14px;
        border-radius: 6px;
        cursor: pointer;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone.';
  @Input() confirmLabel = 'Delete';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}

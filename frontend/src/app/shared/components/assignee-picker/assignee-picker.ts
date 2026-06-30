import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { User } from '../../../core/models/domain.models';
import { InitialsPipe } from '../../pipes/initials.pipe';

@Component({
  selector: 'pb-assignee-picker',
  standalone: true,
  imports: [InitialsPipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      // forwardRef is required because AssigneePickerComponent is being
      // referenced inside its OWN class decorator, before the class
      // itself has finished being defined.
      useExisting: forwardRef(() => AssigneePickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="picker" [class.disabled]="disabled">
      <button
        type="button"
        class="trigger"
        (click)="toggleOpen()"
        (blur)="onTouched()"
        [disabled]="disabled"
      >
        @if (selectedUser()) {
          <span class="avatar" [style.background]="selectedUser()!.avatarColor">
            {{ selectedUser()!.name | initials }}
          </span>
          <span>{{ selectedUser()!.name }}</span>
        } @else {
          <span class="avatar unassigned">?</span>
          <span class="placeholder">Unassigned</span>
        }
      </button>

      @if (open) {
        <ul class="dropdown">
          <li (click)="select(null)">
            <span class="avatar unassigned">?</span>
            <span>Unassigned</span>
          </li>
          @for (user of users; track user.id) {
            <li (click)="select(user.id)">
              <span class="avatar" [style.background]="user.avatarColor">{{ user.name | initials }}</span>
              <span>{{ user.name }}</span>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [
    `
      .picker {
        position: relative;
        display: inline-block;
      }
      .trigger {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #1c1c24;
        border: 1px solid #2e2e38;
        border-radius: 8px;
        padding: 6px 12px;
        color: #e4e4eb;
        cursor: pointer;
        font-size: 14px;
        min-width: 160px;
      }
      .picker.disabled .trigger {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .avatar {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 600;
        color: #fff;
        flex-shrink: 0;
      }
      .avatar.unassigned {
        background: #3a3a45;
      }
      .placeholder {
        color: #8b8b97;
      }
      .dropdown {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        background: #1c1c24;
        border: 1px solid #2e2e38;
        border-radius: 8px;
        list-style: none;
        margin: 0;
        padding: 4px;
        min-width: 200px;
        z-index: 50;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      }
      .dropdown li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        color: #e4e4eb;
      }
      .dropdown li:hover {
        background: #26262f;
      }
    `,
  ],
})
export class AssigneePickerComponent implements ControlValueAccessor {
  @Input() users: User[] = [];

  open = false;
  disabled = false;
  private value: string | null = null;

  /** Callback supplied by Angular forms - call it whenever the value changes. */
  private onChangeFn: (value: string | null) => void = () => {};
  /** Callback supplied by Angular forms - call it on blur/interaction. */
  onTouched: () => void = () => {};

  selectedUser(): User | undefined {
    return this.users.find((u) => u.id === this.value);
  }

  toggleOpen(): void {
    if (this.disabled) return;
    this.open = !this.open;
  }

  select(userId: string | null): void {
    this.value = userId;
    this.open = false;
    this.onChangeFn(userId);
    this.onTouched();
  }

  // --- ControlValueAccessor interface ---

  /** FORMS -> COMPONENT: called when the FormControl's value is set externally. */
  writeValue(value: string | null): void {
    this.value = value;
  }

  /** COMPONENT -> FORMS: Angular gives us this function; we call it on every user change. */
  registerOnChange(fn: (value: string | null) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

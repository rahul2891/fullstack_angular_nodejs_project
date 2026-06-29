import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/domain.models';

@Directive({
  selector: '[pbHasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnInit {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  private allowedRoles: Role[] = [];
  private inserted = false;

  @Input() set pbHasRole(roles: Role[]) {
    this.allowedRoles = roles;
    this.updateView();
  }

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    const currentRole = this.authService.role();
    const shouldShow = !!currentRole && this.allowedRoles.includes(currentRole);

    if (shouldShow && !this.inserted) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.inserted = true;
    } else if (!shouldShow && this.inserted) {
      this.viewContainer.clear();
      this.inserted = false;
    }
  }
}
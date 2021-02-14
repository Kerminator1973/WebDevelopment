import { Directive, Input, ViewContainerRef, TemplateRef } from '@angular/core';
import { AuthService } from '../_services/auth.service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective {
  @Input() appHasRole: string[];
  isVisible = false;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private authService: AuthService) { }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    const userRoles = this.authService.decodedToken.role as Array<string>;
    // If no roles clear the viewContainerRef
    if (!userRoles) {
      // Сбрасываем содержимое отображаемого контейнера
      this.viewContainerRef.clear();
    }

    // if user has role need then render ther element
    if (this.authService.roleMatch(this.appHasRole)) {
      if (!this.isVisible) {
        this.isVisible = true;
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      } else {
        this.isVisible = false;
        this.viewContainerRef.clear();
      }
    }
  }
}

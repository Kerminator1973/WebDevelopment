import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router,
    private alertify: AlertifyService) {}

  canActivate(next: ActivatedRouteSnapshot): boolean {

    if (null !== next.firstChild) {
      const roles = next.firstChild.data['roles'] as Array<string>;
      if (roles) {
        const match = this.authService.roleMatch(roles);
        if (match) {
          return true;
        } else {
          this.router.navigate(['members']);
          this.alertify.error('You are not authorized to access this area');
        }
      }
    }

    // Проверяем, выполнил ли пользователь аутентификацию для того
    // чтобы попасть на страницу
    if (this.authService.loggedIn()) {
      return true;
    }

    // Если пользователь не был аутентифицирован, то выводим сообщение об
    // ошибке и переадрессуем его на главную страницу
    this.alertify.error('You need to be logged in to access this area');
    this.router.navigate(['/home']);
    return false;
  }
}

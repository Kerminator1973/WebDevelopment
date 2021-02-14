import { Injectable } from '@angular/core';
import { User } from '../_models/User';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { AlertifyService } from '../_services/alertify.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class MemberDetailResolver implements Resolve<User> {
    constructor(private userService: UserService, private router: Router,
        private alertify: AlertifyService) {}

    // Функция осуществляет асинхронный вызов javascript-сервиса, загружающего
    // с сервера информацию о пользователе
    resolve(route: ActivatedRouteSnapshot): Observable<User> {
        return this.userService.getUser(route.params['id']).pipe(
            // В случае, если получить информацию не удасться, будет
            // выведено сообщение об ошибке (Alertify) и произойдёт
            // переключение на закладку "Members"
            catchError(error => {
                this.alertify.error('Problem retrieving data');
                this.router.navigate(['/members']);
                return of(null);
            })
        );
    }
}

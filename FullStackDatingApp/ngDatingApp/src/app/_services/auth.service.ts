import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';
import { User } from '../_models/User';

@Injectable()
export class AuthService {

  // Сетевой адрес (URL) ASP.NET-сервиса (WebAPI)
  baseUrl = environment.apiUrl + 'auth/';

  // Токен, полученный от сервера после успешеой аутентификации
  userToken: any;

  // Расшифрованный JWT
  decodedToken: any;

  // Используется для работы с JSON Web Tokens
  jwtHelper: JwtHelperService = new JwtHelperService();

  // Используется для отрисовки фотографии пользователя в navbar
  currentUser: User;

  // Используется для обновления фотографии пользователя в navbar.
  // Демонстрация взаимодействия любого компонента с любым другим
  // компонентом (ant to any).
  // Единственный параметр конструктора - картинка "по умолчанию"
  photoUrl = new BehaviorSubject<string>('../../assets/user.png');

  // Поскольку свойство currentPhotoUrl является Observable,
  // можно подписаться на его изменения
  currentPhotoUrl = this.photoUrl.asObservable();

  // Выполняем Injection сервиса для доступа к ресурсам по протоколу Http
  constructor(private http: HttpClient) { }

  changeMemberPhoto(photoUrl: string) {
    this.photoUrl.next(photoUrl);
  }

  login(model: any) {

    // Добавляем в запрос дополнительное поле, указывающее на то, что
    // контент является JSON-объектом
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    // Посылаем запрос на указанный адрес. Модель - набор дополнительных
    // полей, которые будут включены в запрос. По факту, модель содержит
    // два поля: username и password.
    // В Angular 6, ответ на запрос обрабатывается в pipe. Тип body указывается
    // как специализация шаблона HttpResponse<>.
    // Большая статья о миграции на Angular 6:
    // https://github.com/ReactiveX/rxjs/blob/master/docs_app/content/guide/v6/migration.md
    return this.http.post(this.baseUrl + 'login', model)
    .pipe(
      map((response: any) => {

        // ASP.NET-сервис аутентификации, в ответ на username/password вернёт
        // JSON-сообщение, в котором будет передано поле "tokenString", которое
        // следует сохранить в локальном хранилище для дальнейшего использования
        const user = response;
        if (user) {

          localStorage.setItem('token', user.token);
          localStorage.setItem('user', JSON.stringify(user.user));
          this.decodedToken = this.jwtHelper.decodeToken(user.token);
          this.currentUser = user.user;

          // В случае успешной аутентификации пользователя, вызваем
          // метод, который активирует рассылку обновления свойства
          // photoUrl
          this.changeMemberPhoto(this.currentUser.photoUrl);
        }
      }),
      catchError(this.handleError)
    );
  }

  register(user: User) {

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.post(this.baseUrl + 'register', user, httpOptions).pipe(
      map((response: HttpResponse<any>) => {

      }),
      catchError(this.handleError)
    );
  }

  loggedIn() {
    // Проверяем, не закончилось ли время действия токена.
    // Дополнительно: https://www.npmjs.com/package/@auth0/angular-jwt
    return !this.jwtHelper.isTokenExpired(localStorage.getItem('token'));
  }

  // Раньше эта функция получала объект типа Response и обрабатывала его
  // поля с целью поиска описания различных ошибок.
  // При переходе на Angular 6, подобная обработка была перенесена в отдельный
  // сервис - ErrorInterceptor.
  // По сути, здесь осталась только заглушка, транслирующая текст ошибки
  // в обработчик pipe
  private handleError(error: any) {
    return throwError(error);
  }

  roleMatch(allowedRoles): boolean {

    let isMatch = false;
    const userRoles = this.decodedToken.role as Array<string>;
    allowedRoles.forEach(element => {
      if (userRoles.includes(element)) {
        isMatch = true;
        return;
      }
    });

    return isMatch;
  }
}

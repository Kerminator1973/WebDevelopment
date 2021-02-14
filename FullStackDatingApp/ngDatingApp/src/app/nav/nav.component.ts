import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {};
  photoUrl: string;

  // По уму, все сервисы, встраиваемые (Injected) в компонент, должны
  // быть private. Вместе с тем, в нашем случае, это будет приводить к ошибке,
  // т.к. сервис используется в nav.component.html. Проблему можэно решить
  // разными способами, но поскольку это не критично, встраиваемый сервис
  // определён как public, а не как private
  constructor(public authService: AuthService, private alartify: AlertifyService,
    private router: Router) {}

  ngOnInit() {
    // Подписываемся на сообщение сервиса authService об изменении
    // свойства photoUrl через объект currentPhotoUrl
    this.authService.currentPhotoUrl.subscribe(photoUrl => this.photoUrl = photoUrl);
  }

  login() {
    // В момент, когда пользователь нажмёт кнопку Login, поля
    // входящие в состав модели (username и password) будут переданы
    // в authService, который выполнит аутентификацию пользователя
    // посредством ASP.NET-приложения
    this.authService.login(this.model).subscribe(next => {
      this.alartify.success('logged in successfully');
    }, error => {
      console.log(error); // Дополнительно фиксируем текст сообщения в логах
      this.alartify.error(error);
    }, () => {
      // Третий параметр функции subscribe() является анонимной
      // функцией, которая вызывается после того, как вызов
      // является полностью завершённым.
      // В нашем случае, мы переходим на страницу "members"
      this.router.navigate(['/members']);
    });
  }

  logout() {
    // При нажатии на кнопку с командой "Logout", ссылка на аутентификационный
    // токен ASP.NET-приложения будет сброшен, а также, он будет удалён из
    // хранилища токенов (local storage)
    this.authService.userToken = null;
    localStorage.removeItem('token');
    this.alartify.message('logged out');

    // Удаляем из localStorage данные о пользователе
    localStorage.removeItem('user');
    this.authService.decodedToken = null;
    this.authService.currentUser = null;

    // При выходе из account-а переходим на главную страницу
    this.router.navigate(['/home']);
  }

  // Метод используется для проверки существования аутентификационного токена,
  // что является синонимом успешной аутентификации
  loggedIn() {
    return this.authService.loggedIn();
  }
}

# aspnetDatingApp - backend приложения "Сайт знакомств"

Приложение было разработано при прохождении курса "Build an app with ASPNET Core and Angular from scratch" за авторством  – Neil Cummings.

Проект состоит из двух частей - backend-компонента, разработанного на ASP.NET Core 2 и front-end решения на Anguler.

Основа front-end решения была сгенерирована посредством [Angular CLI](https://github.com/angular/angular-cli). В дальнейшем, проект был портирован на Angular 6 и позднее, на Angular 8.1.0.

## Development server - запуск в режиме разработчика

Запуск backend-приложения осуществляется командой `dotnet run` из подкаталога с файлом проекта - "\DatingApp\aspnetDatingApp".

Запуск frontend-приложения осуществляется командой `ng serve`. Далее следует перейти по адресу `http://localhost:4200/`.

Для отладки приложения рекомендуется использовать имена пользователей сгенерированные посредством ресурса [Random User](https://randomuser.me/). Рекомендуется использовать один и тот же пароль, например: `password`.

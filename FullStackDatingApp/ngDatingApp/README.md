# ngDatingApp - front-end приложения "Сайт знакомств"

Приложение было разработано при прохождении курса "Build an app with ASPNET Core and Angular from scratch" за авторством  – Neil Cummings.

Проект состоит из двух частей - backend-компонента, разработанного на ASP.NET Core 2 и front-end решения на Angular.

Основа front-end решения была сгенерирована посредством [Angular CLI](https://github.com/angular/angular-cli). В дальнейшем, проект был портирован на Angular 6 и позднее, на Angular 8.1.0.

## Development server - запуск в режиме разработчика

Запуск backend-приложения осуществляется командой `dotnet run` из подкаталога с файлом проекта - "\DatingApp\aspnetDatingApp".

Запуск frontend-приложения осуществляется командой `ng serve`. Далее следует перейти по адресу `http://localhost:4200/`.

Запуск с использованием https с локальной проверкой сертификатов: https://medium.com/@richardr39/using-angular-cli-to-serve-over-https-locally-70dab07417c8

Для отладки приложения рекомендуется использовать имена пользователей сгенерированные посредством ресурса [Random User](https://randomuser.me/). Рекомендуется использовать один и тот же пароль, например: `password`.

## Upgrade to Angular 8

При получении письма от GitHub о наличии уязвимостей в коде, было принято решение обновить используемые компоненты и перейти на актуальную версию Angular 8.

В файле «package.json» содержится список компонентов от которых проект зависит явным образом. Также в проекте есть файл «package-lock.json», в котором содержаться все зависимости, включая неявные. Для того, чтобы узнать, какие компоненты устарели можно применить команду `npm outdated`

Чтобы автоматически обновить версии компонентов в файле «package.json» можно использовать специализированный инструмент – [ncu](https://www.npmjs.com/package/npm-check-updates). Автоматическое обновление содержимого файла «package.json» осуществляется командой `ncu -u`.

Обновление зависимостей выполняется командой `npm install`.

Для того, чтобы обновить Angular CLI, без которого проект не может быть собран, необходимо выполнить команду
`ng update @angular/cli`. Предварительно следует сохранить изменённые файлы в репозиторий, или в stash репозитория.

Дополнительно может потребоваться выполнить команду `npm audit fix`.

Тем не менее, при запуске проекта на компиляцию и исполнение может быть получено сообщение об ошибке: «ERROR in The Angular Compiler requires TypeScript >=3.4.0 and <3.5.0 but 3.5.1 was found instead». Чтобы решить эту проблему, следует установить соответствующую версия transpiler TypeScript `npm install typescript@">=3.4.0 <3.5.0"`

## Что пришлось изменить при портировании кода на Angular 8

Потребовалось добавить ещё один параметр в определение @ViewChild. Этот декоратор используется для доступа к дочерним элементам в DOM. В частности, декоратор позволяет связать ссылочную переменную headerEl с полем h4. В Angular 8 у декоратора появился второй параметр - static. Посредством этого параметра мы указываем, является ли DOM-элемент статическим, или он входит в состав макросов ngIf и/или ngFor. Если элемент является статическим, то мы можем изменять его значение не только в обработчике события ngAfterViewInit(), но и в ngOnInit().

В нашем примере, элемент с идентификатором header является статическим.

[Статья](https://blog.ninja-squad.com/2019/05/29/what-is-new-angular-8.0/) о втором параметре декоратора.

Код Angular 4:

```javascript
@ViewChild("header") headerEl: ElementRef;
```

Код Angular 8:

```javascript
@ViewChild("header", { static: false }) headerEl: ElementRef;
```
Также потребовалось отключить поддержку Reflection для [Evergreen Browsers](https://www.techopedia.com/definition/31094/evergreen-browser).

Код Angular 4:

```javascript
import 'core-js/es6/reflect';
import 'core-js/es7/reflect';
```

В коде Angular 8 я перестал их импортировать. Эти два packages имеет смысл импортировать в том случае, если проект использует Reflect API. В моём случае это не актуально.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

# NgFirstApp - это мой первый проект на Angular

Приложение отображает на экране вопросы-шутки и позволяет добавить новые. Основная цель приложения - научится создавать контент динамически, добавляя новые блоки кода.

Основа для проекта была сгенерирована посредством [Angular CLI](https://github.com/angular/angular-cli) версии 1.4.5.

В дальнейшем, проект был портирован на [Angular 8](https://angular.io/).

## Development server - запуск в режиме разработчика

Запуск проекта в режиме разработчика осуществляется командой `ng serve`. Далее следует перейти по адресу `http://localhost:4200/`. Запущенное приложение будет автоматически перезапускаться при внесении изменений в проект.

## Code scaffolding - генерация кода

Для генерации нового компонента можно использовать команду `ng generate component component-name`. Можно выполнять генерацию и других единиц сборки: `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build - сборка проекта

Чтобы собрать проект, выполните команду `ng build`. Файлы компиляции будут сохранены в папку `dist/`. Используйте флаг `-prod` для сборки проекта в режиме промышленной эксплуатации.

## Upgrade to Angular 8

При получении письма от GitHub о наличии уязвимостей в коде, было принято решение обновить используемые компоненты и перейти на актуальную версию Angular 8.

В файле «package.json» содержится список компонентов от которых проект зависит явным образом. Также в проекте есть файл «package-lock.json», в котором содержаться все зависимости, включая неявные. Для того, чтобы узнать, какие компоненты устарели можно применить команду `npm outdated`

Чтобы автоматически обновить версии компонентов в файле «package.json» можно использовать специализированный инструмент – [ncu](https://www.npmjs.com/package/npm-check-updates). Автоматическое обновление содержимого файла «package.json» осуществляется командой `ncu -u`.

Обновление зависимостей выполняется командой `npm install`.

Для того, чтобы обновить Angular CLI, без которого проект не может быть собран, необходимо выполнить команду
`ng update @angular/cli`. Предварительно следует сохранить изменённые файлы в репозиторий, или в stash репозитория.

Тем не менее, при запуске проекта на компиляцию и исполнение может быть получено сообщение об ошибке: «ERROR in The Angular Compiler requires TypeScript >=3.4.0 and <3.5.0 but 3.5.1 was found instead». Чтобы решить эту проблему, следует установить соответствующую версия transpiler TypeScript `npm install typescript@">=3.4.0 <3.5.0"`

## Что пришлось изменить при портировании кода на Angular 8

В приложении используется Dependency Injection, в частности, создаётся сервис JokeService, который является контейнером данных, хранит текст шуток и позволяет добавлять/удалять шутки и контейнера. Этот сервис встраивается (injected) в компонент пользовательского интерфейса JokeListComponent. По сути, JokeService является Model, а JokeListComponent - View. В Angular 4 при создании Injectable-сервиса использовался класс OpaqueToken, а в Angular 8 он называется InjectionToken. OpaqueToken/InjectionToken - это не более, чем настроечный параметр сервиса, который определён в файле "app.module.js".

Код Angular 4:

```javascript
import { Inject, OpaqueToken } from '@angular/core';
export const MAX_JOKES_TOKEN = new OpaqueToken('Max Jokes');
```

Код Angular 8:

```javascript
import { Inject, InjectionToken } from '@angular/core';
export const MAX_JOKES_TOKEN = new InjectionToken('Max Jokes');
```

Объяснение необходимости замены OpaqueToken на InjectionToken дано в [статье](http://stepansuvorov.com/blog/2017/03/angular-opaquetoken-%D0%B8%D0%BB%D0%B8-injectiontoken/).

Кроме этого, потребовалось добавить ещё один параметр в определение @ViewChild. Этот декоратор используется для доступа к дочерним элементам в DOM. В частности, декоратор позволяет связать ссылочную переменную headerEl с полем h4. В Angular 8 у декоратора появился второй параметр - static. Посредством этого параметра мы укаываем, является ли DOM-элемент статическим, или он входит в состав макросов ngIf и/или ngFor. Если элемент является статическим, то мы можем изменять его значение не только в обработчике события ngAfterViewInit(), но и в ngOnInit().

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

В коде Angular 8 я перестал их импортировать.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

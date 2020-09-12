# angularExercises
Задачи по разработке кода на Angular, выполненные в рамках курсов и книг. В репозитарий взходят проекты:

NgFirstApp - это мой первый проект на Angular. Приложение отображает на экране вопросы-шутки и позволяет добавлять новые. Основная цель приложения - научится создавать контент динамически, добавляя новые блоки кода.

NgCarousel - прототип блога и RxJS. Приложение отображает на экране список сообщений из "блога", а также выводит в pipe квадрат секунды в течение 30 секунд.

NgMusicSearch - пример использования REST API (Apple iTunes). Приложение предоставляет возможность пользователю ввести название группы, альбома, или композиции и осуществляет поиск соответствующей информации в базе данных iTunes.

Основа для всех проекоеа была сгенерирована посредством [Angular CLI](https://github.com/angular/angular-cli) версии 1.4.5. В дальнейшем, проекты были портированы на Angular 8.

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

Тем не менее, при запуске проекта на компиляцию и исполнение может быть получено сообщение об ошибке: «ERROR in The Angular Compiler requires TypeScript >=3.4.0 and <3.5.0 but 3.5.1 was found instead». Чтобы решить эту проблему, следует установить соответствующую версию transpiler TypeScript `npm install typescript@">=3.4.0 <3.5.0"`

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


Angular 8 реализован более модульным, чем Angular 4 и это потребовало изменить набор включаемых файлов.

Код Angular 4:

```javascript
import { Observable } from 'rxjs/Rx';
```

Код Angular 8:

```javascript
import { Observable, of } from 'rxjs';
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { map } from 'rxjs/operators';
```

Также был изменён код запуска interval(), т.е. периодических действий с таймером, нацеленных на динамическое изменение содержимого DOM.

Код Angular 4:

```javascript
return Observable
      .interval(1000)   // Генерируем события 1 раз в секунду
      .take(32)         // Всего нужно сгенерировать 33 события от 0 до 31
      .map((v) => v*v)  // Каждое значение будет возведено в квадрат
```

Код Angular 8:

```javascript
return interval(1000).pipe(take(32), map((v) => v * v));
```

Кроме этого, потребовалось добавить ещё один параметр в определение @ViewChild. Этот декоратор используется для доступа к дочерним элементам в DOM. В частности, декоратор позволяет связать ссылочную переменную headerEl с полем h4. В Angular 8 у декоратора появился второй параметр - static. Посредством этого параметра мы укаываем, является ли DOM-элемент статическим, или он входит в состав макросов ngIf и/или ngFor. Если элемент является статическим, то мы можем изменять его значение не только в обработчике события ngAfterViewInit(), но и в ngOnInit().

В нашем пример, элемент с идентификатор header является статическим.

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

Для того, чтобы код собирался в Angular 8, мне потребовалось установить специфическую версию core-js: `npm install core-js@2.6.5 --save`. На 2 июня 2019 года, использование core-js 3 приводило к появлению ошибки компиляции.

Значительным изменением в актуальных версиях Angular является отказ от использования HttpModule, JsonpModule и Jsonp в пользу HttpClientModule, HttpClientJsonpModule и HttpClient. Ключевой документ по миграции доступен по [ссылке](https://angular.io/guide/deprecations#http). Развёрнутая статья об использование HttpClient доступна [здесь](https://www.techiediaries.com/angular-http-client/).

Импортируемые модули и Dependency Injections в Angular 4:

```javascript
import {HttpModule, Http, Response} from '@angular/http';
import {JsonpModule, Jsonp} from '@angular/http';
...
constructor(private jsonp: Jsonp) {
```

Код на Angular 8:

```javascript
import {HttpClientModule } from '@angular/common/http';
import {HttpClientJsonpModule, HttpClient } from '@angular/common/http';
...
constructor(private jsonp: HttpClient) {
```

Ключевое отличие в подходах у Angular 4 и Angular 8 состоит в использовании функции json() в Angular 4, а также использовании параметра HTTP-запроса "callback=JSONP_CALLBACK" используемого при взаимодействии с WebAPI iTunes.

Код на Angular 4:

```javascript
const apiURL = `${this.apiRoot}?term=${term}&media=music&limit=20&callback=JSONP_CALLBACK`;
this.jsonp.request(apiURL)
    .toPromise()
    .then(
        res => { // Success
            this.results = res.json().results.map(item => {
```

Код на Angular 8:

```javascript
const apiURL = `${this.apiRoot}?term=${term}&media=music&limit=20`;
this.jsonp.get(apiURL)
    .toPromise()
    .then(
        (res: any) => { // Success
            this.results = res.results.map((item: any) => {
```

Кроме этого, потребовалось внести изменения в файл "src/app/app.module.ts".

Код на Angular 4:

```javascript
import { HttpModule, JsonpModule } from '@angular/http';
...
@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    JsonpModule,
    RouterModule.forRoot(routes, {useHash: true})
  ],
```

Код на Angular 8:

```javascript
import { HttpClientModule } from '@angular/common/http';
import { HttpClientJsonpModule, HttpClient } from '@angular/common/http';
...
@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes, {useHash: true})
  ],
```

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

# NgMusicSearch - пример использования REST API (Apple iTunes)

Приложение предоставляет возможность пользователю ввести название группы, альбома, или композиции и осуществляет поиск соответствующей информации в базе данных iTunes.

Основа для проекта была сгенерирована посредством [Angular CLI](https://github.com/angular/angular-cli) версии 1.4.5.

В дальнейшем, проект был портирован на Angular 8.

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

В отличие от репозитариев ngCarousel и ngFirstApp я попытался сохранить поддержку Reflection для [Evergreen Browsers](https://www.techopedia.com/definition/31094/evergreen-browser). Код Angular 4 выглядел так:

```javascript
import 'core-js/es6/reflect';
import 'core-js/es7/reflect';
```

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

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

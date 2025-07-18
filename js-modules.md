# Модульная система в браузере

В [современных браузерах](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) мы можем использовать модульную систему, т.е. импортировать один js-файл из другого. Ключевое ограничение состоит в том, что этот функционал работает только в том случае, если оба файла относятся к модульной системе, т.е. определены в HTML-коде, как модули. Например:

```html
<script type="module" src="~/js/moduleLinker.mjs"></script>
<script type="module" src="~/js/topologyScheme.js"></script>
```

Использование расширения `mjs` указывает, что файл содержит модульный JavaScript.

Предположим, реализация модуля выглядит следующим образом:

```js
export function mLinker(a, b) {
    console.log("Hello from moduleLinker.mjs");
    return a + b;
}
```

Для включения модуля может быть использована директива **import**:

```js
import { mLinker } from './moduleLinker.mjs';
```

Использование функции загруженной из модуля выглядит вот так:

```js
document.addEventListener('DOMContentLoaded', function (event) {

    const res = mLinker(3, 4);
    console.log("linker result: " + res);
```

Использование модульной системы будет означать применение строго синтаксиса (strict), т.е. сразу же будут запрещены разные "вольности". В частности:

- нельзя использовать глобальные переменные, т.е. исчезнет глобальная видимость
- нельзя использовать не определённые переменные. Например, вот такой код будет не корректным: `divID = 5`, если divID не был определён ранее

## Множественный экспорт и default экспорт

Каждый файл может экспортировать либо несколько объектов/переменных/значений, либо один "по умолчанию".

Экспорт нескольких объектов выглядит следующим образом:

```js
export let apiKey = "myApiKey_gdsg7993487sdi893475";
export let apiName = "MyApiKey";
```

Импортировать эти объекты в другой файле можно с помощью директивы **import**. Например:

```js
import { apiKey, apiName } from "./myapi.js";
```

Если мы соблюдаем принцип "один модуль/одна задача", то мы можем осуществлять "экспорт по умолчанию". Например:

```js
export default "myApiKey_gdsg7993487sdi893475";
```

Заметим, что экспортируемая default функция может быть анонимной:

```js
export default () => {
    console.log('Hello');
}
```

Чтобы импортировать такой экспорт не нужно использовать фигурные скобки, но нужно задавать имя импортируемому объекту:

```js
import apiKey from "./myapi.js";
```

Заметим, что разработчики на React не должны указывать расширение при импорте модуля - система сборки сделает это самостоятельно. Также следует заметить, что React-разработчики обычно используют `export default`.

Для того, чтобы избежать коллизии имён, при импорте мы можем поменять имя импортируемого объекта, используя ключевое слово `as`, например:

```js
import { apiKey, apiName as specificApiName } from "./myapi.js";
```

Также можно импортировать все имена, использую специальную конструкцию:

```js
import * as utils from "./myapi.js";
```

В этом случае, мы должны будем использовать объект utils для доступа к импортированным объектам:

```js
console.log(utils.apiKey);
console.log(utils.apiName);
```

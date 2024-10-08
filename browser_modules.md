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

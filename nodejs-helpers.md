# Полезные утилиты и трюки

- **superagent** - утилита, выполняющая http-запрос. См.: https://www.npmjs.com/package/superagent
- **mkdirp** - небольшая утилита, которая создаёт подкаталоги рекурсивно. См.: https://www.npmjs.com/package/mkdirp

Пример использования **superagent**:

```js
import superagent from 'superagent';
...
superagent.get(url).end((err, res) => ...);
```

## Rest parameters

В JavaScript есть поддержка функций с переменным числом параметров. Этот функционал называется [Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters) и является реализацией концепции [Variadic function](https://en.wikipedia.org/wiki/Variadic_function):

```js
function sum(...theArgs) {
    let total = 0;
    for (const arg of theArgs) {
        total += arg;
    }
    return total;
}

console.log(sum(1, 2, 3));
// Expected output: 6

console.log(sum(1, 2, 3, 4));
// Expected output: 10
```

## Таймеры высокого разрешения

В Node.js есть таймеры высокого разрешения - process.hrtime().

Пример класса для обеспечения замера времени между двумя событиями:

```js
class Profiler {
    constructor (label) {
        this.label = label;
        this.lastTime = null;
    }

    start () {
        this.lastTime = process.hrtime();
    }

    end () {
        const diff = process.hrtime(this.lastTime);
        console.log(`Timer ${this.label} took ${diff[0]} seconds and ${diff[1]} nanoseconds.`);
    }
}
```

## Изменяемые типы параметров

JavaScript допускает использовать разные типы данных в качестве параметров функций. Это возможно благодаря отсутствию строгой типизации и использованию ключевого слово **typeof**. Пример использования:

```js
readFile (filename, options, callback) {
    if (typeof options === 'function') {
        callback = options
        options = {}
    }
    else if (typeof options === 'string') {
        options = { encoding: options }
    }

    // Здесь каким-то образом обрабатываем полученные значения
}
```

## Установка переменных окружения из командной строки

Установить переменные окружения можно так:

```shell
NODE_ENV=production node index.js
```

## Быстрая база данных "ключ-значение" в Node.js и браузеров

[LevelUp](https://www.npmjs.com/package/levelup) это wrapper над Google's LevelDB, хранилищем, первоначально разработанном для реализации IndexedDB в браузере Chrome. LevelDB называют "Node.js баз данных" за его минимализм и расширяемость. Rod Vagg - активный участник сообщества разработчиков Node.js, разработал wrapper для LevelDB, который может быть использован также в backend, и который поддерживает in-memory stores, а также другие базы данных: Riak, Redis, web storage engines (indexedDB и localStorage), позволяя использовать один и тот же код для работы с базой данных как в браузере, так и на сервере. Поверх LevelUp разработан ещё целый ряд интересных инструментов, таких как [PouchDB](https://www.npmjs.com/package/pouchdb) и [LevelGraph](https://www.npmjs.com/package/levelgraph).

Больше узнать о LevelUp можно по [ссылке](https://github.com/Level/awesome).

Библиотека, которая позволяет сохранять большой объём данных в современных браузерах - [level-js](https://www.npmjs.com/package/level-js).

Наборы различных адаптеров, совместимых с LevelUP API - [level-stores](https://github.com/Level/awesome#stores).

[JugglingDB](https://github.com/1602/jugglingdb/tree/master) это ORM, совместимая со множеством баз данных.

## Гарантированная доставка сообщений

Для гарантированной доставки сообщений предлагается использовать библиотеку [ZeroMQ](https://zeromq.org/). Библиотека относится к очень популярным. [Аккаунт на GitHub](https://github.com/zeromq).

## Получить массив без дубликатов

Получить новый массив без дубликатов в JavaScript можно используя следующую конструкцию:

```js
const uniqArray = Array.from(new Set(arrayWithDuplicates));
```

## Immediately Invoked Function Expression (IIFE)

IIFE (Immediately Invoked Function Expression) это функция на JavaScript, которая выполняется сразу же, как только встречается её определение. Примеры:

```js
(function () {
  // …
})();

(() => {
  // …
})();

(async () => {
  // …
})();
```

Основные применения:

### Avoid polluting the global namespace

Переменные firstVariable и secondVariable не попадают в глобальный scope:

```js
(() => {
  // some initiation code
  let firstVariable;
  let secondVariable;
})();
```

### Execute an async function

Выполнение асинхронной функции:

```js
const getFileStream = async (url) => {
  // implementation
};

(async () => {
  const stream = await getFileStream("https://domain.name/path/file.ext");
  for await (const chunk of stream) {
    console.log({ chunk });
  }
})();
```

Дополнительно можно почитать [здесь](https://developer.mozilla.org/en-US/docs/Glossary/IIFE)

## Использование ESC-символов для вывода в консоль

При использовании Node.js можно выводить в консоль специализированные ESC-символы для стилистического оформления текста. Так, например, можно установить bold-шрифт, используя `\u001b[1m]`, а вернуть обычный шрифт можно последовательностью `\u001b[0m]`.

Огромнейшая [статья](https://en.wikipedia.org/wiki/ANSI_escape_code) об истории возникновения ESC-символов и ANSI-стандарте, рекомендуется для ознакомления.

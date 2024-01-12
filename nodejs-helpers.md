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

## Установка переменных окружения из командной строки

Установить переменные окружения можно так:

```shell
NODE_ENV=production node index.js
```

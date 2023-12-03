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

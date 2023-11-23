# Полезные утилиты и трюки

- superagent - утилита, выполняющая http-запрос. См.: https://www.npmjs.com/package/superagent
- mkdirp - небольшая утилита, которая создаёт подкаталоги рекурсивно. См.: https://www.npmjs.com/package/mkdirp

Пример использования **superagent**:

```js
import superagent from 'superagent';
...
superagent.get(url).end((err, res) => ...);
```

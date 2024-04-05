# Использование несколькиз ядер процессора для web-приложения на Node.js

Для проверки производительности сервера можно использовать инструмент [autocannon](https://www.npmjs.com/package/autocannon). Пример использования:

```shell
npx autocannon -c 200 -d 10 http://localhost:8080
```

В приведённом выше примере будет открыто 200 параллельных соединений на 10 секунд.

Обычное, однопоточное приложение может выглядеть следующим образом:

```js
import { createServer } from 'http';

const { pid } = process;
const server = createServer((req, res) => {
    // Имитируем интенсивную нагрузку на CPU
    let i = 1e7; while (i > 0) { i--; };

    concole.log(`Handling request from ${pid}`);
    res.end(`Hello from ${pid}\n`);
});

server.listen(8080, () => console.log(`Started at ${pid}`));
```

Для запуска web-приложения в кластерном режиме, мы может использовать встроенный модуль **cluster**:

```js
import { createServer } from 'http';
import { cpus } from 'os';
import 'cluster from 'cluster';

if (cluster.isMaster) {

    const availableCpus = cpus();
    console.log(`Clustering to ${availableCpus.length} processes`);

    // Запускаем отдельные Node.js-instances по количеству ядер процессора
    availableCpus.forEach(() => cluster.fork());

} else {

    const { pid } = process;
    const server = createServer((req, res) => {
        // Имитируем интенсивную нагрузку на CPU
        let i = 1e7; while (i > 0) { i--; };

        concole.log(`Handling request from ${pid}`);
        res.end(`Hello from ${pid}\n`);
    });

    server.listen(8080, () => console.log(`Started at ${pid}`));
}
```

Под капотом, cluster.fork() используется child_process.fork() API, это позволяет нам использовать коммуникационный канал между master-ом и worker-ами. Например, мастер может отправить всем worker-ам широковещательное сообщение:

```js
Object.values(cluster.workers).forEach(worker => worke5r.send('Hello from the master'));
```

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

    console.log(`Handling request from ${pid}`);
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

        console.log(`Handling request from ${pid}`);
        res.end(`Hello from ${pid}\n`);
    });

    server.listen(8080, () => console.log(`Started at ${pid}`));
}
```

Под капотом, cluster.fork() используется child_process.fork() API, это позволяет нам использовать коммуникационный канал между master-ом и worker-ами. Например, мастер может отправить всем worker-ам широковещательное сообщение:

```js
Object.values(cluster.workers).forEach(worker => worke5r.send('Hello from the master'));
```

Для запуска web-сервера необходимо создать package.json, командой `npm init` и добавить в файл строку:

```json
"type": "module"
```

Загрузить зависимости можно командой `npm install`.

При запуске AutoCannon можно увидеть следующий результат:

developer@developer-HP-ENVY-15-Notebook-PC:~/projects/Node-tests$ npx autocannon -c 200 -d 10 http://localhost:8080
Running 10s test @ http://localhost:8080
200 connections

```console
┌─────────┬────────┬─────────┬─────────┬─────────┬────────────┬───────────┬─────────┐
│ Stat    │ 2.5%   │ 50%     │ 97.5%   │ 99%     │ Avg        │ Stdev     │ Max     │
├─────────┼────────┼─────────┼─────────┼─────────┼────────────┼───────────┼─────────┤
│ Latency │ 258 ms │ 1359 ms │ 1487 ms │ 1629 ms │ 1291.43 ms │ 262.13 ms │ 1720 ms │
└─────────┴────────┴─────────┴─────────┴─────────┴────────────┴───────────┴─────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬─────────┬───────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg     │ Stdev │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼───────┼─────────┤
│ Req/Sec   │ 129     │ 129     │ 147     │ 149     │ 144.4   │ 5.54  │ 129     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼───────┼─────────┤
│ Bytes/Sec │ 17.9 kB │ 17.9 kB │ 20.4 kB │ 20.7 kB │ 20.1 kB │ 771 B │ 17.9 kB │
└───────────┴─────────┴─────────┴─────────┴─────────┴─────────┴───────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 10

2k requests in 10.09s, 201 kB read
```

# Web Workers

Рекомендуется к ознакомлению статья [Web Workers и React: как разгрузить UI и ускорить приложение](https://habr.com/ru/companies/gnivc/articles/932256/) by АО «ГНИВЦ».

При создании worker-а, браузер запускает новый поток и загружает туда отдельный JS-файл. Основной поток и worker не разделяют память. Они обмениваются сообщениями через механизм postMessage / onmessage. Основной поток отправляет worker-у данные, worker их получает, что-то вычисляет и отправляет результат обратно.

Существуют также **Shared Workers**, которые используются разными процессами (закладками) в браузере.

Ограничения Web Workers:

- У worker-а нет доступа к DOM
- Общение с worker-ом только через postMessage
- При передаче данные необходимо сериализовать (обычно - JSON, или строка)

Когда использовать (примеры):

- криптография (вычисление hash-ей)
- тяжёлые вычисления
- парсинг JSON со сложной структурой
- обработка CSV, Excel, и т.д.

Пример кода создания worker-а и отправки ему данных:

```js
const worker = new Worker('./worker.js');
worker.postMessage({ task: 'compute', payload: data });
worker.onmessage = (event) => {
    console.log('Результат воркера:', event.data);
};
```

Пример реализации worker-а (файл "worker.js"):

```js
self.onmessage = (event) => {
  const data = event.data;
  // например, делаем тяжёлую работу
  const result = data.number * 2;

  // возвращаем результат в основной поток
  self.postMessage(result);
};
```

Завершение worker-а в основном потоке:

```js
worker.terminate();
```

Проблема использования Web Workers с React состоит в Bundler-е, который нужно настроить таким образом, чтобы он не упаковывал реализацию Web Workers в один bundle с основным приложением, т.к. тогда не удасться создать Web Worker.

Вспомогательные библиотеки для работы с Web Worker-ами:

- [comlink](https://github.com/GoogleChromeLabs/comlink) скрывает использование postMessage
- [workerize](https://github.com/developit/workerize) помогает с Bundling-ом
- [threads.js](https://threads.js.org/) - скрывает использование класса Worker

# Системы доставки сообщений

В сложных web-приложениях, подсистема доставки сообщений имеет ключевое значение.

Ключевой книгой является "Enterprise Integration Patterns" by Gregor Hohpe и Bobby Woolf.

При выборе системы доставки сообщений для web-приложения, следует принять во внимание следующие элементы:

- Направление взаимодействия: **one-way only**, или обмен **request/reply**
- Цель сообщения, которая также определяет его контекст
- Синхронизация (timing) сообщения, т.е. сообщение отправляется/принимается синхронно (in-context), или асинхронно (out-of-context)
- Доставка сообщения, т.е. доставляется ли оно напрямую, или через брокера

## Message Broker

**Message Broker** - это временное хранилище данных между источником (sender) и получателем (receiver). Использование брокера добавляет "уровнень косвенности" между источником события и его получателем, что может упростить конфигурацию системы. Однако, использование broker-а создаёт и дополнительные проблемы:

- ухудшается латентность сетевого соединения
- добавляется ещё одна точка отказа
- при увеличении нагрузки, может потребоваться масштабирование broker-а

Основные протоколы, используемые при работе Broker-ов:

- [MQTT](https://mqtt.org/) - легковесный протокол обмена данными, спроектированный для machine-to-machine communications
- [AMQP](https://www.amqp.org/) - мощный протокол, open source альтернатива проприетарным middleware
- [STOMP](https://stomp.github.io/) - легковесный, text-based протокол

Все три протокола базируются на TCP/IP.

## WebSockets "из коробки"

Протокол WebSockets достаточно легко использовать в JavaScript-приложениях. Так, например, мы можем с минимальными усилиями создать чат-приложение в браузере. Для этого нам достаточно будет использовать следующий код ("index.js"):

```js
import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
	broadcast(data);
  });
});

function broadcast(msg) {
	for (const client of wss.clients) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(msg);
		}
	}
}
```

В приведённом выше примере сервер создаёт WebSocket и при получении запроса на соединение, подписывается на получение сообщения. Когда сообщение будет получено, оно транслируется всем подписчикам (итерация по wss.clients).

HTML-страница, которая выступает в качестве клиента, может выглядеть следующим образом:

```html
<!DOCTYPE html>
<html>
	<body>
	Messages:
	<div id="messages"></div>
	<form id="msgForm">
		<input type="text" placeholder="Send a message" id="msgBox" />
		<input type="submit" value="Send" />
	</form>
	<script>
		const ws = new WebSocket('ws://127.0.0.1:8080');
		ws.onmessage = function (message) {
			const reader = new FileReader();
			reader.addEventListener("loadend", () => {
				const msgDiv = document.createElement('div');
				const text = String.fromCharCode.apply(null, new Uint8Array(reader.result));
				msgDiv.innerText = text;
				document.getElementById('messages').appendChild(msgDiv);
			});
			reader.readAsArrayBuffer(message.data);
		}
		const form = document.getElementById('msgForm');
		form.addEventListener('submit', (event) => {
			event.preventDefault();
			const message = document.getElementById('msgBox').value;
			ws.send(message);
			document.getElementById('msgBox').value = '';
		});
	</script>
	</body>
</html>
```

Когда пользователь нажмёт кнопку "Submit", сообщение будет отправлено серверу. Если сервер пришлёт какое-либо сообщение, оно будет декодировано из Blob-а, преобразовано в строку и добавлено в область отображения полученных сообщений.

Приведённый выше пример не учитывает различные кодировки символов и, вместо киррилического текста, например, может выводиться "мусор". Кроме этого, данная реализация не восстанавливает соединение с сервером при его потере. Польза библиотеки [Socket.io](https://socket.io/) в том, что она скрывает неудобства базового API WebScoket.

## Redis, как брокер запросов

В апреле 2024 года, официальная страница [Redis](https://redis.io/) блокировала доступ пользователей из России.

В Redis реализована возможность использовать шаблон проектирования Pub/Sub. Приложение, используеющее Redis открывает два канала (один на подписку и один на публикацию):

```js
import Redis from 'ioredis';

const redisSub = new Redis();
const redisPub = new Redis();
```

Публикация сообщений выглядит приблизительно так:

```js
redisPub.publish('chat_messages', msg);
```

В приведённой выше строке, 'chat_messages' - идентификатор подписки, или, другими словами, имя группы для публикации.

Подписка на события выглядит следующим образом:

```js
redisSub.subscribe('chat_messages');
redisSub.on('message', (channel, msg) => {
	// ...
});
```

Одна из причин, по которой имеет смысл использовать Redis, состоит в том, что мы можем использовать одну копию Broker-а совместно с несколькими экземплярами приложений Node.js. Это позволяет достаточно гибко обеспечивать горизонтальное масштабирование системы. Мы можем поднять ещё несколько instances приложения на Node.js, каждое из которых будет подписано сообщения передаваемые через Redis, и каждый из этих instances, в свою очередь, будет рассылать эти сообщение своим WebSocket-клиентам.

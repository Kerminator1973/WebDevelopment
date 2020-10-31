# Express - самый важный package Node.js

Библиотека Express позволяет создавать web-приложения с минимальными затратами времени и усилий. Основными достоинставами Express являются: низкий порог вхождения, огромное количество подключаемых модулей и относительно высокая производительность.

## Создание web-приложения на базе Express

Первый шаг – сгенерировать служебные файлы с описанием приложения Node.js:

```
npm init -y
```

Флаг "-y" означает - отвечать на все вопросы "Yes", т.е. использовать настройки по умолчанию. Интерактивный режим позволяет заполнить информацию о версии, имени проложения,авторства, используемой лицензии, и т.д.

В процесс работы над приложением, в подкаталог проекта будут добавляться зависмости и служебные файлы. Зависимости (папка node_modules) не имеет смысла сохранять в системе контроля версий. При создании backup-а, развертывании системы на другом компьютере, папку "node_modules" и файл "" можно не копировать "package-lock.json". Чтобы восстановить эти файлы, следует использовать команду:

```
npm install
``` 

Для того, чтобы добавить в проект [Express](http://expressjs.com/) достаточно выполнить команду:

```
npm install express --save
```

Рекомендуется размещать исходники в отдельной папке «src». Главный файл с исходниками можно назвать «app.js». Пример содержимого файла:

```javascript
const express = require('express')
const app = express()

app.get('', (req, res) => {
	res.send('Hello express!');
})

app.listen(3000, () => {
	console.log('Server is up on port 3000.');
})
```

В приведённом выше примере осуществляется получение экземпляра класса **express** и создание экземпляра этого класса под именем **app**. Далее к app добавляется обработчик любого HTTP-запроса с глаголом GET, в ответ на который возвращается Http Status Code 200 (OK) и строка текста "Hello express!". Последнее действие - запускается процесс обработчки поступающих запросов с порта 3000. Подключиться к этому серверу можно перейдя в браузере на URL: `http://localhost:3000`

Получить параметры GET-запроса можно используя объект req, являющийся первым параметром callback-функции (req), связанной с обработчиком GET-запроса. Для доступа к параметрам запроса, следует использовать объект **query**. Например:

```javascript
app.get('/getinfo.aspx', (req, res) => {
	
	const deviceid = req.query.deviceid
	const appversion = req.query.appversion
	
	// Параметры deviceid и appversion являются обязательными
	if ( !deviceid || !appversion ) {
		return res.status(400).send('Bad request');
	}
	...
```

В случае, если нам необходимо вернуть HTTP Status Code, следует использовать второй параметр callback-функции (res), связанной с обработчиком GET-запроса. Конкретный код указывается посредством вызова функции status().

## Возврат XML-документа

Express позволяет указать тип возвращаемого content-а, для чего используется вызов res.set(). Например:

```javascript
res.set('Content-Type', 'text/xml')
```

Чтобы динамически сформировать сложно структурированный XML-документ может быть использован специализированный package - [xmlbuilder-js](https://www.npmjs.com/package/xmlbuilder). Ниже приведён пример кода, который формирует такой XML-документ:

```javascript
var builder = require('xmlbuilder');
...
	var root = builder.create('response').att('source', 'RUF1')
		.ele('attribute', {'name': 'D200 - RUS'}).up();
		
	// Добавляем опциональные параметры
	root.ele('options')
		.ele('offlineUpdate').text('0').up()
		.ele('allowScanning').text('0').up()
		.ele('needLog').text('0').up()
	.up();
	
	// Добавляем информацию о бинарных данных
	root.ele('firmware')
		.ele('obj', {'name': 'LOADABLE-FIRMWARE'})
			.ele('version').text('262155').up()
			.ele('type').text('7').up()
			.ele('objsize').text('5').up()
			.ele('elemid').text('76506').up()
		.up()
	.up();
	
	// Завершаем формирование XML-документа
	const xml =	root.end({ pretty: true});
	
	// Возвращаем Http Status Code 200 (OK) и XML-документ с описанием бинарных объектов
	res.set('Content-Type', 'text/xml')	
	res.send(xml);
```

Результатом работы приведённого вышего кода будет следующий XML-документ:

```xml
<?xml version="1.0"?>
<response source="RUF1">
    <attribute name="D200 - RUS"/>
    <options>
        <offlineUpdate>0</offlineUpdate>
        <allowScanning>0</allowScanning>
        <needLog>0</needLog>
    </options>
    <firmware>
        <obj name="LOADABLE-FIRMWARE">
            <version>262155</version>
            <type>7</type>
            <objsize>5</objsize>
            <elemid>76506</elemid>
        </obj>
    </firmware>
</response>
```

## Передача бинарных данных пользователю

Для того чтобы вернуть статический файл, может быть использована функция sendFile():

```javascript
app.get('/getobj.aspx', (req, res) => {
	res.sendFile(__dirname + "/magner_update.zip");
});
```

Передать большой объём бинарных данных данных пользователю

```javascript
res.set('Content-Type', 'image/jpg')
res.send(user.avatar)	// bytes
```

## Получение файла от пользователя

Express по умолчанию не поддерживает files upload. Рекомендуемый Middleware, который поддерживает multipart/form-data называется [Multer](https://www.npmjs.com/package/multer).

Установить библиотеку можно следующим образом: `npm i multer`.

Типовой код, использующий Multer:

```
const multer = require('multer')
const upload = multer({		// Указываем, какие файлы можно получить
	dest: 'images'
})
app.post('/upload', upload.single('upload'), (req, res) => {
	res.send()		// Endpoint для обработки запроса
})
```

Multer подключается как: `upload.single('upload')`.

В рамках курса данные загружаются как через Postman, так и со страницы браузера.

Реалистичный пример использования:

```javascript
router.post('/users/me/avatar', upload.single('avatar'), async (req, res) => {
	req.user.avatar = req.file.buffer
	await req.user.save()
	res.send()
}, (error, req, res, next) => {
	res.status(400).send({ error: error.message })
})
```

Полученные данные хранятся в **req.file.buffer**.

## Загрузка файлов из подкаталога public

При разработке web-приложений, которым нужны вспомогательные файлы, такие как изображения, каскадные таблицы и js-файлы, имеет смысл размещать такие файлы в отдельном подкаталоге "public" и настроить Express таким образом, чтобы приложение возвращало файлы из этого подкаталога без необходимости определения route. Реализовать функционал можно используя стандартный модуль Path, который содержит все необходимые инструменты. Вот такой код позволит нам получить необходимый путь к публичному каталогу:

```javascript
const path = require('path')
console.log(path.join(__dirname, '../public'))
```

Макрос \_\_dirname содержит путь к подкаталогу с исходными текстами и его необходимо скорректировать, чтобы указать путь к «public». 

Далее нам нужно указать Express-у подкаталог со статическими файлами:

```javascript
const publicDirectoryPath =path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))
```

Теперь, если мы перейдём в браузере по ссылке localhost:3000\main.css, то будет загружен файл «main.css».

Обработчики app.get() и app.post() по-прежнему будут работать.

По сути, мы можем смешивать в Express() динамические генерируемые HTML-файлы и статические HTML-файлы, которые для браузера будут выглядеть как находящиеся в одной папке, хотя фактически они будут находится в разных папках («src» и «public»).

## Middleware в Express

**Middleware** - это некоторый код, который выполняется до того, как будет вызвана callback-функция, определённая в router-е. Middleware используются для совершенно разных задач, начиная от валидации JWT, извлечением параметров пользовательской сессии из JWT, продолжая извлечением параметров POST-запроса и заканчивая обработкой файлов, выгружаемых из браузера на сервер.

Проиллюстрировать идею middleware можно следующим образом:

```
Without middleware: new request -> run route handler
With middleware: new request -> do something -> run route handler
```

Когда мы вызываем функцию app.use() в Express, мы добавляем в цепочку обработчиков запросов приблизительно вот такой код:

```
app.use((req, res, next) => {
	if (req.method === 'GET') {
		res.send('GET requests are disabled')
	} else {
		next()
	}
})
```

Этот код может завершить сформировать какой-нибудь ответ и завершить свою работу, либо передать управление следующему обработчику в цепочке. Приведённый выше пример проверяет HTTP-глагол в полученном запросе и если этот глагол GET, то возвращает сообщение о том, что GET-запросы запрещены. Если же запрос другой, то вызов метода next() передаст управление следующей функции в цепочке вызова. Такой метод и называется Middleware. Middleware может быть применён ко всем запросам, либо к конкретному обработчику запроса.

Примерами Middleware, применяемым ко всем запросам являются:

```
app.use((req, res, next) => {
	res.status(503).send('Site is currently down. Check back soon!')
})
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
```

Middleware может быть применён как ко всем запросам, так и к отдельным router-ам. Причём к одному router-у может быть применено несколько Middleware - они просто указываются между папаметрами req и res. Например:

```javascript
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
```

## Проверка сертификатов (SSL/TLS)

Рекомендуется использовать модуль **https**:

```javascript
const https = require("https"),
fs = require("fs");

const options = {
  key: fs.readFileSync("server_dev.key"),
  cert: fs.readFileSync("server_dev.crt"),
  // Следующую строку следует добавить при активации проверки
  // сервером сертификата клиента:
  // ca: fs.readFileSync('client-localhost.pem')
};

let server = https.createServer(options, app).listen(3000, function() {
```

## Разделение обработчиков запросов по разным файлам

Разделение файла с routes на несколько файлов – по отдельному файлу для каждой сущности, кажется здравой идеей.

Кажется разумным создать отдельный подкаталог с именем «routers» и размещать файлы с описанием обработчиков запросов в этом подкаталоге. Реализация файла с отдельными обработчиками может выглядеть так:

```javascript
const express = require('express')
const Task = require('../models/task')
const router = new express.Router()

router.post('/tasks', async (req, res) => {
	const task = new Task(req.body)
	try {
		await task.save()
		res.status(201).send(task)
	} catch (e) {
		res.status(400).send(e)
	}
})

module.exports = router
```

Мы создаём отдельный объект класса Router, используя ссылку на глобальный объект express, который существует только во одной копии и добавляем в него необходимые нам разработчики. Настроенный соответствующий образом router мы возвращаем посредством директивы module.exports.

В главном файле «index.js» мы включаем в таблицу маршрутизации необходимые нам routers, используя вызов app.use():

```javascript
const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)	// Обработка запросов связанных с сущностью «Пользователь»
app.use(taskRouter)	// Обработка запросов связанных с сущностью «Задача»

app.listen(port, () => {
	console.log('Server is up on port ' + port)
})
```

# Express - самый важный package Node.js

Библиотека Express позволяет создавать web-приложения с минимальными затратами времени и усилий. Основными достоинствами Express являются:

- низкий порог вхождения
- огромное количество подключаемых модулей
- относительно высокая производительность

Следует заметить, что наиболее значимыми компонентами, используемыми в работе Express-приложения являются middlewares и генераторы HTML-страниц по шаблонам.

> В конце 2024 года вышла новая версия Express 5, в которую вошли значимые изменения: была добавлена поддержка async/await в Middleware, некоторые методы были переименованы (например, res.sendfile() в res.sendFile()), был переработан Router, bodyParser был удалён из ядра Express, появилась новая функция append(), и т.д. Миграция старых приложений с Express 4 на Express 5 может оказаться не простой задачей.

## Создание web-приложения на базе Express

Первый шаг – сгенерировать служебные файлы с описанием приложения Node.js:

``` shell
npm init -y
```

Флаг "-y" означает - отвечать на все вопросы "Yes", т.е. использовать настройки по умолчанию. Интерактивный режим позволяет заполнить информацию о версии, имени проложения,авторства, используемой лицензии, и т.д.

В процесс работы над приложением, в подкаталог проекта будут добавляться зависмости и служебные файлы. Зависимости (папка node_modules) не имеет смысла сохранять в системе контроля версий. При создании backup-а, развертывании системы на другом компьютере, папку "node_modules" и файл "" можно не копировать "package-lock.json". Чтобы восстановить эти файлы, следует использовать команду:

``` shell
npm install
```

Для того, чтобы добавить в проект [Express](http://expressjs.com/) достаточно выполнить команду:

``` shell
npm install express --save
```

Рекомендуется размещать исходники в отдельной папке «src». Главный файл с исходниками можно назвать «app.js». Пример содержимого файла:

```javascript
const PORT = process.env.PORT || 3000;

import express from 'express'; // Express
const app = express();

app.get('', (req, res) => {
  res.send('Hello express!');
})

app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}.`);
})
```

В приведенном выше примере используется **ECMA Script modules**. Для поддержки ESM необходимо модифицировать файл "package.json":

```json
{
  ...,
  "type": "module"
}
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

## Получение позиционных параметров

Для получения позиционных параметров http-запроса используется особенный шаблон - перед именем параметра в шаблоне URL добавляется знак "двоеточие", а для получения значения параметра в обработчике следует использовать объект req.params. Например:

```javascript
app.get('/users/:id', (req, res) => {
	const _id = req.params.id
```

В приведённом выше примере, в случае, если запрос будет выглядеть как "https://myhost:8080/users/e76t7jyu3002_12", значение параметра **req.params.id** будет соответствовать "e76t7jyu3002_12".

## Middleware в Express

**Middleware** - это некоторый код, который выполняется до того, как будет вызвана callback-функция, определённая в router-е. Middleware используются для совершенно разных задач, начиная от валидации JWT, извлечением параметров пользовательской сессии из JWT, продолжая извлечением параметров POST-запроса и заканчивая обработкой файлов, выгружаемых из браузера на сервер.

Проиллюстрировать идею middleware можно следующим образом:

``` console
Without middleware: new request -> run route handler
With middleware: new request -> do something -> run route handler
```

Когда мы вызываем функцию app.use() в Express, мы добавляем в цепочку обработчиков запросов приблизительно вот такой код:

```javascript
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

```javascript
app.use((req, res, next) => {
	res.status(503).send('Site is currently down. Check back soon!')
})

// Разбирать данные из application/json и помещать их в виде JavaScript-объекта в req?.body
app.use(express.json())

app.use(userRouter)
app.use(taskRouter)
```

Middleware может быть применён как ко всем запросам, так и к отдельным router-ам. Причём к одному router-у может быть применено несколько Middleware - они просто указываются между папаметрами req и res. Например:

```javascript
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
```

### Middleware Body-Parser для получения параметров POST-запроса

При обработке POST-запросов традиционно используется специализированный Middleware-компонент, который транслирует содержимое Body в JavaScript-объект параметра request, передаваемого в callback-метод обработчика Endpoint. Одним из наиболее распространённых компонентов является [body-parser](https://www.npmjs.com/package/body-parser). Установить компонент можно следующей командой:

```shell
npm install body-parser
```

Данный middleware может быть применён для всех видов запроса по следующей схеме:

```javascript
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
...
// Разбирать данные из application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
```

Для обработки запросов, в которых данные передаются как JSON, следует использовать другую опцию:

```javascript
// Разбирать данные из application/json и помещать их в виде JavaScript-объекта в req?.body
app.use(bodyParser.json())
```

Кроме этого, **body-parser** можно применять не ко всем запросам Express, а только к конкретному. Для этого соответствующий middleware указывается между req и res:

```javascript
app.post('/add_new_device', bodyParser.json(), (req, res) => {
	// Здесь можно использовать отдельные поля запроса: req.body.field1, req.body.field2
});
```

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
res.send(user.avatar) // bytes
```

### Клиент может указать имя файла, под которым он хочет загрузить данные

Для этого необходимо указать атрибут `download` у тэга anchor. Например:

```html
<a href="path/to/file.pdf" download="custom-filename.pdf">Download PDF</a>
```

## Получение файла от пользователя

Express по умолчанию не поддерживает _files upload_. Рекомендуемый Middleware, который поддерживает multipart/form-data называется [Multer](https://www.npmjs.com/package/multer).

Установить библиотеку можно командой: `npm i multer`.

Ниже приведёт пример HTML-верстки, в которой используется input с типом "file", через который реализуется загрузка файлов на сервер:

``` html
<form method="post" id="upload-form" enctype="multipart/form-data">
	<div class="input-group mb-3">
		<input type="file" class="form-control" id="inputPublicKey">
		<label class="input-group-text" for="inputPublicKey">Публичный ключ</label>
	</div>
</form>
```

Ключевым атрибутом формы является **enctype**, который позволяет указать формат данных, передаваемых на сервер.

Вызывая функцию multer мы создаём middleware-объект, которые извлекает данные из POST-запроса и помещает их в объекта-запроса (req):

```js
const multer = require('multer')
var upload = multer({ 
	dest: 'uploads/', // "uploads/" - подкаталог в котором сохраняются файлы
	limits: {
	   fileSize: 500000 // Загруждаем не более 500Кб (защита от DoS)
	}
});
app.post('/upload', upload.single('upload'), (req, res) => { // Endpoint для обработки запроса
	res.send() // Возвращаем HTTP Status 200 (OK)
})
```

Загружаемые данных сохраняются в виде файлов со случайными имена в папку, имя которой задаётся параметром **dest**. С целью снизить возможности злоумышленников по загрузке сервера fake-овыми запросами, имеет смысл ограничивать размер передаваемых данных. Для этого используются параметры **limits** и **fileSize**.

### Именование объектов при использовании Multer

В простейшем случае, имя параметра ассоциированного с загружаемыми на сервер данными указывается в атрибуте **name**:

```html
<form><input type="file" id="upload_12" name="upload" /></form>
```

Чтобы начать выгрузку через форму, необходимо добавить кнопку «Submit» в этой форме.

Мы можем отправить POST-запрос на сервер в ручном режиме:

```js
window.onload = function() {
    // Подписываемся на событие выбора файла из списка
    const filePublicKey = document.getElementById("inputPublicKey");
    filePublicKey.addEventListener('change', function (evt) {
        sendFileToServer(filePublicKey, "public");
    });
};

function sendFileToServer(fileInput, itemName)
{
    // Формируем данные для POST-запроса вручную. Из органа управления "file"
    // извлекаем выбранный пользователем файл и и отправляем его на сервер
    var formData = new FormData();
    for (var _file of fileInput.files) {
        formData.append(itemName, _file);
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload" + itemName);
    xhr.send(formData);
}
```

В приведённом выше коде мы указываем, что именем ассоциированным с данными будет "public". Назначение имени позволяет создавать комплексные схемы загрузки данных на сервер.

Предположим, что имя ассоциированне с данными будет называться 'binobj'. В этом случае, мы можем определить endpoint, который будет обрабатывать запрос браузера на загрузку данных на сервер. В этом Endpoint нам следует настроить middleware для извлечения данных, выполнив вызов: `upload.single('binobj')`

Ниже приведён пример настройки Endpoint:

```javascript
app.post('/upload', upload.single('binobj'), function (req, res, next) {
	console.dir(req.file);

	// req.file.fieldname = 'binobj'
	// req.file.originalname = оригинальное имя файла
	// req.file.path = имя файла с частью пути (uploads\[имя файла])
	// req.file.filename = уникальное имя файла (GUID)
	// req.file.encoding = кодировка файла (не приципиально - это как данные передавались)
	// req.file.mimetype = тип файла
	// req.file.size = размер файла
});
```

Данные о файле передаются посредством объекта **req.file** .

В тэге **<input type="file"** следует использовать атрибут **multiple**, если следует разрешить выбор нескольких файлов для выгрузки.

Если мы планируем использовать кнопку выгрузки несколько раз, то после отправки данных на сервер следует сбрасывать её таким образом (используется jQuery):

```javascript
$("# upload_12").closest("form").reset();
```

### Отправка данных из JavaScript-кода

Чтобы запустить процесс выгрузки файла/файлов из JavaScript-кода, следует сначала реализовать код наполнения данных для отправки на сервер:

```javascript
var formData = new FormData();
for (var i = 0; i < item.files.length; i++) {
	// Эквивалент в HTML: <input type="file" name="binobj" />
	formData.append("binobj", item.files[i]);
}
```

Затем можно выполнить AJAX-запрос:

```javascript
$.ajax({
	type: "POST",
	url: "/upload", 
	enctype: 'multipart/form-data',     // Необходимо для корректной работы Multer
	processData: false,
	contentType: false,
	data: formData,
	success: function (response) {                    
	},
	error: function (jqXHR, textStatus, errorThrown) {
	}                        
});
```

### В рамках курса...

В рамках курса данные загружаются как через Postman, так и со страницы браузера.

Пример использования из курса Andrew Mead "The Complete Node.js Developer Course (3rd Edition)":

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

## Переменные окружения

Переменные окружения часто используются для настройки различных параметров работы web-приложения. Например, может быть использована следующая строка для установки порта, к которому подключаются копии браузера, работающие с web-приложением:

```javascript
const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log('The app started at ' + port);
});
```

Работа с окружением – крайне важна, т.к. через переменные окружения мы можем настраивать параметры подключения к базе данных, API-ключи, и т.д.

Довольно часто в режиме разработчика следует иметь возможность использовать содержимое некоторого файла с переменными окружения. Использование такого файла позволяет избежать потребность в настройке окружения на машине разработчика. Также это важно при проведении автоматизированного тестирования кода (Jest, Mocha). Чтобы упростить работу с настройкой переменных окружения, рекомендуется использовать специальный npm module: [env-cmd](https://www.npmjs.com/package/env-cmd).

Установка модуля должна осуществляться только на локальную машину:

```
npm i env-cmd --save-dev
```

Запускать утилиту **env-cmd** следует до запуска приложения. Это можно сделать добавив специальный скрипт в "package.json":

```json
{
	"scripts": {
		"dev": "env-cmd -f ./config/dev.env nodemon src/index.js"
	}
}
```

При выполнении команды `npm run dev` сначала будет запущено приложение env-cmd, которое настроит переменные окружения, взяв их из файла, а затем запустит nodemon с указанием стартового файла приложения.

Доступ к переменным окружения  осуществляется через process.env. Если мы определим в файле «./config/dev.env» переменную **SENDGRID_API_KEY**, то мы сможем обращаться к ней посредством **process.env.SENDGRID_API_KEY**. В файле «./config/dev.env» данные хранятся в текстовом файле в виде пар ключ/значение.

Компонент env-cmd поддерживает разные форматы хранения переменных окружения, включая текстовый формат, JSON, и т.д.

# Дополнительные советы

## Отключите заголовок 'x-powered-by'

Этот заголовок возвращает имя web-сервера, который сгенерировал страницу. Заголовок используется сервисами, собирающими статистику по IT-ландшафту интернет. Если убрать этот заголовок, ответы будут чуть короче, а злоумышленники не получат подсказки о том, какие уязвимости следует проверять в первую очередь.

Отключить можно так:

```javascript
app.disable('x-powered-by');
```

## Включите сжатие контента

Для применения сжатия необходимо установить дополнительный middleware - [compression](http://expressjs.com/en/resources/middleware/compression.html).

Включение в проект: `npm install compression`

Последовательность вызовов в коде должна быть строго выдержана:

```javascript
const compression = require('compression');
const express = require('express');
const app = express();
app.use(compression());
```

По-умолчанию используется алгоритм **gzip**.

Экспериментальные проверки дают оценку в 20-27% ускорения загрузки страниц.

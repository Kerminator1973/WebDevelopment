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

## Возврат статического файла

Для того чтобы вернуть статический файл, может быть использована функция sendFile():

```javascript
app.get('/getobj.aspx', (req, res) => {
	res.sendFile(__dirname + "/magner_update.zip");
});
```

# Что является важным в проекте

Middleware в Express используется для того, чтобы выполнить некоторую типовую обработку запроса используя функцию-helper. Примерами Middleware являются:

1. Преобразование данных https-запроса из текстового формата закодированного в XML/JSON/Urlencoded в JavaScript-объект. Этот тип преобразования часто связывают с модулем **body-parser**
2. Проверка флага аутентификации пользователя и токенов безопасности (JWT). 

Подключение middleware может осуществляться по двум схемам:

1.	Функция импортированная директивой require() указывается в качестве параметра app.use() и добавляется в глобальный список middlewares, который будет применяться ко всем обработчикам запросов в app
2.	Может быть указан в качестве второго параметра в вызове HTTP-глагола (app.get(), app.put()) и тогда функция-middleware применяется только к этому обработчику

Ниже приведён пример для второго варианта:

```javascript
app.post('/receive-xml', 
        xmlparser({trim: false, explicitArray: false}), 
        function(req, res, next) {
                // check req.body  
});
```

Для логирования полученных данных очень удобно использовать JSON.stringify():

```javascript
console.log(JSON.stringify(obj));
```

# Что имеет смысл поменять в проекте

В 2018 году стала активно обсуждаться тема замены [Express](https://expressjs.com/ru/) на [Koa](https://koajs.com/). Оба фреймворка разрабатывает одна и таже команда. Express является проверенной временем технологией, включающей в себя всё, что может потребоваться web-разработчику для backend. Express используется callback, что может быть причиной возникновения *callback hell*. Koa - очень компактный (2К строк), минималистичный, модульный framework, построенный с использованием новых возможностей JavaScript **async/await**. Код с использованием Koa легче читать, он компактнее, его проще сопровождать. В плане производительности, Koa чуть быстрее, но не принципиально. Для *greenfield* проектов более предпочтительным является Koa.

Ещё посмотреть: Blue Phrase (HTML Templating), [Fetch API](https://developer.mozilla.org/ru/docs/Web/API/Fetch_API/Using_Fetch) и Read Write Serve.

Вместо стремительно устаревающего npm имеет смысл рассмотреть [yarn package manager](https://yarnpkg.com/lang/en/) - быстрый, надёжный и безопасный.

# Koa.js

Переход на [Koa.js](https://koajs.com/) и [Koa Route](https://github.com/koajs/route) действительно не выглядит сложным. Установка компонентов:

```console
npm i koa
npm install koa-route
```

Генерация простого проекта осуществляется типовым способом: `npm init`.

Простое приложение с Koa Route:

```javascript
const _ = require('koa-route'); // используется в app.use()
const Koa = require('koa');
const app = new Koa();

// Определяем хранилище данных, которое позволяет имитировать наивно простой REST API
const db = {
  tobi: { name: 'tobi', species: 'ferret' },
  loki: { name: 'loki', species: 'ferret' },
  jane: { name: 'jane', species: 'ferret' }
};

const pets = {
  list: (ctx) => {  // Определяем обработчик для запросов '/pets'
    const names = Object.keys(db);
    ctx.body = 'pets: ' + names.join(', ');
  },

  show: (ctx, name) => { // Определяем обработчик для запросов '/pets/:name'
    const pet = db[name];
    if (!pet) return ctx.throw('cannot find that pet', 404);
    ctx.body = pet.name + ' is a ' + pet.species;
  }
};

app.use(_.get('/pets', pets.list));
app.use(_.get('/pets/:name', pets.show)); // :name - имя переменной, которая будет передана в функцию

app.listen(3000);
console.log('listening on port 3000');
```

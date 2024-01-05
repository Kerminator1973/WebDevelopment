# Использование SQLite в проекте на Node.js

Для создания нового проекта на Node.js создаём подкаталог проекта и вызываем команду:

```shell
npm init
```

Ключевая особенность - по результатам работы утилита создаёт файл package.json с зависимостями проекта.

Создаём файл "index.js" и добавляем в него шаблонный код для запуска Express-сервера:

```js
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
```

Добавляем в проект библиотеку Express: `npm install express`, используя Command Shell (не PowerShell).

Проверка работоспособности осуществляется командой: `node index.js`

## Добавляем SQLite

Добавляем зависимость проекта от [SQLite3](https://www.npmjs.com/package/sqlite3): `npm install sqlite3`

Пример кода, который создаёт базу данных (in-memory) и добавляет в таблицу lorem несколько записей:

```js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE lorem (info TEXT)");

    const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (let i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();

    db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
        console.log(row.id + ": " + row.info);
    });
});

db.close();
```

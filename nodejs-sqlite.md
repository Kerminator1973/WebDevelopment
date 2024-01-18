# Использование SQLite в проекте на Node.js

Для создания нового проекта на Node.js создаём подкаталог проекта и вызываем команду:

```shell
npm init
```

Ключевая особенность - по результатам работы утилита создаёт файл package.json с зависимостями проекта.

Создаём файл "index.js" и добавляем в него шаблонный код для запуска Express-сервера:

```js
import express from 'express'; // Express
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
```

В приведенном выше примере используется **ECMA Script modules**. Для поддержки ESM необходимо модифицировать файл "package.json":

```json
{
	...,
	"type": "module"
}
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

## Использование promisify для работы с таблицами SQLite

Приведённый ниже пример кода интересент использованием библиотеки promisify, а также использованием модификатора `IF NOT EXISTS` в инициализаторе класса, обеспечивающего работу с базой данных:

```js
import { promisify } from 'util';
import { db } from './db.js';

const dbRun = promisify(db.run.bind(db));
const dbAll = promisify(db.all.bind(db));

export class Blog {
  initialize() {
    const initQuery = `CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`

    return dbRun(initQuery);
  }

  createPost (id, title, content, createAt) {
    return dbRun('INSERT INTO posts VALUES (?, ?, ?, ?)',
      id, title, content, createAt);
  }

  getAllPosts () {
    return dbAll('SELECT * FROM posts ORDER BY created_at DESC');
  }
}
```

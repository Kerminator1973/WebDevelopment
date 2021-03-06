# NPM vs. Yarn

Наиболее популярным package manager-ом является [npm](https://www.npmjs.com/), приобретённый корпорацией Microsoft. Его основным конкурентом является [yarn](https://yarnpkg.com/), разработанный специалистами Facebook.

Harsha Vardhan: [npm vs Yarn — Choosing the right package manager](https://medium.com/javascript-in-plain-english/npm-vs-yarn-choosing-the-right-package-manager-a5f04256a93f).

Digital Ocean: [Cheat Sheet: npm vs Yarn Commands](https://www.digitalocean.com/community/tutorials/nodejs-npm-yarn-cheatsheet).

Ключевые различия состоят в параллельной загрузке зависимостей и лучшем управлении версиями зависимостей. **Yarn** поддерживает параллелизм и выполняет операции загрузки в 2-3 раза быстрее, чем **npm**.

При загрузке зависимостей, оба менеджера используют файл "package.json" и, в частности, определяют версию компонента, наиболее подходящего к использованию в приложении Node.js. Версия указывается следующим образом:

```json
{
  "dependencies": {
    "body-parser": "^1.19.0",
    "express": "^4.17.1"
  }
 }
```

Символ ^ для npm означает, что нужно загрузить самую свежую версию, начиная с указанной. Чтобы избежать загрузки самой свежей версии (что может нарушить работоспособность приложения), необходимо либо убрать символ ^ перед версией, либо сгенерировать lock-файл. Yarn генерирует yarn.lock автоматически.

Что касается информационной безопасности, npm автоматически выполняет код загружаемых пакетов "на лету", что создаёт потенциальные уязвимости. Yarn.lock загружает только те файлы, которые указаны в "yarn.lock", либо "package.json".

Файл "package-lock.json" — это моментальный снимок всего дерева зависимостей, включающий все пакеты и их установленные версии. Этот файл содержит ЭЦП загруженных библиотек (алгоритм - SHA-512).

Jiří Pospíšil: [Understanding lock files in NPM 5](https://jpospisil.com/2017/06/02/understanding-lock-files-in-npm-5.html).

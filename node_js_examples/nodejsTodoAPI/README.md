# Учебный курс "Udemy – The Advanced Web Developer Bootcamp by Colt Steele". Приложение "todosAPI"

Приложение разрабатывается в рамках учебного курса по JavaScript/React "The Advanced Web Developer Bootcamp". Цель приложения - выполнить задачи курса в полном объёме, развить навыки сопровождения NodeJS проектов.

Дистрибутив [Node.js](https://nodejs.org/en/).

Создать новый проект можно командой: `npm init`.

В проекте используется Express: `npm install --save express`.

В качестве базы данных используется [MongoDB](https://www.mongodb.com/). Установка агента MongoDB: `npm install --save mongoose`

Для извлечения входных параметров из тела (body) POST-запросов используется компонент [body-parser](https://www.npmjs.com/package/body-parser): `npm install --save body-parser`.

## Скрипт установки MongoDB на Linux

Скрипт взят из курса Colt Steele:

```bash
sudo apt-get install -y mongodb-org
mkdir data
npm install mongoose --save
echo 'mongod --bind_ip=$IP --dbpath=data --nojournal --rest "$@"' > mongod
chmod a+x mongod
./mongod
```

## Development server - запуск в режиме разработчика

После загрузке файлов проекта необходимо загрузить packages командой: `npm install`.

Обязательно условие работы приложения - запуск базы данных MongoDB. На локальном Windows-компьютере запуск осуществляется командой: `mongod --dbpath="d:\Mongo.db"`

Запуск проекта в режиме разработчика осуществляется командой `npm index.js`. Далее следует перейти по адресу `http://localhost:3000/`. Запущенное приложение будет автоматически перезапускаться при внесении изменений в проект.

## Наиболее часто используемые команды Git

Сохранить изменения файла: `git add [имя файла]`.

Состояние файлов в системе версионного контроля на локальной машине: `git status`.

Выполнить commit: `git commit -m [комментарий]`.

Сохранить изменения на удалённой машине: `git push origin master`.

Все эти операции можно делать непосредственно из [Visual Studio Code](https://code.visualstudio.com/).

// Файл реализует подключение к базе данных MongoDB и создание
// соответствующих моделей.
//
// Запуск базы данных на моём компьютере: 
//      mongod --dbpath="d:\Mongo.db"
//
// Мы определяем в подкаталоге файл "index.js" для того, чтобы можно было
// подключать через require() весь подкаталог, например:
//      var db = require("../models");

var mongoose = require('mongoose');
mongoose.set('debug', true);

// Используем новый string parser
mongoose.connect('mongodb://localhost/todo-api', { useNewUrlParser: true });

// Активируем режим работы API MongoDB, как совместимый с Promises
mongoose.Promise = Promise;

module.exports.Todo = require("./todo");

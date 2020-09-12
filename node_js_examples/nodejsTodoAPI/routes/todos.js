// Файл содержит реализацию routes

var express = require("express");
var router = express.Router();
var helpers = require("../helpers/todos");

// Отправлять запросы можно из Postman: http://localhost:3000/api/todos
// Параметр "name" должен быть указан в body. В лекции используется
// "x-www-form-urlencoded"

router.route('/')
	.get(helpers.getTodos)
	.post(helpers.createTodo)

// Далее, в обработчиках используется указание позиционного
// параметра - '/:todoId'. Express выделит позицию из URL
// и поместит фактическое значение в req.params.todoId
router.route('/:todoId')
	.get(helpers.getTodo)
	.put(helpers.updateTodo)
	.delete(helpers.deleteTodo);

module.exports = router;

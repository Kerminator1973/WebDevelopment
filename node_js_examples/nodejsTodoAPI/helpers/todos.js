var db = require('../models');

exports.getTodos = function(req, res) {
	db.Todo.find()
	.then(function(todos) {
		res.json(todos);
	})
	.catch(function(err) {
		res.send(err);
	});
}

exports.createTodo = function(req, res) {
	db.Todo.create(req.body)
	.then(function(newTodo) {

		// Возвращаем запись, добавленную в документ базы данных.
		// Код возврата устанавливаем в 201 (Created)
		res.status(201).json(newTodo);
	})
	.catch(function(err) {
		res.send(err);
	});
}

exports.getTodo = function(req, res) {
	db.Todo.findById(req.params.todoId)
	.then(function(foundTodo){
		res.json(foundTodo);
	})
	.catch(function(err) {
		res.send(err);
	});
}

exports.updateTodo = function(req, res) {
	// Особенность MongoDB - данные обновляются,
	// но "по умолчанию" mongo возвращает предыдущий вариант,
	// который был до обновления. Чтобы получить обновлённый
	// вариант, следует указать дополнительную опцию - {new: true}

	db.Todo.findOneAndUpdate({_id: req.params.todoId}, req.body, {
		new: true,
		useFindAndModify: false	// Указываем, чтобы избежать DeprecationWarning
	})
	.then(function(todo){
		res.json(todo);
	})
	.catch(function(err) {
		res.send(err);
	});
}

exports.deleteTodo = function(req, res) {
	db.Todo.remove({_id: req.params.todoId})
	.then(function(foundTodo){
		res.json({message: 'We deleted it!'});
	})
	.catch(function(err) {
		res.send(err);
	});
}

module.exports = exports;

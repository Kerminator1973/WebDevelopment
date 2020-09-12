var express = require("express");
var app = express();

var mongoose = require("mongoose");
var seedDB = require("./seeds/seeds");

// Подключаем механизм разбора параметров запроса, закодированный
// в body. Задача 'body-parser' состоит в том, что привести документ
// из кодировки, указанной в MIME-заголовке, во внутреннюю кодировку
// VM, а затем транслировать контент body в объект JavaScript
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// Подключаем package, который умеет удалять опасные тэги из текста
var expressSanitizer = require("express-sanitizer");
app.use(expressSanitizer ());	// Использовать use нужно строго после bodyParser

// Указываем, что статические файлы находятся в папке "public"
app.use(express.static("public"));

// Подключаем движок генерации HTML по шаблону
app.set("view engine", "ejs")

// method-override используется для подмены POST-запроса на
// PUT-запрос, который соответствует операции UPDATE в
// RESTful Routes.
// Поскольку стандартные формы FORM в браузерах поддерживают
// только два метода запросов (POST/GET), то все остальные приходится
// имитировать через POST и дополнительное поле "_method" в URL.
// Соответственно, methodOverride проверяет наличие поля "_method"
// и, если находит его, подменяет метод запроса на указанный в поле.
// Благодаря этому packagem возможно использовать Routes типе: app.put().
var methodOverride = require("method-override");
app.use(methodOverride("_method"));

// Осуществляем подключение к базе данных
mongoose.connect("mongodb://localhost/blog_demo")
	.then(() => { // if all is ok we will be here

		// TO DO: Реализовать полноценный chain для
		// последовательного выполнения асинхронный действий
		// на стадии инициализации
    })
    .catch(err => { // we will not be here...
        console.error('App starting error:', err.stack);
        process.exit(1);
    });

// Загружаем модуль со схемой коллекции "Posts"
var Post = require("./models/post");

// Формируем отладочную базу данных
seedDB();

// CRUD - ROOT
app.get("/", function(req, res) {
	res.redirect("/index");
});

// CRUD - INDEX
app.get("/index", function(req, res) {

	var posts = Post.find({}, function(err, posts) {
		if(err) {
			// TO DO: Нужно честно отрабатывать альтернативные потоки
			res.Send("<h1>Error</h1>");
		} else {
		    res.render("home", {posts: posts});
		}
	});
});

// CRUD - NEW
app.get("/posts/new", function(req, res) {
    res.render("new");
});

// CRUD - CREATE
app.post("/posts", function(req, res) {

	// Удаляем опасные тэги из строки ввода комментариев
	req.body.content = req.sanitize(req.body.content);

	// Объект req.body содержит словарь параметров POST-запроса
	Post.create(req.body, function(err, newPost) {
		if(err) {

		    res.send(newPost);

		} else {

			res.redirect("/index");
		}
	});
});

// CRUD - EDIT
app.get("/posts/:id/edit", function(req, res) {

	// Для того, чтобы получить изменяемое поле REST-запроса,
	// следует использовать контейнер req.params. Словарь
	// содержит пары: "имя параметра" -> "значение"
	Post.findById(req.params.id, function(err, post) {
		if(err) {
			res.send(err);
		} else {
		    res.render("edit", {post: post});
		}
	});
});

// CRUD - UPDATE
app.put("/posts/:id", function(req, res) {

	// Удаляем опасные тэги из строки ввода комментариев
	req.body.content = req.sanitize(req.body.content);

	// Изменённые значения полей формы, находятся в контейнере req.body
	Post.findByIdAndUpdate(req.params.id, req.body, function(err, updatedPost) {
		if(err) {
			res.send(err);
		} else {
		    res.redirect("/index");
		}
    });
});

// CRUD - DESTROY/DELETE
app.delete("/posts/:id", function(req, res) {

	// Удаление записи из базы данных
	Post.findByIdAndRemove(req.params.id, req.body, function(err, deletedPost) {
		if(err) {
			res.send(err);
		} else {
		    res.redirect("/index");
		}
    });

});

// Запускем web-сервер на порту 3000
app.listen(3000, () => console.log('Example app listening on port 3000!'));
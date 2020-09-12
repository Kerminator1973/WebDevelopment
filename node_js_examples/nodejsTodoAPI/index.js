var express = require("express"),
	app = express(),
	port = process.env.PORT || 3000,
	ip = process.env.IP || "0.0.0.0",
	bodyParser = require('body-parser')

var todoRoutes = require('./routes/todos');

// Подключаем к Express компонент body-parser, который
// позволяет получать параметры HTTP-запросов. Данные будут 
// извлекаться из body, но могут быть представлены как json,
// так и закодированы как urlencoded.
//
// Поскольку body-parser подключен как фильтр Express,
// нам не нужно определять ссылки на этот package в других
// обработчиках routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Указываем, что статические файлы нужно брать их подкаталога '/views',
// а каскадные таблицы из подкаталога '/public'. Мы используем конструкцию
// с __dirname для того, чтобы можно было запускать сайт из любого
// рабочего подкаталога
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/views'))

// Определяем route для корневого подкаталога - http://localhost:3000/
app.get('/', function (req, res) {

	// При запросе корневого элемента, возвращаем
	// статический html-документ
	res.sendFile("index.html");
});

// Определяем route для подкаталога с REST API - http://localhost:3000/api/todos/
app.use('/api/todos', todoRoutes);

// Непосредственно запускаем сервер и выводим адрес подключения
var server = app.listen(port, ip, function() {
	let host = server.address().address;
	let port = server.address().port;
	console.log('The server listening at ' + host + ':' + port);
});

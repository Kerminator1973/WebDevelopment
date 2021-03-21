# Ключевое значение Middleware в Backend-разработке

При обработке https-запросов каждое входное сообщение попадает в pipeline - поток обработки данных. Этот поток проходит через ряд обработчиков, которые называются **middleware**, обрабатываются имя, а затем передаются в систему маршрутизации, которая и доставляет запрос на исполнение в соответствующий **Route**. Route - это программный код обработки запроса в системе перенаправления запросов серверного web-приложения.

Обработчик, связанный с конкретной Endpoint, использует входные параметры запроса для того, чтобы сгенерировать HTML-страницу, JSON, или XML-документ, который передаётся через middlewares в обратном порядке и,в конце, возвращается клиенту.

Middleware выполняют самую разную работу, например:

1. Обеспечивают проверку сертификатов и поддержку SSL/TLS шифрования
2. Работают с cookies для обеспечения сессионности
3. Проверяют JSON Web Tokens
4. Выделяют параметры из body, или строки запроса

Чаще всего используемый Framework/библиотека содержат некоторый базовый набор Middlewares, но может потребоваться разработка собственного middleware, например, для централизованной обработки исключительных ситуаций (Exceptions).

## Middleware в ASP.NET Core 5

Основная работы с Middlewares в приложении ASP.NET Core 5 осуществляется в файле "Startup.cs". В методе Configure() определяется цепочка middlewares. Чаще всего, подключение выглядит как вызов метода, имя которого начинается с Use:

```csharp
public void Configure(IApplicationBuilder app, IWebHostEnvironment env) {
	app.UseMiddleware<ExceptionMiddleware>();
	if (env.IsDevelopment()) {
		app.UseSwagger();
		app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1"));
	}
	app.UseRouting();
	app.UseAuthorization();
	app.UseCors("CorsPolicy");
	app.UseEndpoints(endpoints => {
		endpoints.MapControllers();
	});
}
```

Порядок следования middleware является критически важным.

Определить собственный Middleware можно, например, так:

```csharp
public class ExceptionMiddleware {
	private readonly RequestDelegate _next;
	private readonly ILogger<ExceptionMiddleware> _logger;
	private readonly IHostEnvironment _env;
	public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env) {
		_env = env;
		_logger = logger;
		_next = next;
	}
	
	public async Task InvokeAsync(HttpContext context) {
		try {
			await _next(context);
		} catch (Exception ex) {
			_logger.LogError(ex, ex.Message);
			context.Response.ContentType = "application/json";
			context.Response.StatusCode = (int) HttpStatusCode.InternalServerError;

			var response = _env.IsDevelopment() 
				? new AppException(context.Response.StatusCode, ex.Message, ex.StackTrace?.ToString())
				: new AppException(context.Response.StatusCode, "Server Error");

			var options = new JsonSerializerOptions {PropertyNamingPolicy = JsonNamingPolicy.CamelCase};

			var json = JsonSerializer.Serialize(response, options);
			await context.Response.WriteAsync(json);
		}
	}
}
```

Ключевым является вызов метода через делегата \_next - именно в этом месте осуществляется передача управления следующему middleware.

## Middlewares в Express.js

Для подключение middleware в Expreess.js используется функция use(). Например:

```javascript
const app = express();

app.use(compression());

const flash = require('connect-flash');
app.use(flash());

app.use(express.urlencoded({ extended: false }));
...
app.use(express.static(publicDirectoryPath));
```

Если мы хотим применять некоторый middleware не ко всех https-запросам, а только к конкретному, нам следует указывать этот middleware между параметрами request и response в обработчике запроса к конкретной Endpoint:

```javascript
router.get('/import', isLoggedIn, async (req, res) => {
	res.render('reguids.hbs');
});

// Страница настройки атрибутов исполнения
router.get('/attrs', isLoggedIn, async (req, res) => {
	res.render('attrs.hbs');
});
```

В приведённом выше примере, isLoggedIn - это реализация middleware, которая обеспечивает блокировку доступа к конкретным страницам в том случае, если пользователь не прошёл аутентификацию:

```javascript
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};
```

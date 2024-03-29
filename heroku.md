# Важность Heroku для разработчика

**ВНИМАНИЕ**: статья потеряла актуальность по причине отказа Heroku от предоставления разработчикам бесплатной виртуальной машины (Dyno), см. press release от 25 августа 2022 года.

**UPDATE 2022**: критика Heroku звучит достаточно громко достаточно давно. Основные претензии: сервис неоправданно дорогой, у него плохой SLA и степень контроля со стороны пользователя - низкая. Одна из статей: [Time to Leave Heroku Behind](https://levelup.gitconnected.com/time-to-leave-heroku-behind-5092e69a9353) by Tyler Eon. Тем не менее, статью о Heroku сохранена в репозитарии, как пример облачного сервиса, снимающего с программиста задачи развертывания и администрирования web-прилоржений. Подобные сервисы, несомненно, исключительно полезны для начинающих программистов.

Ключевая особенность облачного сервиса [Heroku](https://www.heroku.com/) состоит в том, что запуск сервиса в работу осуществляется публикацией репозитария проекта на определённый URL, используя протокол git. Это обеспечивает очень низкий порог вхождения для запуска web-приложения в публичный доступ. Фактически, вы создаёте ваше web-приложение локально, а затем выполняете commit в remote repo и Heroku выполняет все необходимые работы по развертыванию приложения (deploy). В варианте от Heroku, развертывание приложения выполняется одной командой: `git push heroku master` из подкаталога с исходными текстами проекта своего персонального компьютера. Не нужно думать ни о безопасности, ни о сертификатах - просто сервис появляется в облаке и становится доступен для других пользователей.

Публиковать можно не только проекты Node.js. Фактически, в Heroku есть система загрузки и использования внешних скриптов развертывания, которые называются Buildpack. В Heroku Dashboard следует указать URL такого Buildpack. Например, для развертывания приложения ASP.NET Core 5 может быть использован [jincod/dotnetcore-buildpack](https://github.com/jincod/dotnetcore-buildpack).

## Что нужно сделать с проектом Node.js для совместимости с Heroku

Heroku использует package.json в качестве инструкции по развертыванию нашего приложения. Чтобы инструкция была полной, необходимо внести некоторые изменения.

Поскольку Heroku запускает скрипт командой `npm run start` нам необходимо добавить команду в раздел "scripts":

```
{
	...
	"scripts": {
		"start": "node src/app.js"
	}
	...
}
```

При запуске сервера Express, необходимо использовать номер порта выделенный нашему приложению сервисом Heroku:

```javascript
const port = process.env.PORT || 3000
...
app.listen(port, () => {
	console.log('The app started at ' + port)
})
```

Кроме этого, все ссылки со статических страниц должны быть локальными. Это относится и к асинхронным запросам:

```javascript
fetch('/weather?address=' + ...
```

## Ограничения Heroku

Бесплатный тарифный план сильно ограничен в части использования баз данных. Бесплатно доступно только 10 тыс. записей/месяц - этого достаточно только для демонстрационных целей, тогда как разработка должна вестись на персональном компьютере. Подключение базы данных осуществляется в Heroku Dashboard в разделе "Resources". Посредством Add-on можно добавить, например, Heroku Postgres. Следует внимательно посмотреть на тарифный план - только часть из них является бесплатными (Hobby Dev - Free).

Приложение в бесплатном плане автоматически останавливается через 30 минут бездействия, а на повторный запуск требуется время (около 10 секунд). Можно использовать режим работы без выключения приложения на 450-550 часов/месяц, но для этого нужно указать кредитную карту.

Ключевое ограничение - объём ОЗУ для приложения - 512 Mb (для тарифных планов Free/Hobby).

Регистрация по почтовому адресу xxx@mail.ru запрещена, но вполне можно регистрироваться по адресу на yandex.ru.

## Командная строка

Управлять настройками приложения в облаке Heroku можно используя командную строку. Для этого необходимо загрузить [Heroku Toolbelt](https://devcenter.heroku.com/articles/heroku-cli).

Создание приложения Heroku:

```
heroku create [имя]
```

Когда выбирается имя приложения – оно должно быть уникальным среди всех приложений Heroku, т.е. рекомендуется использовать имя разработчика/название компании в качестве префикса. Если всё OK, то в консоль нам выводятся адрес нашего сайта и адрес git-репозитария для сохранения кода.

Если нам нужно связать уже существующее Heroku приложение с кодом из текущего локального репозитария, то можно воспользоваться командой:

```
git remote add heroku git@heroku.com:project.git
```

Тоже самое можно сделать посредством Heroku CLI:

```
heroku git:remote -a [имя вашего проекта в облаке Heroku]
```

Чтобы задать переменные окружения следует воспользоваться следующей командой:

```
heroku config:set key=value
```

Посмотреть полный список ключей можно командой:

```
heroku config
```

Удалить переменную окружения можно так:

```
heroku config:unset key
```

Типовые переменные окружения: 

1. секретное слово для JWT
2. адрес подключения к базе данных
3. API-ключи для различных облачных сервисов

Для публикации проекта на сервере Heroku следует выполнить команду:

```
git push heroku master
```

## Procfile (устаревший подход)

В инструкциях по развертыванию приложений в облаке Heroku иногда указывается на необходимость использования файла **Procfile**. В этом файле содержится команда запуска приложения после его развертывания в облаке. Содержимым этого файла может быть: `web: node index.js`. 

В действительности, для проектов Node.js [необходимости в этом файле уже нет](https://devcenter.heroku.com/changelog-items/370), достаточно указать команду запуска приложения в "package.json":

```json
{
	"scripts": {
		"start": "node src/app.js",
		"dev": "nodemon src/app.js -e js,hbs"
	}
}
```

В проект может быть включен файл-компаньён «.env», в котором указывается режим работы приложения. Пример содержимого: `NODE_ENV=production`. Указанное значение можно использовать непосредственно в JavaScript-коде:

```javascript
const isProd = process.env.NODE_ENV === "production";
```

## Интеграция с GitHub

В управляющей консоли Heroku предоставлена возможность выполнять автоматический deployment публичных репозитариев с GitHub. Для этого нужно подключить репозитарий GitHub к пользовательскому аккаунту Heroku. 

Для того, чтобы выполнять deployment автоматически при появлении нового commit-а в репозитарии, следует нажать кнопку "Enable Automatic Deploys". Перед push-ем изменений в репозитарий GitHub следует убедиться, что все тесты выполняются без ошибок.

В случае, если настроена автоматическая публикация изменений из main/master на хостинг Heroku, следует перейти на использование Feature Branch Workflow в проекте и вести разработку нового кода в отдельной ветке Git. Только после завершения работы над функцией следует делать merge в main/master, т.к. это каждый commit в основной репозитарий будет приводить к автоматической публикации приложения на Heroku.

## Опыт публикации приложения ASP.NET Core 5 в облаке Heroku

Создал папку «taganrogcalculator», перешёл в неё и посмотрел список доступных шаблонов приложений .NET: `dotnet new --list`

Документ с подробное описание шаблонов доступен на [сайте Microsoft](https://docs.microsoft.com/ru-ru/dotnet/core/tools/dotnet-new).

Сгенерировал шаблон приложения ASP.NET Core 5 Web API: `dotnet new webapi -f net5.0`

Запустил приложение локально и убедился, что оно работает, используя Postman: `dotnet run`

В Postman использовал GET-запросы:

```
GET http://localhost:5000/WeatherForecast
GET https://localhost:5001/WeatherForecast
```

Создал локальный Git-репозиатрий:

```
git init
git add .
git commit -m "First Commit"
```

Опубликовал код на GitHub:

```
git remote add origin https://github.com/Kerminator1973/TaganrogCalculator.git
git branch -M main
git push -u origin main
```

Далее, на сайте Heroku создал новое приложение с именем «taganrogcalculator», связал аккаунт Heroku со своим аккаунтом и связал репозитарий с приложением на Heroku.

Указал BuildPack: https://github.com/jincod/dotnetcore-buildpack

Выполнил операцию «Manual Deploy» и после того, как приложение было опубликовано, проверил его доступность с разных устройств по ссылке: https://taganrogcalculator.herokuapp.com/WeatherForecast

После проверки удалил приложение с Heroku и репозитарий с GitHub.

## Дополнительные возможности

Heroku предоставляет огромное количество дополнительных Plug-Ins, в том числе, базы данных с бесплатным (ограниченным) тарифным планом.

В разделе «Resource» в Heroku Dashboard следует добавить Add-on: **Heroku Postgres**. Бесплатный тарифный план называется "Hobby Dev - Free". Поскольку приложение будет работать в Heroku, параметры подключения к базе данных нужно будет получать не из «appsettings.json», а из переменных окружения Heroku:

```csharp
services.AddDbContext<DataContext>(opt => {
	var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
	string connStr;
	// Depending on if in development or production, use either Heroku-provided
	// connection string, or development connection string from env var.
	if (env == "Development") {
		// Use connection string from file.
		connStr = config.GetConnectionString("DefaultConnection");
	} else {
		// Use connection string provided at runtime by Heroku.
		var connUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
		// Parse connection URL to connection string for Npgsql
		connUrl = connUrl.Replace("postgres://", string.Empty);
		var pgUserPass = connUrl.Split("@")[0];
		var pgHostPortDb = connUrl.Split("@")[1];
		var pgHostPort = pgHostPortDb.Split("/")[0];
		var pgDb = pgHostPortDb.Split("/")[1];
		var pgUser = pgUserPass.Split(":")[0];
		var pgPass = pgUserPass.Split(":")[1];
		var pgHost = pgHostPort.Split(":")[0];
		var pgPort = pgHostPort.Split(":")[1];
		connStr = $"Server={pgHost};Port={pgPort};
			User Id={pgUser};Password={pgPass};Database={pgDb}; 
			SSL Mode=Require; Trust Server Certificate=true";
	}
	// Whether the connection string came from the local development configuration file
	// or from the environment variable from Heroku, use it to set up your DbContext.
	options.UseNpgsql(connStr);
});
```

## Занятные факты

Heroku использует AWS в качестве базовой платформы. Таким образом Heroku относится к виртуальным хостинг компаниям.

## Похожие сервисы

[Netlify](https://www.netlify.com/pricing/) предлагает бесплатный тарифный план с выделением random имени сайта.

[Deno Delpoy](https://deno.com/deploy/) - hosting для проектов разработанных для Runtime Deno от стартапа разработчиков Deno.

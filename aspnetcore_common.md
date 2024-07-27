# Общие замечания об ASP.NET Core

В данном документе собраны некоторые общие замечания, связанные с ASP.NET Core.

## Memory cache и проход мимо него при загрузке обновлёного js-скрипта

При включении библиотеки в js-файл, можно использовать атрибут `asp-append-version`, который заменяется на hash-код файла, что позволяет не загружать его из cache-браузера, когда появится новая версия скрипта:

```html
<script src="~/js/site.js" asp-append-version="true"></script>
```

Приведённый выше код заменяется на следующий код:

```html
<script src="~/js/site.js?v=Kl_dqr9NVtnMdsM2MUg4qthUnWZm5T1fCEimBPWDNgM"></script>
```

## Запуск ASP.NET Core приложения из командной строки

Ключевым элементом приложения ASP.NET Core является dll-файл, в котором находится исполняемый IL-код приложения. Например, для приложения "ЭСКД ProIDC 3" таким файлом является "CinnaPages.dll".

Для полноценной работы приложения рядом с ним должны находится зависимости (вспомогательные dll-библиотеки), файл настроек "appsettings.json", а также папка "wwwroot", в которой должны находится статические файлы приложения: html, css, js, картинки, и т.д.

Для того, чтобы получить папку, в которой будут находится все необходимые файлы, достаточно выполнить команду "Publish..." из Visual Studio, либо команду `dotnet publish` из командной строки.

Тот факт, что в dll-файле находится на платформозависимый код, а IL-код, позволяет использовать сборку для работы в разных операционных системах. Чтобы приложения заработало, его нужно запустить через команду dotnet:

```shell
dotnet CinnaPages.sll
```

При запуске приложения мы можем указать порт, который следует использовать для приёма входящих запросов. Пример вызова:

```shell
dotnet CinnaPages.dll --urls http://*:3001/
```

В параметре `--urls` мы можем указать несколько URL и портов, разделяя их через точку с запятой.

## Правильное использование Http client через HttpClientFactory

В случае, если web-приложение должно с web-сервера обратиться к какому-то другому серверу, обычно используется HttpClientFactory. Регистрация сервиса при запуске приложения выглядит следующим образом:

```csharp
using System.Net.Http.Headers;  // Используется определение MediaTypeWithQualityHeaderValue
// ...
builder.Services.AddHttpClient(name: "Northwind.WebApi",
    configureClient: options =>
    {
        options.BaseAddress = new Uri("https://localhost:5002/");
        options.DefaultRequestHeaders.Accept.Add(
            new MediaTypeWithQualityHeaderValue("application/json", 1.0)
        );
    });
```

Внедрить сервис в контроллер можно так:

```csharp
private readonly IHttepClientFactory clientFactory;
// ...
public HomeController(ILogger<HomeController> logger, 
    NorthwindContext injectedContext, IHttpClientFactory httpClientFactory)
{
    _logger = logger;
    db = injectedContext;
    clientFactory = httpClientFactory;    
}
```

Соответственно, использование внедренной фабрики Http-клиентов может выглядеть так:

```csharp
HttpClient client = clientFactory.CreateClient(name: "Northwind.WebApi");
HttpRequestMessage request = new(
    method: HttpMethod.Get, requestUri: "/api/customers"
);
HttpResponseMessage response = await client.SendAsync(request);
IEnumerable<Customer>? model = await response.Content.ReadFromJsonAsync<IEnumerable<Customer>>();
```

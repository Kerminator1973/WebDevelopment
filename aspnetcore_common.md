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
dotnet CinnaPages.dll
```

При запуске приложения мы можем указать порт, который следует использовать для приёма входящих запросов. Пример вызова:

```shell
dotnet CinnaPages.dll --urls http://*:3001/
```

В параметре `--urls` мы можем указать несколько URL и портов, разделяя их через точку с запятой.

### Создание приложение в операционной системе Linux

Приложение в операционной системе Linux можно создать используя команду:

```shell
dotnet new webapp
```

Приложение будет создано в текущей папке.

Получить полный список шаблонов приложений можно командой: `dotnet new --list`

Собрать bundle для публикации приложения следует командой: `dotnet publish`

Для запуска приложения необходимо указать сборку с web-приложением, например: `sudo dotnet aspnetapp.dll`

Зная IP-адрес компьютера с запущенным приложением, мы можем подключиться к нему. Для примера: http://192.168.0.120/

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

## Добавление GraphQL в приложение ASP.NET Core

В дополнительных главах (только online, в печатной книге они отсутствуют) "C# 10 and .NET 6. Modern Cross-Platform Development" by Mark J. Price есть раздел, посвящённый использованию GraphQL в приложениях на ASP.NET Core. В Visual Studio отсутствует шаблон приложения, который позволяет генерировать код такого стандартного приложения, однако есть NuGET Packages, которые позволяют добавить соответствующую поддержку:

- GraphQL.Server.Transports.AspNetCore
- GraphQL.Server.Transports.AspNetCore.SystemTextJson
- GraphQL.Server.Ui.Playground (нужен только для фазы Development; лишний в Production)

Клиент приложения использует заголовок mediaType со значением "application/graphql", для того, чтобы отправить запрос на сервер, например:

```graphql
{
    products (categoryId: 8) {
        productId
        productName
        unitsInStock
    }
}
```

## Использование gRPC в приложениях C\#

Статьи, рекомендуется для прочтения:

- [Введение в gRPC: Основы, применение, плюсы и минусы. Часть I](https://habr.com/ru/articles/819821/) by 0xN1ck
- [gRPC](https://habr.com/ru/companies/otus/articles/780720/) by OTUS
- [gRPC — альтернатива REST API от Google](https://habr.com/ru/articles/706114/) by alixplisov
- [RPC на примере gRPC. Когда применять и как работает](https://habr.com/ru/articles/787164/) by Bearatol

Контракт между клиентом и сервером описывается в файле ".proto" и затем, по этому файлу можно сгенерировать программный код на разных языках программирования, в том числе и на C\#.

Основные преимущества использования gRPC состоят в том, что передаются бинарно-сериализованные данные (очень компактно), а в качестве транспорта используется HTTP/2. Браузеры не поддерживают gRPC, но есть решения, которые создают необходимую обёртку, в частности - существует инициатива  **gRPC-Web**.

Недостатки gRPC состоят в том, что:

- бинарный формат не является человеко-читаемым
- всё равно требуется HTTP - сжатию подвергается тело документа, а заголовки и транспорт такой же, как и у JSON, или XML
- необходимо работать с версионностью упакованных данных, чтобы избежать несовместимости в структурах данных

Для того, чтобы работать с файлами ".proto" в Visual Studio Code, потребуется специальная обёртка -  **vscode-proto3**.

В дополнительных главах книги "C# 10 and .NET 6. Modern Cross-Platform Development" by Mark J. Price, так же есть пример приложения ASP.NET Core, в котором демонстрируется обработка запросов gRPC. Для этого используется Package ="Grpc.AspNetCore" (60 млн. загрузок).

Для разработки клиентского приложения (консоль) используется Packages "Google.Protobuf" (500 млн. загрузок), "Grpc.Net.Client" (220 млн. загрузкок) и "Grpc.Tools" (нужен только для Development).

И в клиенте, и в серверном приложении, необходимо включить ".proto" в csproj:

```csproj
<ItemGroup>
 <Protobuf Include="Protos\greet.proto" GrpcServices="Server" />
</ItemGroup>
```

```csproj
<ItemGroup>
 <Protobuf Include="Protos\greet.proto" GrpcServices="Client" />
</ItemGroup>
```

## Выведение типов - Contextual Type

В C\#, как и во многих других языках программирования, реализован механизм выведения типа (_type inference_). Выведение типа требует анализа связанного кода и иногда это может приводить к очень странным подобным эффектам. В частности, я сталкивался с ошибками в коде, из-за которых "текстовые" сообщения выводились с ошибками преобразования текста. Приведу два примера кода:

```csharp
return RedirectToPage("/ChangePassword", new
{
    ErrorMessage = HttpUtility.UrlEncode("Ошибка смены пароля. Возможно, пароль не соответствует критериям сложности")
});
```

```csharp
msgRole += "Удалена роль: " + role + ". ";
```

В обоих случаях компилятор принял решение о том, типы "строк" - это byte[] и эти "строки" не были преобразованы из кодировки cs-файла в UTF-16.

Чтобы минимизировать риск не корректного определения типа "строки" рекомендуется использовать **string interpolation**.

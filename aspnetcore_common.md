# Общие замечания об ASP.NET Core

В данном документе собраны некоторые общие замечания, связанные с ASP.NET Core.

## Запуск C\# кода без проекта

В 2025 году в C\# (.NET 10) появилась возможность запустить код в единственном файле на исполнение. Для этого не нужно генерировать, или разрабатывать csproj-файл. Теперь C\# работает близко к Node.js, в котором можно просто выполнить команду `node start.js`, чтобы запустить приложение.

В Visual Studio Code должны быть установлены plug-ins: C\# и C\# Dev Kit. Они не нужны для запуска приложений в консоли, но нужны для IntelliSence в VSCode.

Допустим, что мы написали некоторый код в файле "app.cs". Команда `dotnet run` не будет работать, т.к. отсутствует файл csproj. Однако если мы введём команду `dotnet run app.cs`, то приложение будет скомпилировано и успешно запустится в системе.

Если нам нужны какие-то NuGet-пакеты, то мы можем указать их в заголовке файла, используя директиву `#:package`. Например:

```csharp
#:package Humanizer@2.*

using Humanizer;
```

По этой директиве, компилятор поймёт, что нужно предварительно загрузить соответствующий NuGet-пакет, если это ещё не было сделано.

Пример запуска web-сайта:

```csharp
#:sdk Microsoft.NET.Sdk.Web

var builder = WebApplication.CreateBuilder();
var app = builde.Build();
app.MapGet("test", () => "Hello world!");
app.Run();
```

По сути, у нас появляется возможность разработать быстрый web-сервер, буквально, в пять строк кода.

Дополнительные параметры сборки также можно настраивать в cs-файле. Например можно установить использование самой свежей, экспериментальной версии C\#:

```shell
#:property LangVersion preview
```

Если мы захотим создать проект из такого файла, то нам будет достаточно выполнить команду:

```shell
dotnet project convert app.cs
```

При выполнении этой команды будет создан полноценный (и правильный) csproj-файл и разработчик может использовать его для тонкой настройки проекта.

Проблема, которую решает Microsoft - снизить кривую обучения для новых разработчиков. На английском языке соответствующий термин звучит как _adoption_.

Возможность запуска CS-файла без создания проектов доступна и в других решениях:

- [cs-script](https://github.com/oleg-shilo/cs-script)
- [dotnet-script](https://github.com/dotnet-script/dotnet-script)
- [Cake](https://cakebuild.net/)

## Использование строк шебанг (shebang - \#!)

В .NET 10 появилась поддержка шебанг строк, которые подсказывают shell, как нужно выполнять исполняемый файл:

```shell
#!/usr/bin/dotnet run
```

Таким образом, мы можем использовать cs-приложения непосредственно в shell-скриптах. Например:

```shell
chmod +x app.cs
./app.cs
```

Не далёк тот момент, когда код на C\# будет использоваться в CI/CD.

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

### Создание приложения в операционной системе Linux

Приложение в операционной системе Linux можно создать используя команду:

```shell
dotnet new webapp
```

Приложение будет создано в текущей папке.

Получить полный список шаблонов приложений можно командой: `dotnet new --list`

Собрать bundle для публикации приложения следует командой: `dotnet publish`

Для запуска приложения необходимо указать сборку с web-приложением, например: `sudo dotnet aspnetapp.dll`

Зная IP-адрес компьютера с запущенным приложением, мы можем подключиться к нему. Для примера: http://192.168.0.120/

## Очистка кэшей NuGet

Удалить кэш NuGet-пакетов, кэш http и временные файлы можно командой:

```shell
dotnet nuget locals all --clear
```

По отдельности:

- `dotnet nuget locals global-packages --clear`
- `dotnet nuget locals http-cahce --clear`
- `dotnet nuget locals temp --clear`

Посмотреть расположение файлов можно командой:

```shell
dotnet nuget locals all --list
```

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

## RenderSection - очень гибкий способ настройки рендеринга

Предположим, что у нас есть приложение с несколькими формами. Большая часть форм выводит контент внутри Bootstrap контейнера, что соодаёт привлекательный диазйн приложения. Но для журнала аудита нам нужно всё пространство экрана, т.к. данных в таблице очень много. Чтобы не создавать новые Layouts, мы можем определить в основном "_Layout.cshtml" несколько разных зон рендеринга, например:

```csharp
@* До этого места определено выпадающее меню *@

<div class="container">
    <main role="main" class="pb-3">
        @RenderBody()
    </main>
</div>
@RenderSection("OutsideContainer", required: false)
```

В большинстве форм не нужен OutsideContainer и они программируются так, как и раньше. Но в журнале аудита основная секция (@RenderBody) будет пустой, но зато будет определена секция OutsideContainer:

```csharp
@{
    ViewData["Title"] = "Журнал аудита";
}

@section OutsideContainer {
    <div>
        @* Верстка на всю ширину экрана *@
    </div>
}
```

Такой подход позволяет создавать сложные по структуре страницы с очень лаконичной версткой.

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

## Зачем нужен интерфейс IDisposable

Многие из объяснений необходимости использования инетрфейса `IDisposable` содержат ссылки на managed и неуправляемый код, а также на сборщик мусора. Всё так, но не совсем.

В действительности, в идеологии .NET есть особенность связанная с удалением объектов.

Как и в C++, в C\# существуют деструкторы, но если в C++ деструктор вызывается всегда при выходе экземпляра из области видимости, то в C\# накручена муть с преобразованием деструктора перегружаемого методом Finalize(), которая приводит к следующим негативным последствиям:

- код, определённый в деструкторе вызовется только тогда, когда Runtime примет решение о необходимости сборки мусора. Т.е. это может произойти сильно позже того, как объект выйдет за пределы области видимости
- при завершении работы приложения сборщик мусора может не вызываться и, следовательно, деструктор вообще не будет вызван

И вот в этой точке мы приходим к пониманию, чем грозит unmanaged-код: если мы должны вызывать какой-то внешний API, который освободит важный ресурс, мы не можем полагаться на деструктор.

Чтобы обойти проблему, разработчики .NET "придумали" интерфейс **IDisposable**, который "костылит" проблему с вызовом деструкторов. Этот интерфейс содержит только один метод - **Dispose**(), в котором следует освобождать захваченный ресурс.

По словам авторов Метанита, Microsoft предлагает использовать вот такой шаблон реализации:

```csharp
public class SomeClass: IDisposable
{
    private bool disposed = false;
 
    // реализация интерфейса IDisposable.
    public void Dispose()
    {
        // освобождаем неуправляемые ресурсы
        Dispose(true);
        // подавляем финализацию
        GC.SuppressFinalize(this);
    }
 
    protected virtual void Dispose(bool disposing)
    {
        if (disposed) return;
        if (disposing)
        {
            // Освобождаем управляемые ресурсы
        }
        // освобождаем неуправляемые объекты
        disposed = true;
    }
 
    // Деструктор
    ~SomeClass()
    {
        Dispose (false);
    }
}
```

Ключевым является вызов `GC.SuppressFinalize(this);`, который блокирует вызов Finalize() для экземпляра класса.

Простой пример использования Dispose() на Метаните выглядит так:

```csharp
Test();
 
void Test()
{
    Person? tom = null;
    try
    {
        tom = new Person("Tom");
    }
    finally
    {
        tom?.Dispose();
    }
}
 
public class Person : IDisposable
{
    public string Name { get;}
    public Person(string name) => Name = name;
 
    public void Dispose()
    {
        Console.WriteLine($"{Name} has been disposed");
    }
}
```

Как я понимаю, чтобы не оборачивать код в try.finally/Dispose(), разработчики C\# придумали конструкцию с ключевым словом **using**, которая делает ровным счётом тоже самое.

Отличная статья на Habr - [Как применять IDisposable и финализаторы: 3 простых правила](https://habr.com/ru/articles/89720/) by _Stephen Cleary_.

## Использование LINQ для разбора массивов символов

Несколько примеров для работы с массивами символов с использованием LINQ:

```csharp
Part_Number = String.Concat(Encoding.ASCII.GetString(data.Take(15).ToArray()).Where(char.IsLetterOrDigit));
```

```csharp
byte[] tmp = data.Take(BillLength).ToArray();
```

```csharp
currState.ServiceBytes = _res.Skip(CommandIndex
        + (currState.poolStateDictonary.Z2 != 0 ? 1 : 0)
        + ((currState.poolStateDictonary.nextByteIsBill || currState.poolStateDictonary.nextByteIsErrorCode) ? 1 : 0)
        ).SkipLast(CommandCrcLength).ToArray();
```

## Трюки, которые необходимо знать

Если мы хотим выполнить код при возникновении исключения, а затем бросить исключение дальше с оригинальным _stack details_, то throw должен вызываться без параметра:

```csharp
void DoSomeUsefulWork()
{
    try
    {
        ICanThrowException();
    }
    catch (Exception ex)
    {
        Log(ex);
        // throw ex;    // <-- ЭТО НЕ ПРАВИЛЬНО
        throw;          // <-- А ВОТ ЭТО ПРАВИЛЬНО!
    }
}

private static void ICanThrowException()
{
    throw new Exception("Bad thing happened");
}
```

### Ошибочное использование асинхронного кода

Для получения результата асинхронных команд не рекомендуется использовать Result, как ниже в коде:

```csharp
// ВНИМАНИЕ! ЭТО НЕ ПРАВИЛЬНЫЙ ПОДХОД
var data = FetchDataAsync().Result;

public async Task<string> FetchDataAsync()
{
    await Task.Delay(100);  // Имитируем операцию ввода/вывода
    return "Data";
}
```

Правильный подход:

```csharp
var data = await FetchDataAsync();
```

### Некорректная обработка исключений асинхронного кода

Ниже приведён код, в котором исключение в основном потоке не поймает исключение асинхронной задачи:

```csharp
// ВНИМАНИЕ! ЭТО НЕ ПРАВИЛЬНЫЙ ПОДХОД
public async void FetchDataAsync()
{
    await Task.Delay(100);
    throw new InvalidOperationException("Failure!");
}

try 
{
    FetchDataAsync();
}
catch (Exception ex)
{
    // СЮДА МЫ НЕ ПОПАДЁМ!
    Console.WriteLine("caught");
}
```

Чтобы поймать исключение, мы должны возвращать Task:

```csharp
public async Task FetchDataAsync()
{
    await Task.Delay(100);
    throw new InvalidOperationException("Failure!");
}

// ...
await FetchDataAsync();
```

### Ошибки при использовании _iterator block_

Допустим, что у нас есть функция, которая осуществляет "ленивую" генерацию значений, используя оператор yield:

```csharp
IEnumerable<int> GetNumbers()
{
    Console.WriteLine("--- Generating numbers ---");
    yield return 1;
    yield return 2;
    yield return 3;
}
```

Предположим, что мы хотим получить все три значения и используем следующий код:

```csharp
// ВНИМАНИЕ! ЭТО НЕ ПРАВИЛЬНЫЙ ПОДХОД
var numbers = GetNumbers();

if (numbers.Any() )
{
    Console.WriteLine("Counting");
    Console.WriteLine($"Count: {numbers.Count()}");
    foreach (var number in numbers)
    {
        Console.WriteLine($"Processing {number}");
    }
}
```

Ужас приведённого выше кода состоит в том, что строка "--- Generating numbers ---" будет выведена не один, а три раза. Два дополнительных раза связаны с вызовами numbers.Any() и numbers.Count(). Эти вызовы будут создавать новые итераторы, что и будет приводить к выводу строки повторно. Это может быть очень существенной проблемой, например, при обработке файлов.

Решение: 

```csharp
var numbers = GetNumbers().ToList();
```

### Повторное использование HttpClient

Если мы будем слишком часто создавать экземпляры HttpClient, то через некоторое время возникнет исключение из-за невозможности установить SSL-соединение. Пример неправильного кода:

```csharp
// ВНИМАНИЕ! ЭТО НЕ ПРАВИЛЬНЫЙ ПОДХОД
async Task MakeRequestBadAsync(string url)
{
    using var client = new HttpClient();
    try
    {
        await client.GetAsync(url);
        Console.WriteLine("Request attepted (unsafe).");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error: {ex.Message}")
    }
}
```

Нам следует создать один экземпляр httpClient-а и использовать его повторно.

В ASP.NET Core рекомендуется использовать **IHttpClientFactory**.

### Ошибки захвата переменных в лямбдах

Предположим, что у нас есть следующий код:

```csharp
List<Action> CreateActions()
{
    var actions = new List<Action>();
    for (int i = 0; i < 3; i++) {
        actions.Add(() => Console.WriteLine($"Value: {i}"));
    }
    return actions;
}

var actions = CreateActions();
foreach (var action in actions) action();
```

Можно было бы предположить, что в приведённом выше примере, будут выведены значения 0, 1 и 2. Но на самом деле, переменная i будет захвачена лямбда-функцией и приложение выведет значения: 3, 3 и 3.

Решение проблемы тривиальное:

```csharp
var myNumber = i;
actions.Add(() => Console.WriteLine($"Value: {myNumber}"));
```

>Замечу, что в подобных ситуациях, синтаксис лямбда-функций в C++, который явным образом требует указать, как следует захватывать внешние переменные, гораздо более разумный и вменяемый.

### Coravel

Библиотека [coravel](https://github.com/jamesmh/coravel) предоставляет удобный и простой в использовании планировщик задач для C\#-кода. Подходит для:

- Task Scheduling
- Queuing
- Caching
- Event Broadcasting

Особенно хорошо инструмент подходит для Mailing-а.

# Разработка web-приложений с использованием Blazor

...

## Создание первого приложения

Инструкция базируется на [статье на сатйе MIcrosoft.NET](https://dotnet.microsoft.com/en-us/learn/aspnet/blazor-tutorial/create).

Для генерации boilerplate-кода можно использовать шаблоны приложений встроенных в Visual Studio. Начать имеет смысл с шаблона "Blazor Web App", который поддерживает server-side rendering и клиентское взаимодействие. Также существует шаблон "Blazor Web Assembly App Empty", которое содержит только клиентское приложение, хостинг которого выполняется средствами ASP.NET Core App.

В форме "Additional Information" следует убрать кнопку "Do not use top-level statements".

В соответствии с шаблоном генерируется Server-Side приложение на ASP.NET Core - файл "Program.cs". В этом файле запускается ряд сервисов, включая web-сервер для статических файлов, AntiForgery и включается mapping Blazor-компонентов.

В папке "Components" будет доступно несколько razor-pages (server-side). В частности, страница App.razor загружает стили (включая bootstrap) и ключевой скрипт управления web-приложением "blazor.web.js":

```js
<body>
    <Routes />
    <script src="_framework/blazor.web.js"></script>
</body>
```

Файл "Routes.razor" содержит тэги для запуска навигационной системы с использованием Blazor (Web Assembly):

```js
<Router AppAssembly="@typeof(Program).Assembly">
    <Found Context="routeData">
        <RouteView RouteData="@routeData" DefaultLayout="@typeof(Layout.MainLayout)" />
        <FocusOnNavigate RouteData="@routeData" Selector="h1" />
    </Found>
</Router>
```

Так же в папке "Components" есть две подпапки: "Layout" и "Pages". Подпапка "Layout" содержит разметку основной формы (MainLayout.razor) и навигационную панель (NavMenu.razor). В подпапке "Pages" находится реализация страниц, по которым можно переходить посредством навигационной системы Blazor.

Типовой пример страницы:

```csharp
@page "/counter"
@rendermode InteractiveServer

<PageTitle>Counter</PageTitle>

<h1>Counter</h1>

<p role="status">Current count: @currentCount</p>

<button class="btn btn-primary" @onclick="IncrementCount">Click me</button>

@code {
    private int currentCount = 0;

    private void IncrementCount()
    {
        currentCount++;
    }
}
```

Можно увидеть, что в файле есть часть, содержащая код (`@code{}`) и часть, содержащая верстку. Макросы @page и @rendermode определяют идентификатор страницы для использования в навигационной системе и режим работы - InteractiveServer.

Следует сразу заметить, что если приложение было сгенерировано с использованием SSL, то современные версии Chrome не дадут запустить его без доверенного сертификата. По сути, работа с приложением будет возможна только в браузере Microsoft Edge.

## Первые впечатления

По структуре проекта, похоже на React с TypeScript. Однако пока не понятно, как реализовывать State Management/хуки, функционал, который является _the most challengable_ в React.

Не очень нравится, что Microsoft пытается сдвигать фокус на Server-Side. Понятно, зачем эту нужно Microsoft (чтобы продавать Azure). Программистам, возможно, это было бы удобно, чтобы не реализовывать AJAX-взаимодействие в SPA: есть верстка выполняется на сервере (частичная верстка), то AJAX оказывается спрятан внутри Blazor (он существует, но не явно). Пока не понятно, какие преимущества даёт Blazor для режима SPA, т.е. без Server-Side Rendering.

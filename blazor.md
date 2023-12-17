# Разработка web-приложений с использованием Blazor

Проблемой традиционных web-приложений является разделение его на три части: структура документа (HTML), представление (CSS) и динамический код. Если пользовательский документ состоит из логических блоков вложенных друг в друга, это может привести к "спагетти-коду", т.е. хаотичном награмождении различных элементов друг на друга. Такую структуру кода крайне тяжело сопровождать.

Решением проблемы является внедрение компонентной модели. В рамках этой модели, каждый логически изолированный блок оформляется как отдельный компонент, у которого есть структура/HTML верстка, динамический код и оформление (CSS). Компонентная модель используется, в частности, в React, Angular, Vue.js и Svelte.

Однако, использование перечисленных выше библиотеки и framework-ов не только решает, но и создаёт множество проблем:

- необходимо умело использовать объектную модель, или хуки
- могут возникать утечки памяти из-за замыканий (closures) и блокировке объектов при подписке
- JavaScript не самый очевидный и не самый быстрый язык программирования
- оптимизация рендеринга это весьма сложный и дорогостоящий процесс

Появление Blazor, потенциально, решает значительную часть проблем:

- зрелый, хорошо спроектированный язык программирования (C#)
- мощный и функциональный Runtime
- .NET Core выполняет приложения с высокой скоростью

Однако, существуют риски, связанные с использованием Blazor:

- из-за использования WebAssembly в качестве связующего слоя между .NET и DOM, реальная скорость работы может быть не очень высокой
- наборы свободно доступных компонентов Blazor могут быть существенно более унылыми, чем, например, наборы компонентов для React
- используемый подход может помещать использованию таких мощных и надёжных библиотек, как [DataTables.NET](https://datatables.net/)

## Создание первого приложения (в действительности - первых приложений)

Инструкция базируется на [статье на сайте Microsoft.NET](https://dotnet.microsoft.com/en-us/learn/aspnet/blazor-tutorial/create).

Для генерации boilerplate-кода можно использовать шаблоны приложений, встроенные в Visual Studio. 

Ключевыми шаблонами являются **Blazor Web App** и **Blazor Web Assembly Standalone App**.

Шаблон **Blazor Web App** реализует парадигму в которой рендеринг страниц осуществляется на сервере. При возникновении каких-либо событий на странице они пересылаются на сервер посредством библиотеки SignalR (WebSockets). При обработке событий, сервер генерирует обновления DOM и передаёт их клиенту. Этот вариант требует широкополосной сети с низкой латентностью и ощутимо нагружает сервер. Тем не менее, этот вариант близок к тардиционным web-приложениям, и при разработке можно использовать доступ к данным (EntityFramework) прямо в разметке. Вся логика для взаимодействия с клиентом находится в файле "blazor.web.js".

Шаблон **Blazor Web Assembly Standalone App** предполагает, что при запросе ресурса будет загружен скрипт "_framework/blazor.webassembly.js", который установит .NET Core (при необходимости), скачает клиентское .NET-приложение и запустит его в песочнице браузера. Слова WebAssembly в названии шаблона означают, что .NET Core приложение взаимодействует с DOM браузера через песочницу WebAssembly. При первом запуске скачивается приблизительно 7-20 Мб на .NET Core и standalone-приложения и все компоненты кэшируются. Основное достоинство подхода состоит именно в использовании .NET Core: приложение работает быстро, есть многопоточность, богатый Runtime. Однако, в этом случае потребуется взаимодействие с web-сервером по https с использованием API. Соответственно, разработка разделяется на две части: клиентскую и серверную. Однако, в данном подходе приложение может работать и без доступа в интернет, т.е. абсолютно автономно. В определённом смысле этот подход похож на Electon.

При генерации кода проекта любого из шаблонов, рекомендуется в форме "Additional Information" убрать кнопку "Do not use top-level statements".

В случае использования Visual Studio Code, сгенерировать проекты по шаблону можно консольными командами:

```shell
dotnet new blazor -o BlazorApp
```

```shell
dotnet new blazorserver -f net6.0
```

Запустить приложение в режиме hot-update можно командой:

```shell
dotnet watch run
```

## Blazor Web App

Стоит заметить, что [Blazor Server не загружает Microsoft.NET](https://learn.microsoft.com/en-us/aspnet/core/blazor/hosting-models?view=aspnetcore-8.0) и может работать с браузерами, не поддерживающими Web Assembly. Однако, в этом варианте значительно повышается латентность системы, т.к. любое изменение на клиенте транслируется на сервер и выполняет (частичный?) рендеринг страницы.

В соответствии с шаблоном генерируется Server-Side приложение на ASP.NET Core - файл "Program.cs". В этом файле запускается ряд сервисов, включая web-сервер для статических файлов, AntiForgery и включается mapping Blazor-компонентов. Это типовой код ASP.NET Core:

```csharp
using BlazorBootstrapApp.Components;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRazorComponents()   // Add services to the container.
    .AddInteractiveServerComponents();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment()) {
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseAntiforgery();

app.MapRazorComponents<App>().AddInteractiveServerRenderMode();

app.Run();
```

В папке "Components" будет доступно несколько razor-pages (server-side). В частности, страница App.razor загружает стили (включая bootstrap) и ключевой скрипт управления web-приложением "blazor.web.js":

```js
<body>
    <Routes />
    <script src="_framework/blazor.web.js"></script>
</body>
```

Если говорить о верстке, то она очень похожа на Razor-синтаксис (Blazor - это Razor в Browser-е):

```html
<tbody>
    @foreach (var forecast in forecasts)
    {
        <tr>
            <td>@forecast.Date.ToShortDateString()</td>
            <td>@forecast.TemperatureC</td>
            <td>@forecast.TemperatureF</td>
            <td>@forecast.Summary</td>
        </tr>
    }
</tbody>
```

Ключевая особенность состоит в том, что в разделе `@code` размещается код на C#, который содержит, в том числе, callback-методы вызываемые framework-ом:

```csharp
@code {
    private WeatherForecast[]? forecasts;

    protected override async Task OnInitializedAsync()
    {
        await Task.Delay(500);  // Simulate asynchronous loading to demonstrate streaming rendering

        var startDate = DateOnly.FromDateTime(DateTime.Now);
        var summaries = new[] { "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching" };
        forecasts = Enumerable.Range(1, 5).Select(index => new WeatherForecast
        {
            Date = startDate.AddDays(index),
            TemperatureC = Random.Shared.Next(-20, 55),
            Summary = summaries[Random.Shared.Next(summaries.Length)]
        }).ToArray();
    }
...
```

Файл "Routes.razor" содержит тэги для запуска навигационной системы с использованием Blazor Web Assembly:

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

В случае использования server-side rendering, при возникновении событий на стороне клиента, они транслируются на сервер посредством библиотеки SignalR (WebSockets). В общем случае, обмен данными быстрый, но в информационных системах с ограничением количества одновременно открытых соединений и высокой латентностью сети, Blazor-приложения могут испытывать серьёзные проблемы.

Следует сразу заметить, что при использовании профиля "https", современные версии Chrome не дадут запустить его без доверенного сертификата. В этом варианте основным браузером для разработки приложения станет Microsoft Edge. Однако, если запустить приложение из под профила "http", то Chrome не будет блокировать работу приложения на localhost. 

## Добавлить ещё одну кнопку и обработчик

Предположим, что нам нужно добавить ещё одну кнопку на форму "Counter" (приведённую выше). Для этого мы оперделяем кнопку в верстке:

```html
<button class="btn btn-primary" @onclick="DecrementCount">Decrement</button>
```

Обработчик нажатия на кнопку будет называться DecrementCount и выглядеть в коде он будет так:

```csharp
@code {
    private void DecrementCount()
    {
        currentCount--;
    }
}
```

## Blazor Web Assembly Standalone App

Если основываться на статье [Введение в Blazor с сайта Метанит](https://metanit.com/sharp/blazor/1.1.php), _web assembly_ используется только для загрузки .NET и необходимых сборок. Как следствие, появляются как уникальные свойства, так и существенные недостатки. Уникальные свойства:

- Загруженное приложение может в дальнейшем работать без подключения к Интернет
- Компилятор .NET создаёт _native code_, обладающий с очень высокой производительностью
- Можно использовать _packages_, разработанные на C#, которых доступно очень много

Недостатки так же очень существенные:

- Если на машине не установлен .NET, то его нужно загрузить при первой загрузке страницы. Фактически, при установке каждого приложения будет загружаться кусочек .NET со своими уникальными зависимостями и приложением
- Поскольку на компьютере будет работать .NET, если целевая платформа не совместима с этой технологией, Blazor работать не будет
- Вероятно, какие-то аппаратные платформы не совместимы с .NET. Допускаю, что могут быть проблему на компьютерах с процессорными архитектурами Эльбрус (VLIW-архитектура), Loongson (на базе архитектуры MIPS)

Ориентировочно, базовый [размер загрузки приложения .NET - 6.72 Мб](https://www.reddit.com/r/Blazor/comments/kx8a17/whats_the_size_of_mb_downloaded_by_the_browser/). Такой размер достигается благодаря использованию trimmer-а - приложения, которое исключает из состава приложения не нужные ему зависимости. Т.е. чем больше у приложения зависимостей, тем больший объём данных оно будет скачивать с сервера. Следует заметить, что trimmer [не всегда может срабатывать корректно](https://learn.microsoft.com/en-us/aspnet/core/blazor/host-and-deploy/configure-trimmer?view=aspnetcore-6.0) - он не учитывает случаев использования Reflection и динамические типы. В этом случае, необходимо давать подсказки триммеру, как в сборке, так и в самом проекте. Рекомендуется ознакомиться с видео [Introducing Blazor: Razor Components | ASP.NET Core 101 - 10 of 13](https://www.youtube.com/watch?v=R23v4lgHYQI&ab_channel=dotnet).

В случае запуска приложения в браузере Microsoft Edge, в Developer Console будет выведена приблизительно следующая информация:

```output
assetsCache.ts:30 
dotnet Loaded 22.51 MB resourcesThis application was built with linking (tree shaking) disabled. Published applications will be significantly smaller if you install wasm-tools workload. See also https://aka.ms/dotnet-wasm-features
```

[По ссылке](https://aka.ms/dotnet-wasm-features) можно почитать ознакомиться с документом, описывающим способы уменьшить размер package для загрузки в браузер.

Замеры трафика приложений из коллекции [Grid.Blazor](https://github.com/gustavnavar/Grid.Blazor) позволяют утверждать, что для реального приложения объём - 20 Мб.

Важным следствием применения триммера является тот факт, что каждое приложение загружает необходимые ему packages и runtime.

Также рекомендуется ознакомиться с обсуждением на [Blazor wasm size and load time is the worst and biggest problem ever and should be the #1 priority](https://github.com/dotnet/aspnetcore/issues/41909).

Вот как выглядить Program.cs в шаблоне **Blazor Web Assembly Standalone App**:

```csharp
using BlazorAppStandalone;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

await builder.Build().RunAsync();
```

Формируется структура документа (на барузере), осуществляется внедрение зависимости (HttpClient), а затем WebAssemblyHostBuilder собирает сборку и запускает её.

Внедрение зависимостей имеет ключевое значение - благодаря этому подходу мы можем обращаться к web-серверу с любой страницы вот так:

```csharp
@page "/weather"
@inject HttpClient Http

<PageTitle>Weather</PageTitle>
...
@code {
    private WeatherForecast[]? forecasts;

    protected override async Task OnInitializedAsync()
    {
        forecasts = await Http.GetFromJsonAsync<WeatherForecast[]>("sample-data/weather.json");
    }
...
```

Файл "MainLayout.razor" содержит основную разметку страницы, в которой определена навигационная панель (NavMenu) и блок с пользовательским контентом (@Body). [Свойство @Body](https://learn.microsoft.com/ru-ru/aspnet/core/blazor/components/layouts?view=aspnetcore-8.0) определяемое в базовом классе [LayoutComponentBase](https://learn.microsoft.com/ru-ru/dotnet/api/microsoft.aspnetcore.components.layoutcomponentbase?view=aspnetcore-8.0) возвращает содержимое, отображаемое внутри макета. Допускаю, что реализация компонента NavLink связывает @Body с конкретным активным документом (в базовом приложении: Counter.razor, Home.Razor и Weather.Razor). Навигационный блок выглядит следующим образом:

```csharp
<div class="@NavMenuCssClass nav-scrollable" @onclick="ToggleNavMenu">
    <nav class="flex-column">
        <div class="nav-item px-3">
            <NavLink class="nav-link" href="" Match="NavLinkMatch.All">
                <span class="bi bi-house-door-fill-nav-menu" aria-hidden="true"></span> Home
            </NavLink>
        </div>
        <div class="nav-item px-3">
            <NavLink class="nav-link" href="counter">
                <span class="bi bi-plus-square-fill-nav-menu" aria-hidden="true"></span> Counter
            </NavLink>
        </div>
        <div class="nav-item px-3">
            <NavLink class="nav-link" href="weather">
                <span class="bi bi-list-nested-nav-menu" aria-hidden="true"></span> Weather
            </NavLink>
        </div>
    </nav>
</div>
```

## Ключевые особенности языка описания страниц

Файлы с расширение "razor" определяют компоненты. В начале .razor-файла находится директива @page, определяющая маршрут компонента. Обычно, компоненты размещаются в папке /Components/\[папка\].

Если мы хотим добавить у компонента публичное свойство, то мы должны использовать атрибут [Parameter] в секции `@code`:

```csharp
@code {
    [Parameter]
    public string? UserName { get; set; }
```

Чтобы привязать значение элемента управления HTML к переменной C#, следует использовать `@bind()`:

```html
@page "/bind"

<p>
    <input @bind="inputValue" />
</p>
<ul>
    <li><code>inputValue</code>: @inputValue</li>
</ul>

@code {
    private string? inputValue;
}
```

NavLink - это особенный компонент Blazor, который базируется на NavigationManager и анализирует ссылку перехода. Если ссылка соответствует правилам оформления внутреннего перехода, то выполняется не загрузка по внешней ссылке, а локальный переход по локальному маршруту.

Рекомендуется ознакомиться с микро-курсами по Blazor на сайте [Microsoft Learn](https://learn.microsoft.com/).

## Встраивание Bootstrap в Blazor-приложение (Standalone)

В сгенерированном по шаблону приложению, в папке /wwwroot/css/bootstrap находится файл "bootstrap.min.css", версии v5.1.0. Там же находится map-файл. Однако, в папке отсутстует js-файл, что не позволяет использовать динамическое поведение Twitter Bootstrap. 

Рекомендуется скачать актуальную и полную версию Boostrap с официального [сайта](https://getbootstrap.com/). Файл "bootstrap.bundle.min.js" вместе с соответствующим map-файлом кажется разумным добавить в папку /wwwroot/js/bootstrap. Загрузку js-файла можно добавить в конец "index.html":

```html
<script src="_framework/blazor.webassembly.js"></script>
<script src="js/bootstrap/bootstrap.bundle.min.js"></script>
```

Для того, чтобы JavaScript "подхватился", может потребоваться выполнить команду Refresh в браузере.

### Замена NavBar с левой стороны на NavBar в верхней части экрана

В сгенерированном шаблоне приложения используется разметка с NavBar находящимся в левой части экрана. Чтобы заменить внешний вид на более привычную навигационную панель, находящуюся в верхней части экрана, потребуется модифицировать два файла: "MainLayout.razor" и "NavMenu.razor".

Основная разметка в "MainLayout.razor" может выглядеть следующим образом:

```html
@inherits LayoutComponentBase

<NavMenu />

<main class="container">
    @Body
</main>
```

Навигационная панель может быть такой:

```html
<nav class="navbar navbar-expand-md navbar-dark bg-dark mb-4">
    <div class="container-fluid">
        <a class="navbar-brand" href="">BlazingTopMenu</a>
        <button class="navbar-toggler @NavButtonCssClass" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse"
                aria-controls="navbarCollapse" aria-label="Toggle navigation" @onclick="ToggleNavMenu">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse @NavBarCssClass" id="navbarCollapse" @onclick="ToggleNavMenu">
            <ul class="navbar-nav me-auto mb-2 mb-md-0">
                <li class="nav-item">
                    <NavLink class="nav-link" href="" Match="NavLinkMatch.All">
                        <span class="oi oi-home" aria-hidden="true"></span> Home
                    </NavLink>
                </li>
                <li class="nav-item">
                    <NavLink class="nav-link" href="counter">
                        <span class="oi oi-plus" aria-hidden="true"></span> Counter
                    </NavLink>
                </li>
                <li class="nav-item">
                    <NavLink class="nav-link" href="fetchdata">
                        <span class="oi oi-list-rich" aria-hidden="true"></span> Fetch data
                    </NavLink>
                </li>
            </ul>
        </div>
    </div>
</nav>

@code {
    private bool collapseNavMenu = true;
    private string? NavBarCssClass => collapseNavMenu ? null : "show";
    private string? NavButtonCssClass => collapseNavMenu ? "collapsed" : null;

    private void ToggleNavMenu()
    {
        collapseNavMenu = !collapseNavMenu;
    }
}
```

Однако, после компиляции примера возникает побочный эффект - первый пункт меню оказывается значительно ниже, чем следующие пункты меню. Если мы разместим пункт "Counter" перед "Home", то "глюк" применится уже к "Counter", что означает, что проблема связана не с разметкой "nav-item". Удаление "navbar-brand" и "navbar-toggler" также не влияют на проблему.

Если открыть "Developer Console" по F12 в Microsoft Edge и перейти на закладку "</> Элементы", окно в правой части содержит закладки "Стили", "Вычисляемые" и "Макет". Если перейти в "Макет" и установить галочки в разделе "Перекрытия флексбокс", то можно увидеть, что первый элемент выравнен по нижнему краю, а все последующие - по верхнему.

Экспериментирование со свойствами "li.nav-item" позволило увидеть, что первый элемент меню имеет другой padding - "16px 0px 8px", тогда как остальные элементы имеют padding "8px". Продолжив исследование, удалось найти следующее свойство:

```css
.nav-item:first-of-type[b-5myx3ezuz3] {
    padding-top: 1rem;
}
```

Это свойство определённо в файле "BlazorAppStandalone.styles.css". Этот стиль относится к ScopedCSS и является частью framework-а Blazor. Очень хороший маркер принадлежности стиля компонентам Blazor - "случайный" индекс элемента, в нашем случае - `b-5myx3ezuz3`.

Чтобы решить проблему, следует открыть файл "NavMenu.razor.css" через "Solution Explorer" и найти в каскадной таблице следующее свойство:

```css
.nav-item:first-of-type {
    padding-top: 1rem;
}
```

Соответственно, если мы удалим это свойство, или заменим 1rem на 0rem, а затем перезагрузим страницу, то элементы списка будут выравнены.

Дополнительная информация доступна на [StackOverflow](https://stackoverflow.com/questions/69275392/modifying-menu-spacing-in-blazor).

## Добавление выпадающего меню в меню

Чтобы добавить выпадающее меню в навигационную панель, достаточно встроить в элемент с классом 'navbar-nav' следующий блок:

```html
<li class="nav-item dropdown">
    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
        Dropdown
    </a>
    <ul class="dropdown-menu">
        <li><a class="dropdown-item" href="#">Action</a></li>
        <li><a class="dropdown-item" href="#">Another action</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#">Something else here</a></li>
    </ul>
</li>
```

Чтобы переходить между страницами приложения, мы можем добавить NavLink:

```html
<li>
    <NavLink class="nav-link" href="counter">
        <span class="oi oi-plus" aria-hidden="true"></span> Counter
    </NavLink>
</li>
```

И выпадающее меню, и NavLink будут корректно работать, однако, потребуется внести некоторые изменения в стилическое оформление, чтобы выпадающее меню обладало контрастностью.

## Первые впечатления

По структуре проекта, похоже на React с TypeScript. Пока не понятно, как реализовывать State Management.

Однако, ключевой нюанс состоит в том, React адаптируется под особенности JavScript/TypeScript и это приводит к более сложному коду. В случае Blazor - язык и среда выполнения адаптируются под Framework, что делает код гораздо менее сложным. Примеры:

- выполнение асинхронных запросов в Blazor выглядит просто как синхронный код
- привязка (binding) переменной в коде на C# к HTML-элементу выполняется элементарно

Чтобы просматривать DOM, следует использовать режим "Посмотреть код". Для этого следует нажать кнопку "Select an element in the Page to inspect it", и выбрать конкретный элемент в визуальном представлении. Как только мы выбираем элемент, DOM-представление обновляется и, таким образом, можно вполне успешно анализировать HTML-разметку.

Есть проблема с разработкой Unit-тестов: их очень легко делать для Backend, но весьма сложно для Frontend. Это отличает Blazor от, например, React, для которого легко выполнять Rendering-компонентов и, таким образом, выполнять их Unit-тестирование.


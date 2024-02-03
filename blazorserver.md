# Работа с базой данных в Blazor Server

Ниже идёт конспект лекций [Взаимодействие с данными в веб-приложениях Blazor](https://learn.microsoft.com/ru-ru/training/modules/interact-with-data-blazor-web-apps/).

Следует заметить, что краткий курс лекций сайта learn.microsoft.com ориентирован на объяснение основных механизмов интеграции, но не является готовой инструкцией. По этой причине, в конспект были включены дополнительные рекомендации, отсутствующие в оригинальном курсе.

Есть существеннный нюанс - в Blazor-приложениях доступ к СУБД обучно осуществляется не напрямую, а через REST API (отдельный сервер). Это соответствует принципу разграничения ответственности: Blazor отвечает за взаимодействие с пользователем, а REST API - обеспечивает выполнение бизнес-процессов, связанных с обработкой данных. В случае, если доступ к данным осуществляется через REST API, переход между Blazor Web Assembly и Blazor Server не требует значительной переработки кода. Параллельно снижаются риски возникновения ошибок:

- _Two different processes in the components try to access injected DbContext at the same time. For example a timer is updating information on the page by reading from db periodically_
- _Another process or background task is changing database somewhere in the application_

Проблема совместной работы Blazor и EF разобрана в статье [Проблемы работы с Entity Framework на Blazor Server](https://habr.com/ru/articles/658865/) by Никита Фурса. DbContext не является **Thread-save**.

Дополнительно можно заменить, что REST API очень легко тестировать автоматизированно. Тогда как тестирование пользовательского интерфейса выполнять значительно сложнее.

Используемый шаблон - "Blazor Web App" (шаблон от Microsoft). Сгенерировать приложение можно через Visual Studio, либо через консольную строку:

```shell
dotnet new blazorserver -o BlazingPizzaSite -f net8.0
```

В варианте Blazor Server взаимодействия с СУБД строиться по типовой схеме: подключение EntityFramework, создание сервиса, встраивание сервиса в нужную страницу.

Для того, чтобы можно было выполнять операции с EF через командную строку следует установить пакет `dotnet-ef`:

```shell
dotnet tool install --global dotnet-ef
```

Обновить до актуальной версии:

```shell
dotnet tool update --global dotnet-ef
```

Используя NuGet добавляем зависимости: **Microsoft.EntityFrameworkCore**, **Microsoft.EntityFrameworkCore.Design**, **Microsoft.EntityFrameworkCore.SqlServer**. **Design** нужен для того, чтобы иметь возможность управлять миграциями, а **SqlServer** может быть заменён на адаптер к реально используемой базе данных, например, может быть заменён на **Microsoft.EntityFrameworkCore.SQLite**, или **Npgsql.EntityFrameworkCore.PostgreSQL**.

В папке "Data" мы можем добавить обычные классы данных:

```csharp
namespace BlazingPizza.Data;

public class Pizza
{
    public int PizzaId { get; set; }
    
    public string Name { get; set; }
    
    public string Description { get; set; }
    
    public decimal Price { get; set; }
}
```

## Подключение к СУБД (SQL Server) и создание структуры базы данных (ДОПОЛНИТЕЛЬНЫЕ МАТЕРИАЛЫ)

Для подключения к базе данных необходимо выполнить два важных этапа:

- создать структуру базы данных (миграции)
- добавить сервисы подключения к СУБД через соответствующий адаптер

Для создания миграцией необходимо добавить описание класса, создающего контекст доступа к данным. В курсе лекций такой класс описан, он есть ниже по тексту. На практике было достаточно добавить следующий код:

```csharp
namespace BlazoServerApp.Data
{
    public class BlazoContext : DbContext
    {
        public BlazoContext(DbContextOptions options) : base(options) {}

        public DbSet<Pizza> Pizzas { get; set; }
    }
}
```

Затем, в файле "Program.cs", перед строкой `app.Run();` можно добавить код, который будет добавлять в базу данных отладочные данные SeedData:

```csharp
var scopeFactory = app.Services.GetRequiredService<IServiceScopeFactory>();
using (var scope = scopeFactory.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BlazoContext>();
    if (db.Database.EnsureCreated())
    {
        // SeedData.Initialize(db);
    }
}
```

Пример реализации метод SeedData.Initialize() есть [по ссылке](https://learn.microsoft.com/ru-ru/training/modules/interact-with-data-blazor-web-apps/5-exercise-access-data-from-blazor-components).

Также необходимо определить сервис, который обеспечивает подключение к СУБД:

```csharp
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddSqlServer<BlazoContext>("Data Source=ROCKET\\SQLEXPRESS;Initial Catalog=Blazo;Integrated Security=True;Encrypt=False;Trust Server Certificate=True;");

var app = builder.Build();
```

Вызов **AddSqlServer<>()** можно добавить в цепочку вызовов, но в примере выше, для ясности, вызов осуществлён отдельно от других инициализационных процедур.

Часто, сложным может оказаться подготовка строки подключения к базе данных. В Visual Studio существует специализированный инструмент **Tools -> Connect to Database**, который предоставляет возможность поэкспериментировать с разными вариантами подключения к СУБД. В диалоге создания подключения, есть кнопка **Advanced**, в которой отображается строка для успешного подключения. Добившись успеха с выполнением операции "Test Connecion", можно нажать кнопку "Advanced" и скопировать строку подключения из соответствующего поля. С целью упрощения процесса настройки стенда, можно использовать следующие параметры:

- Integrated Security=True
- Encrypt=False
- Trust Server Certificate=True

Если после добавления кода он успешно собирается, то можно выполнить операцию генерации первой миграции:

```shell
dotnet ef migrations add FirstMigration
```

А затем сформировать структуру базы данных в СУБД:


```shell
dotnet ef database update
```

Если всё пройдёт успешно, вызов **SeedData.Initialize**() заполнит базу тестовыми данными.

## Создание сервиса (курс)

Создаём класс-сервис, в котором определяем асинхронный метод получения данных:

```csharp
namespace BlazingPizza.Data;

public class PizzaService
{
    public Task<Pizza[]> GetPizzasAsync()
    {
        //...
    }
}
```

В рамках курса, реализация сервиса для получения данных предполагает, что используется REST API, размещённый на отдельном сервере (не обязательно физическом). Пример использования такого API:

```csharp
public class UserService
{
    private readonly HttpClient _httpClient;
    private readonly string BaseApiUrl = "https://localhost:44340/api/User";

    public UserService(HttpClient httpClient) => _httpClient = httpClient;

    public async Task<List<User>> GetUsers()
    {
        return await _httpClient.GetFromJsonAsync<List<User>>(BaseApiUrl);
    }
```

Регистрируем сервис для встраивания в "Program.cs":

```csharp
...
// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();
// Register the pizzas service
builder.Services.AddSingleton<PizzaService>();
...
```

Теперь в странице, на которой следует загружать данные из СУБД выполняем _Dependency Injection_:

```csharp
@page "/pizzas"
@using BlazingPizza.Data
@inject PizzaService PizzaSvc

<h1>Choose your pizza</h1>

<p>We have all these delicious recipes:</p>
```

Директива @using импортирует пространство имёт BlazingPizza.Data, в котором определены и сервис PizzaService, и класс Pizza.

Далее, в области кода необходимо переопределить асинхронный метод инициализации страницы, в который следует встроить вызов сервиса загрузки данных из СУБД:

```csharp
private Pizza[] todaysPizzas;

protected override async Task OnInitializedAsync()
{
    todaysPizzas = await PizzaSvc.GetPizzasAsync();
}
```

В рендеринге страницы можно размещать директивы условного отображения, которые позволят отображать страницу без загруженных данных и уже с загруженными данными:

```csharp
@if (todaysPizzas == null)
{
    <p>We're finding out what pizzas are available today...</p>
}
else
{
    <!-- This markup will be rendered once the pizzas are loaded -->
    <table>
    <thead>
    <tr>
    <th>Pizza Name</th>
    <th>Description</th>
    <th>Price</th>
    </tr>
    </thead>
    <tbody>
    @foreach (var pizza in todaysPizzas)
    {
    <tr>
        <td>@pizza.Name</td>
        <td>@pizza.Description</td>
        <td>@pizza.Price</td>
    </tr>
    }
    </tbody>
    </table>    
}
```

К этому моменту у нас выполнены подготовительные этапы, но ещё нет данных.

### Альтернативные варианты внедрения зависимости от DbContext для Blazor Page

Один из рекомендуемых вариантов (У МЕНЯ НЕ ЗАРАБОТАЛ) выглядит следующим образом:

```csharp
public class GameService
{
    private readonly IDbContextFactory<ApplicationDbContext> factory;
    public GameService(IDbContextFactory<ApplicationDbContext> factory)
    {
        this.factory = factory;
    }

    public async Task<Game[]> GetGamesAsync()
    {
        using (var context = factory.CreateDbContext()) {
           return await context.Games.ToArrayAsync();
        }
    }
}
```

Однако, для этого варианта мне не удалось правильно зарегистрировать IDbContextFactory - при регистрации сервиса PizzaService, приложение не могло найти зарегистрированную зависимость по интерфейсу IDbContextFactory.

### Заработавший вариант внедрения зависимости (НАИВНЫЙ)

В официальной статье от Microsoft - [ASP.NET Core Blazor with Entity Framework Core (EF Core)](https://learn.microsoft.com/en-us/aspnet/core/blazor/blazor-ef-core?view=aspnetcore-8.0) описывается максимально простой вариант встраивания DBContext в Blazor Page. В статье явно указывается на демонстрационный характер пример - он не является Thread-Safe и требует соответствующей доработки. Однако он рабочий и может служить хорошей отправной точкой.

В примере отсутствует определение сервиса PizzaService и он не регистрируется как:

```csharp
builder.Services.AddScoped<PizzaService>();
```

Сервис DbContext определён следующим образом:

```csharp
builder.Services.AddDbContextFactory<BlazoContext>(opt =>
    opt.UseSqlServer(
        @"Data Source=ROCKET\SQLEXPRESS;Initial Catalog=Blazo;Integrated Security=True;Encrypt=False;Trust Server Certificate=True;"
    ));
```

Это не мешает выполнять загрузку SeedData в систему, см.: `app.Services.GetRequiredService<IServiceScopeFactory>()`.

Самая интересная часть - внедрение DbContext в компонент:

```csharp
@using Data
@using Microsoft.EntityFrameworkCore
@inject IDbContextFactory<BlazoContext> DbFactory

@if (todaysPizzas != null)
{
    <table>
        <thead>
            <tr>
                <th>Pizza Name</th>
                <th>Description</th>
                <th>Price</th>
            </tr>
        </thead>
        <tbody>
            @foreach (var pizza in todaysPizzas)
            {
                <tr>
                    <td>@pizza.Name</td>
                    <td>@pizza.Description</td>
                    <td>@pizza.Price</td>
                </tr>
            }
        </tbody>
    </table>
}

@code {
    private Pizza[] todaysPizzas;

    protected override async Task OnInitializedAsync()
    {
        using var context = DbFactory.CreateDbContext();
        {
            todaysPizzas = await context.Pizzas.ToArrayAsync();
        }
    }
}
```

## Подключение SQLite

В типовом случае, для подключения SQLite достаточно добавить всего три пакета:

```csharp
dotnet add package Microsoft.EntityFrameworkCore --version 6.0.8
dotnet add package Microsoft.EntityFrameworkCore.Sqlite --version 6.0.8
dotnet add package System.Net.Http.Json --version 6.0.0
```

Далее мы определяем контекст базы данных:

```csharp
using Microsoft.EntityFrameworkCore;

namespace BlazingPizza.Data;

public class PizzaStoreContext : DbContext
{
    public PizzaStoreContext(DbContextOptions options) : base(options)
    {
    }

    public DbSet<PizzaSpecial> Specials { get; set; }
} 
```

Проинициализировать контекст можно в файле "Program.cs", добавив ближе к концу создание сервиса:

```csharp
builder.Services.AddHttpClient();
builder.Services.AddSqlite<PizzaStoreContext>("Data Source=pizza.db");
```

Первая инструкция `AddHttpClient`` позволяет приложению получить доступ к командам HTTP в клиенте. Вторая команда создаёт, или открывает файл с базой данных.

Затем можно создать контроллер, который будет обрабатывать http-запросы, формируя ответ используя EntityFramework:

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlazingPizza.Data;

namespace BlazingPizza.Controllers;

[Route("specials")]
[ApiController]
public class SpecialsController : Controller
{
    private readonly PizzaStoreContext _db;

    public SpecialsController(PizzaStoreContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<PizzaSpecial>>> GetSpecials()
    {
        return (await _db.Specials.ToListAsync()).OrderByDescending(s => s.BasePrice).ToList();
    }
}
```

В примере лекции приводится класс SeedData, который заполняет пустную таблицу некоторыми тестовыми данными.

Инициализация базы данных осуществляется в файле "Program.cs":

```csharp
...
// Initialize the database
var scopeFactory = app.Services.GetRequiredService<IServiceScopeFactory>();
using (var scope = scopeFactory.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PizzaStoreContext>();
    if (db.Database.EnsureCreated())
    {
        SeedData.Initialize(db);
    }
}

app.Run();
```

Если мы хотим отправлять со страницы http-запроса на сервер, то нам следует выполнить внедрение следующих компонентов:

```csharp
@inject HttpClient HttpClient
@inject NavigationManager NavigationManager
```

На сервер, в "Program.cs" следует добавить Mapping-запросов:

```csharp
...
app.MapRazorPages();
app.MapBlazorHub();
app.MapFallbackToPage("/_Host");
app.MapControllerRoute("default", "{controller=Home}/{action=Index}/{id?}");
...
```

Как только мы добавим mapping, можно будет выполнить запрос из браузера и загрузить тестовые данные.

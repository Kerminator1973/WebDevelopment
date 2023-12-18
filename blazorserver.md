# Работа с базой данных в Blazor Server

Ниже идёт конспект лекций [Взаимодействие с данными в веб-приложениях Blazor](https://learn.microsoft.com/ru-ru/training/modules/interact-with-data-blazor-web-apps/).

В случае использования реализации пользовательского интерфейса как Blazor Server добавление взаимодействия с СУБД строиться по типовой схеме: подключение EntityFramework, создание сервиса, встраивание сервиса в нужную страницу.

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

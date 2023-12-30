# Создание компонентов в Blazor

Для ссздания компонента в Blazor достаточно создать некоторую папку (рекомендуется - "Components"; как вариант, его можно разместить в папке "Shared") и создать в папке файл с разрешением ".razor". В этом файле может быть определена как разметка, так и методы с атрибутами. Например:

```csharp
<h2>New Pizza: @PizzaName</h2>
<p>@PizzaDescription</p>

@code {
    [Parameter]
    public string PizzaName { get; set; }

    [Parameter]
    public string PizzaDescription { get; set; } = "The best pizza you've ever tasted.";
}
```

В приведённом выше примере определено два дочерних свойства компонента: PizzaName и PizzaDescription. Эти свойства может устанавливать родительский компонент.

Мы можем задавать значения по умолчанию, это сделано для атрибута PizzaDescription.

Если мы хотим использовать этот компонент, то мы можем указать _a fully qualified name_ компонента и набор атрибутов. Например:

```csharp
<BlazorWasmApp.Components.Pizza PizzaName="123" PizzaDescription="The cool pizza" />
```

Чтобы не указывать полное имя компонента, следует использовать директиву `@using`:

```csharp
@using BlazorWasmApp.Components;
...
<Pizza PizzaName="123" PizzaDescription="The cool pizza" />
```

## Использование класса с атрибутами для передачи параметров компонентов

Также можно определить класс с атрибутами и использовать их в рамках компонентной модели:

```csharp
public class PizzaTopping
{
    public string Name { get; set; }
    public string Ingredients { get; set; }
}
```

Пример использования:

```csharp
<h2>New Topping: @Topping.Name</h2>

<p>Ingredients: @Topping.Ingredients</p>

@code {
    [Parameter]
    public PizzaTopping Topping { get; set; }
}
```

В родительном классе передача параметров может выглядеть следующим образом:

```csharp
@page "/pizzas-toppings"

<h1>Our Latest Pizzas and Topping</h1>

<Pizza PizzaName="Hawaiian" PizzaDescription="The one with pineapple" />

<PizzaTopping Topping="@(new PizzaTopping() { Name = "Chilli Sauce", Ingredients = "Three kinds of chilli." })" />
```

## Каскадные параметры

В Blazor существует возможность передать значение параметра не конкретному дочернему компоненту, а вниз, по всей иерархии от родительского ко всем вложенным дочерним компонентам. Этот механизм называется **Каскадные параметры**.

В родительском компоненте добавляется специальный тэг `CascadingValue`, который указывает, что некоторые параметры следует передать всем дочерним элементам по всех их иерархии. Например:

```csharp
@page "/specialoffers"

<h1>Special Offers</h1>

<CascadingValue Name="DealName" Value="Throwback Thursday">
    <!-- Любой дочерний компонент, не смотря на его уровень вложенности получит этот параметр -->
</CascadingValue>
```

Чтобы компонент получил такой параметр, следует определить специальный атрибут:

```csharp
<h2>Deal: @DealName</h2>

@code {
    [CascadingParameter(Name="DealName")]
    private string DealName { get; set; }
}
```

## Использование AppState

Портал learn.microsoft.com содержит [материалы](https://learn.microsoft.com/ru-ru/training/modules/interact-with-data-blazor-web-apps/6-share-data-in-blazor-applications) по добавлению AppState для Blazor Server.

Общая идея состоит в том, что разрабатывается класс, в котором хранится некоторое состояние, например:

```csharp
public class PizzaSalesState
{
    public int PizzasSoldToday { get; set; }
}
```

Затем, используя механизм **Dependency Injection**, добавляется сервис, который можно затем внедрять в разные страницы:

```csharp
// Add services to the container
builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();

// Add the AppState class
builder.Services.AddScoped<PizzaSalesState>();
```

Внедрение состояния и его использование выглядит следующим образом:

```csharp
@page "/"
@inject PizzaSalesState SalesState

<h1>Welcome to Blazing Pizzas</h1>

<p>Today, we've sold this many pizzas: @SalesState.PizzasSoldToday</p>

<button @onclick="IncrementSales">Buy a Pizza</button>

@code {
    private void IncrementSales()
    {
        SalesState.PizzasSoldToday++;
    }
}
```

## State Management для Blazor Web Assembly

Тоже самое можно сделать и для Blazor Web Assembly, см. [демонстрационное приложение](https://github.com/dotnet/blazor-samples/tree/main/8.0/BlazorSample_WebAssembly).

Справочная информация доступна [по ссылке](https://learn.microsoft.com/en-us/aspnet/core/blazor/fundamentals/dependency-injection?view=aspnetcore-8.0#add-client-side-services).

Регистрация зависимостей выполняется в файле "Program.cs" и может выглядеть следующим образом:

```csharp
builder.Services.AddSingleton<NotifierService>();
builder.Services.AddSingleton<TimerService>();
builder.Services.AddSingleton<IDataAccess, DataAccess>();
builder.Services.AddSingleton<IProductRepository, ProductRepository>();
```

Определение интерфейса может выглядеть, например, так:

```csharp
public interface IUserService
{
    public string? Name { get; set; }
}

public interface ISettingService
{
    public IList<Setting> GetSettings();
}
```

Или так:

```csharp
@code {
    ...
    public interface IDataAccess
    {
        public Task<IReadOnlyList<Actor>> GetAllActorsAsync();
    }

    public class DataAccess : IDataAccess
    {
        public Task<IReadOnlyList<Actor>> GetAllActorsAsync() => 
            Task.FromResult(GetActors());
    }
    ...
}
```

Внедрение зависимости может осуществляться на странице ".razor":

```csharp
@page "/the-sunmakers"
@inject IDataAccess DataRepository
...
@if (actors != null)
{
    <ul>
        @foreach (var actor in actors)
        {
            <li>@actor.FirstName @actor.LastName</li>
        }
    </ul>
}
```

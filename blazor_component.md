# Создание компонентов в Blazor

Для создания компонента в Blazor достаточно разместить в некоторой папке (рекомендуется - "Components"; как вариант, его можно разместить в папке "Shared") файл с разрешением ".razor". В этом файле может быть определена как разметка, так и методы с атрибутами. Например:

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

## Code-behind files

В Razoe можно определить стили и cs-файлы, которые будут видны только внутри конкретного компонента. Предположим, что у нас есть компонент с именем "mycomponent". Мы можем разместить в том же самом подкаталоге, в котором находится razor-файл ещё один файл с именем "mycomponent.styles.css" и стили, определённые в этой файле, будут применены только к этому конкретному компоненту.

Общие для разных компонентов стили определяются в файле "[ИмяПроекта].styles.css".

Также можно создать cs-файл и включить в него некоторую логику. Клитичным является использование `ComponentBase` в качестве базового класса:

```csharp
public class Component1Logic : ComponentBase
{
    // ...   
}
```

Для того, чтобы связать такой cs-файл с razor-файлов потребуется в последнем добавить строку:

```csharp
@inherits Component1Logic
```

## Каскадные параметры

В Blazor существует возможность передать значение параметра не конкретному дочернему компоненту, а вниз, по всей иерархии от родительского ко всем вложенным дочерним компонентам. Этот механизм называется **Каскадные параметры**.

Этот подход рассматривается, как дополнительный механизм передачи через параметры компонента.

В родительском компоненте добавляется специальный тэг `CascadingValue`, который указывает, что некоторые параметры следует передать всем дочерним элементам по всей иерархии. Например:

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

Стоит повторить: **CascadingValue** - это компонент, а **CascadingParameter** - это атрибут!

### Каскадирование с использованием привязки (binding)

Родительский компонент:

```csharp
@using BlazoServerApp.Components.Shared;

<CascadingValue Value="@Style">
    <ChildComponent></ChildComponent>
</CascadingValue>

@code {
    public string Style { get; set; } = "color:green";
}
```

Дочерний элемент (ChildComponent.razor):

```csharp
@using BlazoServerApp.Components.Shared;

<h1 style="@ElementStyle">-Child Component</h1>

<GrandChildComponent></GrandChildComponent>

@code {
    [CascadingParameter]
    public string ElementStyle { get; set; }
}
```

"Внучатый" элемент (GrandChildComponent.razor):

```csharp
<h1 style="@ElementStyle">--Grand Child Component Text</h1>

@code {
    [CascadingParameter]
    public string ElementStyle { get; set; }
}
```

Если мы поменяем переменную Style в родительском элементе, то она поменяется и во всех дочерних элементах:

```csharp
<button class="btn btn-primary" @onclick="ChangeColor">Click me</button>

@code {
    private void ChangeColor()
    {
        Style = "color:red;";
    }
}
```

### Каскадирование - практическое применение

Механизм удобно использовать для поддержки тем пользовательского интерфейса:

```csharp
<CascadingValue Value="@theme">
    <Router ...>
        ...
    </Router>
</CascadingValue>

@code {
    private ThemeInfo theme = new() { ButtonClass = "btn-success" };
}
```

Можно применять несколько каскадных значений:

```csharp
<CascadingValue Value="@parentCascadeParameter1" Name="CascadeParam1">
    <CascadingValue Value="@ParentCascadeParameter2" Name="CascadeParam2">
        ...
    </CascadingValue>
</CascadingValue>
```

Эти значения будут транслироваться в различные каскадные параметры:

```csharp
@code {
    [CascadingParameter(Name = "CascadeParam1")]
    protected CascadingType? ChildCascadeParameter1 { get; set; }

    [CascadingParameter(Name = "CascadeParam2")]
    protected CascadingType? ChildCascadeParameter2 { get; set; }
}
```

## Использование AppState

Портал learn.microsoft.com содержит [материалы](https://learn.microsoft.com/ru-ru/training/modules/interact-with-data-blazor-web-apps/6-share-data-in-blazor-applications) по добавлению AppState для Blazor Server.

Общая идея состоит в том, что разрабатывается класс, в котором хранится некоторое состояние. Например:

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

Сохранять классы, отвечающие за _State Management_ рекомендуется в папке "Services".

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

## Жизненный цикл компонента

Компонент создаётся когда пользователь заходит на страницу и удаляется, когда пользователь уходит с неё.

Основные события связанные с жизненным циклом:

- SetParametersAsync: вызывается когда устанавливаются параметры, задаваемые родительским элементом
- OnInitialized / OnInitializedAsync: вызываются, когда компонент готов к запуску
- OnParametersSet / OnParametersSetAsync: вызываются, когда устанавливаются параметры компонента
- OnAfterRender / OnAfterRenderAsync: вызывается после "отрисовки" элемента
- Dispose / DisposeAsync: вызывается при удалении объекта (если реализован интерфейс IDisposable, или IAsyncDisposable)

## Библиотека классов Razor

Библиотека классов Razor — это **тип проекта .NET**, содержащий компоненты Razor, страницы, HTML, файлы Cascading Style Sheet (CSS), JavaScript, изображения и другое статическое веб-содержимое, на которое может ссылаться приложение Blazor.

"Библиотека классов" и "Библиотека классов Razor" — это разные, но связанные вещи. "Библиотека классов Razor" является более специализированной, чем "Библиотека классов".

Проект **Библиотека классов Razor** создаётся из соответствующего шаблона в Visual Studio/Visual Studio Code. Например, командой:

```shell
dotnet new razorclasslib -o MyProjectName
```

Типовой компонент, максимально простой - он содержит div и что-то внутри него, например:

```csharp
<div class="my-component">
    This component is defined in the <strong>FirstRazorLibrary</strong> library.
</div>
```

Мы можем добавить разработанную библиотеку классов Razor в проект, как ссылку (Reference). Сделать это можно, например, командой:

```csharp
dotnet add reference ../MyClassLibrary
```

Мы можем оформить компонент, также как и NuGet-package. В этом случае, включить зависимость можно следующей командой:

```csharp
dotnet add package MyClassLibrary
```

Хорошими кандидатами на создание библиотек классов Razor являются модальные диалоги.

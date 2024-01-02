# Маршрутизация в Blazor

Маршрутизация настраивается в файле "App.razor" и выглядит следующим образом:

```csharp
<Router AppAssembly="@typeof(Program).Assembly">
	<Found Context="routeData">
		<RouteView RouteData="@routeData" DefaultLayout="@typeof(MainLayout)" />
	</Found>
	<NotFound>
		<p>Sorry, we haven't found any pizzas here.</p>
	</NotFound>
</Router>
```

Атрибут "AppAssembly" позволяет указать сборки, которую следуюет сканировать. Сканирование предполгает, что в ней есть компоненты с атрибутом **RouteAttribute**. Этот атрибут повляется у компонента, в том числе, если в его определении используется директива `@page`.

В приложении, сгенерированном по шаблону, такие директивы используются в следующих файлах:

- Index.razor: `@page "/"`
- Counter.razor: `@page "/counter"`
- FetchData.rzor: `@page "/fetchdata"`

Следует заметить, что Blazor позволяет указывать несколько директив @page, например:

```csharp
@page "/Pizzas"
@page "/CustomPizzas"
```

Секция **Found** определяет компонент, который обрабатывает запрос в том случае, если маршрут был найден в сборке. В секция **NotFound**, если осуществляется попытка перехода на несуществующую (отсутствующую в сборке) странице.

В нашем примере, при любом легальном переходе обработку запроса на переход будет обрабатывать страница **MainLayout**, определённая в папке "Shared". В сгенерированном приложении, MainLayout определяет общий шаблон формы, в котором есть навигационный блок размещающийся в левой части экрана (Sidebar) и основной блок, размещающийся справа и состоящий из некоторого заголовка и основной части:

```csharp
@inherits LayoutComponentBase

<div class="bb-page">

    <Sidebar @ref="sidebar"
             ImageSrc="/images/logo/logo-white.svg"
             Title="Blazor Bootstrap"
             DataProvider="SidebarDataProvider" />
    <main>
        <div class="bb-top-row px-4 d-flex justify-content-end">
            <a href="https://docs.microsoft.com/aspnet/" target="_blank">About</a>
        </div>

        <article class="content px-4">
            <div class="py-2">
                @Body
            </div>
        </article>
    </main>
</div>
```

Можно предположить, что содержимое Sidebar может быть сформировано динамически:

```csharp
@code {
    private Sidebar sidebar = default!;
    private IEnumerable<NavItem> navItems = default!;

    private async Task<SidebarDataProviderResult> SidebarDataProvider(SidebarDataProviderRequest request)
    {
        if (navItems is null)
            navItems = GetNavItems();

        return await Task.FromResult(request.ApplyTo(navItems));
    }

    private IEnumerable<NavItem> GetNavItems()
    {
        navItems = new List<NavItem>
        {
            new NavItem { Id = "1", Href = "/", IconName = IconName.HouseDoorFill, Text = "Home", Match = NavLinkMatch.All},
            new NavItem { Id = "2", Href = "/counter", IconName = IconName.PlusSquareFill, Text = "Counter"},
            new NavItem { Id = "3", Href = "/fetchdata", IconName = IconName.Table, Text = "Fetch Data"},
        };

        return navItems;
    }
}
```

Мы можем заменить навигационную панель с вертикальной (Sidebar), на горизонтальную на базе Twitter Bootstrap:


```html
@inherits LayoutComponentBase

<NavMenu />

<main class="container">
    @Body
</main>
```

Следует заметить, что навигационную панель Bootstrap также можно генерировать динамически используя цикл @for. Например:

```csharp
<ul>
    @for (int x=1;x<6;x++)
    {
        <li>
            Item @x
        </li>
    }
</ul>
```

Однако, можно предположить, что сложность структуры выпадающего меню, которое обычно реализуется средствами Bootstrap, значительно сложнее структуре меню из стартового приложения, сгененрированного по стандартному шаблону.

Почитать о циклах в Blazor можно в статье [Blazor for loop](https://www.webassemblyman.com/blazor/blazorforloop.html).

## Получение сведений о расположении и навигация с помощью NavigationManager

Для того, чтобы получить информацию о базовом URI web-сайта испольузется объект NavigationManager, который следует встроить в страницу, например:

```csharp
@page "/pizzas"
@inject NavigationManager NavManager

<a href=@HomePageURI>Home Page</a>

@code {
	public string HomePageURI { get; set; }
	
	protected override void OnInitialized()
	{
		HomePageURI = NavManager.BaseUri;
	}
}
```

Если мы хотим разобрать строку запроса, то следует выполнить  синтаксический анализ полного URI. Например:

```csharp
@code {
	private string ToppingName { get; set; }
	
	protected override void OnInitialized()
	{
		var uri = NavManager.ToAbsoluteUri(NavManager.Uri);
		if (QueryHelpers.ParseQuery(uri.Query).TryGetValue("extratopping", out var extraTopping))
		{
			ToppingName = System.Convert.ToString(extraTopping);
		}
	}
}
```

Для переадрессации можно использовать метод **NavigateTo**():

```csharp
<button class="btn" @onclick="NavigateToPaymentPage">
	Buy this pizza!
</button>

@code {
	private void NavigateToPaymentPage()
	{
		NavManager.NavigateTo("/buypizza");
	}
}
```

## Использование NavLink

В Blazor вместо тэга <a> рекомендуется использовать компонент NavLink. Например:

```csharp
<NavLink href=@HomePageURI Match="NavLinkMatch.All">Home Page</NavLink>
```

Значения атрибута Match (NavLinkMatch.All и NavLinkMatch.Prefix) влияют на визуальное отображение ссылки (активная, или не активная).

## Директива @page гораздо более сложная

Мы можем заложить в директиву @page указание на извлечение параметров, близкое к RESTful:

```csharp
@page "/FavoritePizzas/{favorite}"

<h1>Choose a Pizza</h1>

<p>Your favorite pizza is: @Favorite</p>

@code {
	[Parameter]
	public string Favorite { get; set; }
}
```

В приведённом выше примере, Blazor поймёт, что в конкретном поле URI (favorite) находится изменяемое значение и проекцирует его в поле **Favorite** в программном коде.

Параметр может быть не обязательным - для этого достаточно добавить символ `?`:

```csharp
@page "/FavoritePizzas/{favorite?}"
```

Можно добавлять значение по умолчанию:

```csharp
@code {
	[Parameter]
	public string Favorite { get; set; }
	
	protected override void OnInitialized()
	{
		Favorite ??= "Пицца с тунцом";
	}
}
```

Также мы можем явным образом указывать тип параметра маршрута, для случаев, когда мы хотим получать не string, а, например, целочисленное значение:

```csharp
@page "/FavoritePizza/{preferredsize:int}"
```

Список используемых типов [доступен по ссылке](https://learn.microsoft.com/ru-ru/training/modules/use-pages-routing-layouts-control-blazor-navigation/4-explore-route-parameters-effect-apps-routing).

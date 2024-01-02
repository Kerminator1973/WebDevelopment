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

Однако возникает вопрос, можно ли формировать навигационную панель Bootstrap динамически?

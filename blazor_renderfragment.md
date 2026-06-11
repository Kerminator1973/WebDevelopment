# Blazor RenderFragment

Ключевая статья - [Шаблонные компоненты Blazor в ASP.NET Core](https://learn.microsoft.com/ru-ru/aspnet/core/blazor/components/templated-components?view=aspnetcore-8.0) by Роберт Хакен.

**Шаблонные компоненты** — это компоненты, которые получают один или несколько шаблонов пользовательского интерфейса в качестве параметров, которые можно использовать в логике отрисовки компонента.

>Более инженерное объяснение:
>
>**RenderFragment** в Blazor — это делегат, который описывает, как отрисовать фрагмент пользовательского интерфейса. Его сигнатура: public delegate void RenderFragment(RenderTreeBuilder builder). То есть он принимает объект RenderTreeBuilder и через него «пишет» узлы в дерево рендеринга (кадры RenderTreeFrame).
>
>Главная задача — передавать динамическое содержимое между компонентами. Это даёт гибкость: компонент не жёстко задаёт, что внутри, а принимает "кусок UI" извне.
>
>RenderFragment — это не HTML-строка. Он не генерирует строку; он напрямую пишет в RenderTreeBuilder. Это эффективнее и позволяет корректно работать с событиями, привязками и компонентами внутри фрагмента.
>
>Контекст выполнения. Фрагмент выполняется в контексте компонента, который его вызывает. Поэтому внутри фрагмента работают @onclick, @bind, параметры компонента и т. п
>
>Пример реальной ситуации, в которой RenderFragment был бы очень полезен, но "жизнь" распорядилась иначе. В SPCD есть модальное окно для отправки заявки в департамент сервиса. Появилось несколько разных типов заявок, с отличиями в полях ввода. В конкретном коде, в компонент передаётся параметр "тип заявки", а верстка состоит из целой кучи конструкций `@if {}`. Код хрупкий и его сложно сопровождать. Если бы использовался RenderFragment, мог бы существовать шаблонный компонент без условной верстки, а специфика заявки описывалась бы там, где конкретная заявка должна заводиться.

Шаблонный компонент определяется путем указания одного или нескольких параметров компонента типа **RenderFragment** или `RenderFragment<TValue>`. Шаблонный компонент может выглядеть следующим образом:

```csharp
@typeparam TItem

<nav class="navbar navbar-expand navbar-light bg-light">
    <div class="container justify-content-start">
        @StartContent
        <div class="navbar-nav">
            @foreach (var item in Items)
            {
                @ItemTemplate(item)
            }
        </div>
    </div>
</nav>

@code {
    [Parameter]
    public RenderFragment? StartContent { get; set; }

    [Parameter, EditorRequired]
    public RenderFragment<TItem> ItemTemplate { get; set; } = default!;

    [Parameter, EditorRequired]
    public IReadOnlyList<TItem> Items { get; set; } = default!;
}
```

Стоит отметить, что у этого компонента должно быть имя - файл может быть назван "TemplatedNavBar.razor".

В приведённом выше компонент есть три фрагмента:

- StartContent - фрагмент, отвечающий за заголовок блока
- Items - список отображаемых элементов
- ItemTemplate - фрагмент, отвечающий за верстку отдельного элемента списка

При использовании шаблонного компонента параметры шаблона можно задать с помощью дочерних элементов, имена которых совпадают с именами параметров. Ниже приведён пример использования шаблонного компонента 

```csharp
@page "/pets-1"

<PageTitle>Pets 1</PageTitle>

<h1>Pets Example 1</h1>

<TemplatedNavBar Items="pets" Context="pet">
    <StartContent>
        <a href="/" class="navbar-brand">PetsApp</a>
    </StartContent>
    <ItemTemplate>
        <NavLink href="@($"/pet-detail/{pet.PetId}?ReturnUrl=%2Fpets-1")" class="nav-link">
            @pet.Name
        </NavLink>
    </ItemTemplate>
</TemplatedNavBar>

@code {
    private List<Pet> pets = new()
    {
        new Pet { PetId = 1, Name = "Mr. Bigglesworth" },
        new Pet { PetId = 2, Name = "Salem Saberhagen" },
        new Pet { PetId = 3, Name = "K-9" }
    };

    private class Pet
    {
        public int PetId { get; set; }
        public string? Name { get; set; }
    }
}
```

В приведённом выше примере мы используем компонент TemplatedNavBar (который определён в файле "TemplatedNavBar.razor"). Внутри определения мы задачём заголовок, который в компоненте определён как `public RenderFragment? StartContent { get; set; }`:

```csharp
<StartContent>
    <a href="/" class="navbar-brand">PetsApp</a>
</StartContent>
```

Также мы определяем шаблон верстки каждого элемента - ItemTemplate:

```csharp
<ItemTemplate>
    <NavLink href="@($"/pet-detail/{pet.PetId}?ReturnUrl=%2Fpets-1")" class="nav-link">
        @pet.Name
    </NavLink>
</ItemTemplate>
```

Мы используем **Items** как атрибут компонента и присваиваем ему список `List<Pet> pets`. Заметим, что атрибут имеет тип `IReadOnlyList<TItem> Items { get; set; }`.

## Есть ли что-то подобное в React

Рекомендуется к прочтению статья [React component as prop: the right way](https://www.developerway.com/posts/react-component-as-prop-the-right-way) by Nadia Makarevich.

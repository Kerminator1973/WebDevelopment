# Трюки Blazor

Предположим, что нам нужно задать регулярное выражение, которое будет выполнять валидацию введённого значения в FluentTextField. Проблема возникает в тех случаях, когда в регулярном выражении используется символ `@`. Как сделать так, чтобы этот символ не был специальным для Razor?

Самый простой вариант:

```csharp
<FluentTextField 
    Value="@BannerCandidate?.Link" 
    ValueChanged="@OnLinkChanged"
    Pattern="@UrlPattern"
    style="width: 100%; flex: 1;" />
```

```csharp
@code {
    // Символ @ в C#-строке уже не является специальным для Razor
    private const string UrlPattern =
        @"[a-zA-Z0-9\-_\.\~\:\/\?\#\[\]\@\$\&'\(\)\*\+\,\;\=\%]*";
}
```

Заметим, что атрибут `pattern` применяется не для каждого вводимого символа, а в момент отправки формы: если введенные данные не соответствуют шаблону, браузер блокирует отправку и выводит системное сообщение об ошибке.

## Импортирование зависимостей

Списки зависимостей в Blazor-приложениях могут быть очень большими - они могут содержать несколько десятков, или даже сотен директив, которые выглядят следующим образом:

```csharp
@using Microsoft.AspNetCore.Components.Authorization
@using Microsoft.AspNetCore.Components.Forms
@using Microsoft.AspNetCore.Components.Routing
@using Microsoft.AspNetCore.Components.Web
@using Microsoft.AspNetCore.Components.Web.Virtualization
@using Microsoft.AspNetCore.Components.WebAssembly.Http
@using Microsoft.JSInterop
```

Чтобы не включать часто используемые зависимостит в каждый компонент приложения, в проекте есть специальный файл "_Imports.razor". Директивы импорта из этого файла автоматически включаются в каждый компонент приложения.

## Проверить, была ли передана callback-функция в качестве параметра

Предположим, что у нас есть некоторый компонент, который должен при выполнении некоторого действия вызвать callback-функцию родительского компонента. Предположим также, что callback определён так:

```csharp
[Parameter]
public EventCallback AutoSaveOnComplite { get; set; }
```

Проверить, что родительский компонент установил атрибут AutoSaveOnComplite при создании дочернего компонента можно так:

```csharp
if (AutoSaveOnComplite.HasDelegate)
    await AutoSaveOnComplite.InvokeAsync();
```

## Как избежать "лишнего" ре-рендеринга

Blazor автоматически вызывает StateHasChanged() после завершения OnParametersSet() — это часть жизненного цикла компонента. Именно этот вызов инициирует ре-рендеринг.

Чтобы избежать "лишнего" ре-рендеринга, необходимо реализовать метод ShouldRender():

```csharp
private bool _shouldRender = true;

protected override void OnParametersSet()
{
    if (Page is not null)
    {
        _shouldRender = ImgUrl != Page.TitleImageUrl;
        ImgUrl = Page.TitleImageUrl;
    }
}

protected override bool ShouldRender()
{
    return _shouldRender;
}
```

## Primary constructor в С# 12 (.NET 8)

Primary constructor позволяет:

- объявить параметры прямо в объявлении класса
- использовать эти параметры в теле класса (в т. ч. присваивать полям)
- сократить шаблонный код — не нужно явно писать полный конструктор и поля‑приёмники

Пример кода:

```csharp
public class DeviceUserApi(HttpClient http)
{
    public async Task<List<UserDeviceView>> GetUserDevices(Guid userId) 
        => await http.GetFromJsonAsync<List<UserDeviceView>>($"DeviceUser/GetUserDevices/{userId}")
            ?? throw new InvalidOperationException("GetUserDevices is null");
}
```

Компилятор преобразует код с primary constructor в эквивалент классического конструктора. Приведённый выше пример компилятор разворачивает примерно в такой код:

```csharp
public class DeviceUserApi
{
    private readonly HttpClient _http;

    public DeviceUserApi(HttpClient http)
    {
        _http = http;
    }

    public async Task<List<UserDeviceView>> GetUserDevices(Guid userId)
        => await _http.GetFromJsonAsync<List<UserDeviceView>>($"DeviceUser/GetUserDevices/{userId}")
            ?? throw new InvalidOperationException("GetUserDevices is null");
}
```

## Выделить часть полей из элементов контейнера

LINQ позволяет делать множество действий с обрабатываемыми данными и, в том числе, излекать из элементов контейнера только те поля, которые необходимы разработчику. Пример кода:

```csharp
source.SerialEntries
    .Select(entry => new Shared.Request.SerialEntryRequest
    {
        Modification = entry.Modification,
        SerialNumber = entry.SerialNumber
    })
    .ToList()
```

## "Классическая проблема" с ошибками синхронизации состояния

В моём коде используется выпадающий список с элементами. При старте формы, первый элемент списка называется "Выберите элемент" (placeholder). Когда пользователь выбирает не первый элемент, мой код удаляет placeholder. По каким то причинам, визуально текущим выбранным элементом становится не тот, который реально выбрал пользователь, а следующий. При этом в переменной, связанной через свойство `@bind-Value` сохраняется корректное значение.

Вот мой оригинальный код:

```csharp
private void OnProductModelChanged(ProductOption? selection)
{
	if (!string.IsNullOrWhiteSpace(selection?.Value))
	{
		var firstElement = CounterModels.First();
		if (string.IsNullOrEmpty(firstElement.Value))
		{
			CounterModels.Remove(firstElement);
		}
	}
}
```

Clause Sonnet 4.6: это классический баг синхронизации состояния между Blazor и веб-компонентами Fluent UI. **FluentSelect** — это нативный веб-компонент со своим внутренним состоянием, который отслеживает выбранный элемент по индексу в DOM. Вот что происходит пошагово:

- Пользователь выбирает элемент на позиции N (например, индекс 2)
- Срабатывает OnProductModelChanged, @bind-Value уже обновлён верно
- Удаляется элемент с индексом 0 из коллекции
- Blazor перерисовывает DOM — все элементы сдвигаются на одну позицию
- Веб-компонент всё ещё думает, что выбрана позиция N, но теперь там другой элемент

Самый надёжный способ — использовать директиву @key на компоненте FluentSelect, чтобы Blazor полностью пересоздал его при изменении списка. Это сбросит внутреннее состояние веб-компонента и синхронизирует его с @bind-Value.

В разметке/верстке:

```csharp
<FluentSelect @key="_selectKey"
              @bind-Value="SelectedValue"
              TOption="ProductOption"
              ...>
    ...
</FluentSelect>
```

В коде:

```csharp
private int _selectKey = 0;

private void OnProductModelChanged(ProductOption? selection)
{
    if (!string.IsNullOrWhiteSpace(selection?.Value))
    {
        var firstElement = CounterModels.First();
        if (string.IsNullOrEmpty(firstElement.Value))
        {
            CounterModels.Remove(firstElement);
            _selectKey++; // Принудительное полное пересоздание компонента
        }
    }
}
```

`@key` — это специальная директива Blazor, которая даёт подсказку алгоритму диффинга, как сопоставлять DOM-элементы и компоненты между рендерами.

Когда Blazor перерисовывает список, он по умолчанию сравнивает элементы по позиции: первый с первым, второй со вторым и т.д. Это работает плохо, если порядок элементов меняется — Blazor не поймёт, что элемент просто переместился, и пересоздаст его заново вместо перестановки.

`@key` говорит Blazor: "сравнивай элементы не по позиции, а по этому идентификатору".

Подход особенно важен, в следующих случаях:

- Динамические списки — добавление, удаление, сортировка элементов коллекции
- Компоненты с состоянием — если <MyComponent> хранит внутреннее состояние (например, открытый аккордеон, фокус поля), без @key это состояние «перетечёт» к соседнему элементу после перестановки
- Принудительное пересоздание — если передать новый @key, Blazor уничтожит старый экземпляр компонента и создаст новый. Это удобно, когда нужно сбросить состояние компонента при смене данных:

```csharp
<UserProfile @key="selectedUserId" UserId="@selectedUserId" />
```

### Директива @key в Blazor - разъяснение Claude Sonnet 4.6

Когда состояние компонента меняется и запускается повторный рендеринг, Blazor не перестраивает DOM с нуля. Вместо этого он запускает алгоритм сравнения (_diffing_): сопоставляет предыдущее дерево компонентов с новым и вычисляет минимальный набор изменений.

Ключевой момент: по умолчанию сопоставление происходит позиционно. **Blazor считает**, что компонент на позиции N в новом дереве соответствует компоненту на позиции N в старом дереве. Это работает нормально, пока порядок и количество элементов стабильны. Но как только элементы добавляются в середину списка, удаляются или переставляются — начинаются проблемы.

#### Что конкретно идёт не так

Представь список компонентов, отрендеренных через @foreach. Каждый компонент имеет внутреннее состояние (раскрытое дерево, введённый текст, выбранное значение в FluentSelect и т.д.).

Ты удаляешь первый элемент списка. Blazor видит, что на позиции 0 теперь находятся данные второго элемента, и не создаёт новый компонент — он берёт уже существующий экземпляр компонента с позиции 0 (со старым внутренним состоянием первого элемента) и просто обновляет его параметры. В результате компонент визуально показывает данные второго элемента, но его внутреннее состояние осталось от первого. Это и есть классический симптом "неправильного рендеринга".

Обратная ситуация: ты вставляешь элемент в начало. Blazor снова сопоставляет по позициям и начинает каскадно "перекладывать" состояния по всем компонентам. Все Dispose() вызываются не там, где нужно, OnInitializedAsync() не вызывается для нового элемента и т.д.

#### Что делает @key

Директива @key говорит Blazor: перестань сопоставлять компоненты по позиции, сопоставляй их по этому значению.

```csharp
@foreach (var item in Items)
{
    <FluentCard @key="item.Id">
        <MyItemComponent Data="item" />
    </FluentCard>
}
```

Теперь алгоритм diffing работает принципиально иначе. При следующем рендеринге Blazor строит словарь {key → компонент} и ищет соответствия по ключу, а не по позиции. Если элемент с таким ключом уже существует — используется его экземпляр со всем накопленным состоянием. Если ключ новый — создаётся свежий экземпляр с полным жизненным циклом (OnInitialized, OnParametersSet и т.д.). Если ключ исчез — компонент корректно уничтожается с вызовом Dispose().

#### Требования к значению ключа

Ключ должен быть уникальным в пределах одного уровня дерева компонентов, стабильным между рендерингами для одного и того же логического элемента, и не должен повторно использоваться для разных элементов в рамках одного списка.

Хорошие кандидаты: Id из базы данных, Guid, уникальный строковый код. Плохой вариант — индекс `@foreach` (он не решает проблему позиционного сопоставления) и уж тем более `Guid.NewGuid()` в самом выражении (он меняется при каждом рендеринге, что заставляет Blazor постоянно пересоздавать компоненты).

#### Важный нюанс с Fluent UI

Компоненты Fluent UI часто имеют богатое внутреннее состояние (анимации, фокус, открытые оверлеи, выбранные опции в FluentCombobox). Именно поэтому при динамических операциях с такими компонентами артефакты без `@key` проявляются особенно ярко — поверхностного обновления параметров недостаточно, а созданный Blazor-ом "смешанный" экземпляр ведёт себя непредсказуемо.

#### Похоже ли на React и Vue.js?

Можно говорить о том, что это универсальная концепция для всех фреймворков с виртуальным DOM или аналогичным механизмом **reconciliation**. Blazor в этом смысле не изобрёл ничего нового, а воспроизвёл уже устоявшуюся практику.
React использует prop key, синтаксис практически идентичен:

```js
{items.map(item => (
  <MyComponent key={item.id} data={item} />
))}
```

Механизм работает точно так же: reconciler сопоставляет элементы по key, а не по позиции. Именно из экосистемы React эта концепция получила наибольшую известность — знаменитое предупреждение в консоли `Each child in a list should have a unique "key" prop` знакомо практически каждому, кто работал с React.

Vue.js использует директиву :key (сокращение от v-bind:key), чаще всего в паре с v-for:

```js
<MyComponent
  v-for="item in items"
  :key="item.id"
  :data="item"
/>
```

Алгоритм виртуального DOM Vue (patch algorithm) использует ключ точно с той же целью: идентифицировать узлы между рендерингами по значению, а не по позиции.

Принципиальная разница между фреймворками в данном контексте — только синтаксическая. Семантика везде одна и та же: ключ — это подсказка для алгоритма reconciliation/diffing, позволяющая связывать логические элементы данных с конкретными экземплярами компонентов стабильным образом. Так что знание этой концепции в одном фреймворке практически напрямую переносится в любой другой.

### Другие варианты

Существуют и другие варианты, которые позволяют не удалять placeholder, а скрывать его. Один из вариантов:

```csharp
<FluentSelect @bind-Value="SelectedValue" TOption="ProductOption" ...>
    @if (_showPlaceholder)
    {
        <FluentOption Value="">Выберите элемент</FluentOption>
    }
    @foreach (var item in CounterModels.Where(x => !string.IsNullOrEmpty(x.Value)))
    {
        <FluentOption Value="@item.Value">@item.Label</FluentOption>
    }
</FluentSelect>
```

Такой подход чище, поскольку не мутирует исходную коллекцию и полностью избегает проблемы со сдвигом индексов в DOM.

>Однако экспериментально альтернативный подход я не проверял и, возможно, у него есть какие-то _side-effects_.

## Отладка в коде верстки

Мы может добавить в коде рендеринга вывод данных в лог, а также устанавливать точку останова для просмотра локальных значений:

```csharp
@* Выбор модификации *@
@{Console.WriteLine($"Entry modification = {entry.Modification}");}
<FluentSelect Class="form-control"
	ValueChanged="@((string val) => entry.Modification = val)"
	TOption="ProductOption"
	OptionText="@(o => o.DisplayName)"
	OptionValue="@(o => o.Value)"
	style="min-width: 0; flex: 1;">
		@foreach (var option in ModificationsList)
		{
			Console.WriteLine($"{option.Value} vs {entry.Modification}");
			<FluentOption
				Value="@option.Value"
				Selected="@(option.Value == entry.Modification)"
			>
				@option.DisplayName
			</FluentOption>
		}
</FluentSelect>
```

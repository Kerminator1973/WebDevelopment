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

## Классическая 

В моём коде используется выпадающий список с элементами. При старте формы первый элемент списка называется "Выберите элемент" (placeholder). Когда пользователь выбирает не первый элемент, мой код удаляет placeholder. По каким то причинам, визуально текущим выбранным элементом становится не тот, который реально выбрал пользователь, а следующий. При этом в переменной, связанной через свойство `@bind-Value` сохраняется корректное значение.

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

Это классический баг синхронизации состояния между Blazor и веб-компонентами Fluent UI. **FluentSelect** — это нативный веб-компонент со своим внутренним состоянием, который отслеживает выбранный элемент по индексу в DOM. Вот что происходит пошагово:

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

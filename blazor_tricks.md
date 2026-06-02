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

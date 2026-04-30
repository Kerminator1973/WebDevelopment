# Проверка возможности смены исполнения у счётчика, или группы счётчиков

Документ описывает модификацию кода, а также особенности целевого приложения (SPCD), обеспечивающие проверку корректности параметров счётчиков ДОРС, которые должны быть переведены в исполнение RUS_NEW.

>Для обеспечения возможности отладки кода в Visual Studio 2026, необходимо выбрать совместимый браузер: Google Chrome, или Microsoft Edge

## Добавление модального диалога для ввода параметров

Модель (настраиваемые параметры) были добавлены в папку "ModelView" в файл "UpgradabilityParams.cs":

```csharp
using System.ComponentModel.DataAnnotations;

namespace FluentForm.ModelView
{
    public record UpgradabilityParams
    {
        [Display(Name = "Название модели")]
        [Required(ErrorMessage = "Название модели обязательно")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "От 2 до 50 символов")]
        public string? ProductName { get; set; } = string.Empty;

        public string? SerialNumber { get; set; } = string.Empty;
    }
}
```

Атрибутированый код, фактически, случайный и был добавлен только для проверки, что механизм валидации работает.

>В приложении SPCD папка "Shared.ModelView" содержит классы настраиваемых параметров модельных диалогов. К сожалению, имя папки содержит грамматическую ошибку (оно в едитнственном числе, а должно быть во множественном). Кроме этого имя папки не отражает его смысл. Более корректно было бы назвать папку "Shared.UIModels".

Модальный диалог описывается в одном файле - "Pages.UpgradabilityParamsDialog.razor":

```csharp
@using System.ComponentModel.DataAnnotations
@using Microsoft.Fast.Components.FluentUI
@using FluentForm.ModelView
@implements IDialogContentComponent<UpgradabilityParams>

<EditForm Model="@Content" OnValidSubmit="HandleValidSubmit">
    <DataAnnotationsValidator />

    <FluentDialogHeader>Проверка возможности обновления</FluentDialogHeader>

    <FluentDialogBody Class="w-auto">
        <FluentTextField @bind-Value="Content.ProductName">Модель прибора:</FluentTextField>
        <FluentTextField @bind-Value="Content.SerialNumber">Серийный номер:</FluentTextField>
    </FluentDialogBody>

    <ValidationSummary />

    <FluentDialogFooter Class="d-flex justify-content-between">
        <FluentButton Type="ButtonType.Submit">Проверить</FluentButton>
        <FluentButton Type="ButtonType.Button" @onclick="CloseDialog">Закрыть</FluentButton>
    </FluentDialogFooter>
</EditForm>

@code {
    [Parameter] public UpgradabilityParams Content { get; set; } = new();

    [CascadingParameter] public FluentDialog Dialog { get; set; } = default!;

    protected override void OnParametersSet()
    {
        Content ??= new UpgradabilityParams();
    }

    private async Task HandleValidSubmit()
    {
        await Dialog.CloseAsync(Content); // или CloseAsync() без результата
    }

    private async Task CloseDialog()
    {
        await Dialog.CloseAsync();
    }
}
```

К особенностям модального диалога можно отнести необходимость обернуть верстку в специальные тэги для того, чтобы заработала валидация ввода:

```csharp
<EditForm Model="@Content" OnValidSubmit="HandleValidSubmit">
    <DataAnnotationsValidator />
</EditForm>
```

Для визуализации ошибок можно использовать либо общее для всех органов управления поле с описание ошибок валидации, либо добавить такое поле для каждого органа управления. Сделать это можно для общего поля:

```csharp
<ValidationSummary />
```

Для каждого органа управления по отдельности:

```csharp
<FluentTextField @bind-Value="Content.ProductName">Product name:</FluentTextField>
<ValidationMessage For="@(() => Content.ProductName)" />

<FluentTextField @bind-Value="Content.SerialNumber">Serial number:</FluentTextField>
<ValidationMessage For="@(() => Content.SerialNumber)" />
```

Страница с вызовом модального диалога:

```csharp
@page "/"
@inject IDialogService DialogService

<PageTitle>Home</PageTitle>

@using FluentForm.ModelView
@using Microsoft.Fast.Components.FluentUI

@* Добавляем provider, без определения которого диалоги работать не будут *@
<FluentDialogProvider />

<FluentCard>
    <h2>Hello! FluentIU is here!</h2>
    <FluentButton Appearance="@Appearance.Accent" @onclick="CheckDeviceUpgradability">
        Check Device Upgradability
    </FluentButton>
</FluentCard>

@code {

    private bool _trapFocus = true;
    private bool _modal = true;

    UpgradabilityParams upgradabilityParams = new() {};

    private async void CheckDeviceUpgradability()
    {
        DialogParameters parameters = new()
        {
            PrimaryAction = "Yes",
            PrimaryActionEnabled = false,
            SecondaryAction = "No",
            Width = "500px",
            TrapFocus = _trapFocus,
            Modal = _modal,
            PreventScroll = true
        };

        upgradabilityParams.ProductName = String.Empty;
        upgradabilityParams.SerialNumber = String.Empty;

        var dialog = await DialogService.ShowDialogAsync<UpgradabilityParamsDialog>(upgradabilityParams, parameters);
        DialogResult? result = await dialog.Result;

        // Здесь доступны введённые значения, через параметр upgradabilityParams
    }
}
```

>Для работы с кодом необходимо развить специализированные навыки поиска информации. Например, представим, что нас интересует следующий код:
>
>```csharp
var dialogInstance = await DialogService.ShowDialogAsync<ModalFeedbackForm>(new DialogParameters()
>```
>
>Если мы выполним поиск по содержимому файлов, то мы не найдём упоминаний класса ModalFeedbackForm, т.к. в явном виде в коде он отсутствует. ModalFeedbackForm - является ссылкой на имя файла "ModalFeedbackForm.razor", который находится по пути: `\ServicePartners.Client\Components\Header\ModalFeedbackForm.razor`.
>
>Подобная особенность вообще свойственная FrontEnd-инструментам, в которых используется компонентная модель.
>
>В концепции файловой структуры проекта Романа, модальные диалоги должны находится в папке "Components".
>
>Рекомендуется почитать о _Feature-Sliced Design_ (FSD). Это архитектурная методология, которая организует код по слоям, слайсам и сегментам, обеспечивая масштабируемость, модульность и удобство сопровождения проекта.

## Модификация формы ввода - добавление выпадающего списка "модель"

Набор полей в модальном диалоге был изменён. После совещания с product owner-ом было принято решение предоставлять пользователям возможность использовать три органа управления:

- выпадающий список с названием продукта, например: "DORS 210"
- модификация прибора
- список серийных номеров

```csharp
public record UpgradabilityParams
{
    public string? ProductModel { get; set; } = string.Empty;

    [Display(Name = "Название модели")]
    [Required(ErrorMessage = "Название модели обязательно")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "От 2 до 50 символов")]
    public string? Modification { get; set; } = string.Empty;

    public string? SerialNumber { get; set; } = string.Empty;
}
```

Код модального диалога также существенно изменился:

```csharp
@using System.ComponentModel.DataAnnotations
@using Microsoft.Fast.Components.FluentUI
@using FluentForm.ModelView
@implements IDialogContentComponent<UpgradabilityParams>

<EditForm Model="@Content" OnValidSubmit="HandleValidSubmit">
    <DataAnnotationsValidator />

    <FluentDialogHeader>Проверка возможности обновления</FluentDialogHeader>

    <FluentDialogBody Class="w-auto">
        <div class="mb-4">
            <FluentLabel Typo="Typography.Subject">Имя модели:</FluentLabel>
            <FluentSelect @bind-Value="@Content.ProductModel" TValue="string" TOption="string">
                @foreach (var name in CounterModels)
                {
                    <FluentOption Value="@name">@name</FluentOption>
                }
            </FluentSelect>
        </div>
        <div class="mb-4">
            <FluentTextField @bind-Value="Content.Modification">Модификация:</FluentTextField>
        </div>
        <div class="mb-4">
            <FluentTextField @bind-Value="Content.SerialNumber">Серийный номер:</FluentTextField>
        </div>
    </FluentDialogBody>

    <ValidationSummary />

    <FluentDialogFooter Class="d-flex justify-content-between">
        <FluentButton Type="ButtonType.Submit">Проверить</FluentButton>
        <FluentButton Type="ButtonType.Button" @onclick="CloseDialog">Закрыть</FluentButton>
    </FluentDialogFooter>
</EditForm>

@code {
    [Parameter] public UpgradabilityParams Content { get; set; } = new();

    [CascadingParameter] public FluentDialog Dialog { get; set; } = default!;

    private List<string> CounterModels = new();

    protected override async Task OnInitializedAsync()
    {
        // Здесь список моделей счётчиков и валидаторов можно было бы загрузить через API с сервера

        // Формируем список моделей счётчиков и валидаторов, для которых доступно обновление прошивки
        string[] counterModels = { "DORS 200", "DORS 210", "DORS 210 Compact", "DORS 230", "DORS 750", "DORS 800", "DORS 820" };
        CounterModels.AddRange(counterModels);

        // После создания списка, выбираем в нём первый элемент и устанавливаем его значение,
        // в качестве текущего выбранного элемента
        if (CounterModels?.Any() == true)
        {
            Content.ProductModel = CounterModels.First();
        }
    }

    protected override void OnParametersSet()
    {
        Content ??= new UpgradabilityParams();
    }

    private async Task HandleValidSubmit()
    {
        await Dialog.CloseAsync(Content); // или CloseAsync() без результата
    }

    private async Task CloseDialog()
    {
        await Dialog.CloseAsync();
    }
}
```

Из существенных моментов, обратить внимание нужно на инициализацию поля ProductModel модели, т.к. если этого не сделать, то если пользователь не будет трогать выпадающий список, введёт значение в поле "серийный номер", а затем нажмёт кнопку "Проверить", то поле ProductModel останется пустым, хотя в модальном окне в списке будет выбран первый пункт - "D200".

## Ограничение ввода

Если нам нужно ограничить символы вводимые в конкретном поле ввода, например, разрешить вводить только числа и запятую, нам потребуется определить метод для обработки ввода в конкретном поле, а также явно указать, что обработчик следует вызывать сразу же, как только возникнет событие:

```csharp
<FluentTextArea  
    Value="@Content.SerialNumber" 
    ValueChanged="OnSerialNoChanged"
    Immediate="true">
    Серийный номер:
</FluentTextArea>
```

Обработчик события может выглядеть следующим образом:

```csharp
private Task OnSerialNoChanged(string? newValue)
{
    Content.SerialNumber = GetNumbersAndCommas(newValue);
    return Task.CompletedTask;
}

private static string GetNumbersAndCommas(string? source)
{
    if (string.IsNullOrEmpty(source))
        return string.Empty;

    // Оставляем только цифры и запятые
    return new string(source.Where(c => char.IsDigit(c) || c == ',').ToArray());
}
```

## Верстка - выравнивание ширины элементов выбора по ширине клиентской области диалога

Самый простой, но костыльный вариант - явно указывать ширину дочернего элемента в "100%" от клиентской области родительского элемента:

```csharp
<div class="mb-4">
    <FluentTextField 
        @bind-Value="Content.Modification" 
        Style="width:100%">Модификация:</FluentTextField>
</div>
<div class="mb-4">
    <FluentTextArea  
        Value="@Content.SerialNumber" 
        ValueChanged="OnSerialNoChanged"
        Immediate="true"
        Style="width:100%">Серийный номер:</FluentTextArea>
</div>
```

Однако этот подход приводит к нарушению правила семантической верстки, в соответствии с которым в html-коде не должно быть явно заданных атрибутов визуализации. Т.е. приведённый выше подход можно использовать только для грубой проверки визуализации.

Для использования CSS-изоляции (CSS Isolation) в Blazor нужно создать файл стилей с тем же именем, что и компонент, но с расширением ".razor.css." Blazor автоматически применит к элементам уникальный атрибут b-xxxxxxxx, обеспечивая изоляцию стилей.

В моём случае, следует создать файл "UpgradabilityParamsDialog.razor.css" и включить в него следующие стили:

```css
/* Применяем ширину к host-элементам fluent-компонентов через ::deep */
::deep fluent-select.full-width,
::deep fluent-text-field.full-width,
::deep fluent-text-area.full-width {
    width: 100%;
}
```

Верстка компонента изменяется следующим образом:

```csharp
<FluentSelect 
    @bind-Value="@Content.ProductModel" 
    TValue="string" TOption="string"
    Class="full-width">
    ...
</FluentSelect>

<FluentTextField 
    @bind-Value="Content.Modification"
    Class="full-width">Модификация:</FluentTextField>

<FluentTextArea  
    Value="@Content.SerialNumber" 
    ValueChanged="OnSerialNoChanged"
    Immediate="true"
    Class="full-width">Серийный номер:</FluentTextArea>
```

Здесь есть важный нюанс: компоненты Fluent UI рендерятся как кастомные HTML-элементы (web components), и CSS-изоляция Blazor добавляет атрибут только к элементу-хосту, но не проникает внутрь shadow DOM или в дочерние rendered-элементы компонента. Поэтому стандартный селектор не сработает напрямую.

Решение — использовать ::deep (псевдо-комбинатор проникновения), который позволяет стилям с изоляцией влиять на дочерние элементы компонента.

`::deep` как-бы говорит компилятору Blazor: "добавь изолирующий атрибут к селектору слева от меня, но применяй правило ко всем потомкам". Таким образом, стиль остаётся изолированным в рамках компонента, но проникает вглубь rendered-дерева Fluent UI.

Мы применить правило ко всем полям сразу без явного класса, что сделает код ещё более лаконичным:

```css
::deep fluent-select,
::deep fluent-text-field,
::deep fluent-text-area {
    width: 100%;
}
```

## Где должны быть определены enum-ы

Ключевая установка на реализацию API при обмене данными между клиентом SPCD и его сервером состоит в том, что всегда, когда это возможно, в качестве идентификатора используется на строка, а число. В этом есть смысл, т.к. такой подход снижает вариантивность и уменьшает вероятность ошибки из-за искажения передаваемых данных (например, буквы в строке могут передаваться в другом регистре).

В SPCD идентификаторы-перечисления определены в папке "Shared.Enums" и выглядят следующим образом:

```csharp
public enum DeviceType
{
    [Description("Default")] Default,
    [Description("Счетчик")] Counter,
    [Description("Счетчик-сортировщик")] CounterSorter,
    [Description("Просмотровый детектор")] ViewingDetector,
    [Description("Автоматический детектор")] AutomaticDetector,
    [Description("Вакуумный упаковщик")] VacuumPacker,   
    [Description("Прочее")] Other
}
```

[Description] — это атрибут .NET, который позволяет добавить человеко‑читаемое описание к элементу перечисления (enum). Он принадлежит пространству имён `System.ComponentModel`.

Для получения значения по enum-у, необходимо использовать _reflection_ и метод-расширение:

```csharp
using System;
using System.ComponentModel;
using System.Reflection;

public static class EnumExtensions
{
    public static string GetDescription(this Enum value)
    {
        var fieldInfo = value.GetType().GetField(value.ToString());
        var descriptionAttribute = (DescriptionAttribute)Attribute.GetCustomAttribute(
            fieldInfo, typeof(DescriptionAttribute));

        return descriptionAttribute?.Description ?? value.ToString();
    }
}
```

Пример использования:

```csharp
DeviceType device = DeviceType.Counter;
string description = device.GetDescription(); // Вернёт «Счётчик»
Console.WriteLine(description);
```

Непосредственно в коде SPCD значение атрибута Description определено в файле "\ServicePartners\Controllers\Logic\Extensions\Filtration.cs":

```csharp
static TEnum GetEnumValueByDescriptionOrName<TEnum>(string description) where TEnum : struct, Enum
{
    ArgumentNullException.ThrowIfNull(description);

    var fields = typeof(TEnum).GetFields(BindingFlags.Public | BindingFlags.Static);

    foreach (var field in fields)
    {
        var attribute = field.GetCustomAttribute<DescriptionAttribute>();
        if ((attribute != null && attribute.Description == description) || field.Name == description)
            return (TEnum)field.GetValue(null)!;
    }
    throw new ArgumentException($"Value not found: {description}", nameof(description));
}
```

Однако, из-за использования _reflection_, использование атрибута Description - это бескомпромисный выбор в пользу читаемости и надёжности, но за счёт эффективности и производительности.

## Подключение API

Для отладки API может быть сгенерирован отдельные проект в Visual Studio, с использованием шаблона "ASP.NET Core Web API".

Поскольку в SPCD используются контроллеры, то обойтись минималистичным API не удасться.

Поскольку на первом этапе необходимо только проверить корректность указанных серийных номеров, достаточно добавить Endpoint с Http Verb GET в файл "\Controllers\RUFController.cs":

```csharp
using Microsoft.AspNetCore.Mvc;

namespace TestAPI.Controllers
{
    [ApiController]
    [Route("ruf")]
    public class RUFController : ControllerBase
    {
        private readonly ILogger<RUFController> _logger;

        public RUFController(ILogger<RUFController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "CheckUpgradability")]
        public IEnumerable<string> Get()
        {
            return ["Хорошо", "Прекрасно"];
        }
    }
}
```

В пояснении нуждается атрибут Route. Если для доступа к контроллеру мы хотим использовать точно указанное имя, то достаточно его указать в качестве параметра:

```csharp
[Route("ruf")]
```

Если мы хотим, чтобы приложение само извлекало имя контроллера из имени класса, то мы могли бы написать следующую строку:

```csharp
[Route("[controller]")]
```

Благодаря того, что шаблон приложения добавил поддержку Swagger, нам не нужно внешнее приложение (например, Postman) для проверки работоспособности Endpoint.

### Совместимость с подходами SPCD

В SPCD запросы и ответы передаются как JSON-документы. Для описания структуры таких документов соответствующие классы создаются в папках "\Shared\Request" и "\Shared\Response".

Для того, чтобы передать на сервер JSON-документ, нам потребуется использовать POST-запрос.

Описание структуры запроса на сервер может выглядеть следующим образом:

```csharp
namespace Shared.Request;

public class CheckUpgradabilityRequest
{
    public required string ProductModel { get; set; }

    public string? Modification { get; set; }

    public required string SerialNumbers { get; set; }
}
```

Описание ответа сервера предполагает, что часть серийных номеров может быть не найдена, или могут быть коллизии. По этой причине ответ не может быть ограничен только флагом успеха/неудачи:

```csharp
namespace Shared.Response;

public class DeviceIssue
{
    public required string SerialNumber { get; set; }
    public required string Description { get; set; }
}

public class CheckUpgradabilityResponse
{
    public bool Success { get; set; }

    public List<DeviceIssue>? DeviceIssues { get; set; }
}
```

Модифицированный контроллер для обработки запросов выглядит следующим образом:

```csharp
using Microsoft.AspNetCore.Mvc;
using Shared.Request;
using Shared.Response;

namespace TestAPI.Controllers
{
    [ApiController]
    [Route("ruf")]
    public class RUFController : ControllerBase
    {
        private readonly ILogger<RUFController> _logger;

        public RUFController(ILogger<RUFController> logger)
        {
            _logger = logger;
        }

        [HttpPost(Name = "CheckUpgradability")]
        public CheckUpgradabilityResponse Post([FromBody] CheckUpgradabilityRequest req)
        {
            return new CheckUpgradabilityResponse
            {
                Success = true,
                DeviceIssues = null
            };
        }
    }
}
```

>Экспериментально: конкретное имя в атрибуте HttpPost особенного значения не имеет. Но его наличие влияет на Swagger.

Для того, чтобы попасть в контроллер, достаточно выполнить POST запрос по адресу https://localhost:7146/ruf с указанием JSON в Body:

```json
{
  "productModel": "string",
  "modification": "string",
  "serialNumbers": "string"
}
```

## Проблемы CORS

Если было создано два разных приложения (Blazor Web Assembly и ASP.NET Web API), то они запустяться на разных портах и при попытке их взаимодействия бразуер заблокирует операцию из-за CORS. Увидеть это можно в Developer Console F12.

В SPCD такая проблема не возникнет, т.к. решение сконфигурировано таким образом, что оба проекта запускаются на одном порту.

Для отладки кода, можно отключить CORS на сервере ASP.NET Core. Для этого сначала нужно определить политику, которая отключает CORS:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

А затем применить её в системе:

```csharp
app.UseCors("AllowAll");
```

В данном случае, "AllowAll" - это имя политике, что предполагает, что политик в одном приложении может быть много.

>Конечно же, нельзя ни в коем случае отключать CORS в промышленном приложении. Однако в промышленном приложении используются честные, полноценные сертификаты. В случае, если приложение запускается на localhost, настроить сколько-нибудь правильную политику CORS нельзя - именно по этой причине, при локальной отладке и используется полное отключение CORS.

## Доступ на Web API из приложения Blazor Web Assembly

Начать следует с добавления внедряемого сервиса HttpClient в "Program.cs":

```csharp
builder.Services
    //.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) })
    .AddScoped(sp => new HttpClient { BaseAddress = new Uri("https://localhost:7146/") })
    .AddFluentUIComponents();
```

В приведённом выше примере я явно указываю на то, что сервер запущен на той же самой машине, на конкретном порту - 7146.

Если бы нам было нужно работать с несколькими разными API, то это можно было бы сделать приблизительно так:

```csharp
builder.Services.AddHttpClient("FirstApi", client =>
{
    client.BaseAddress = new Uri("https://api1.example.com/");
});

builder.Services.AddHttpClient("SecondApi", client =>
{
    client.BaseAddress = new Uri("https://api2.example.com/");
});
```

Для того, чтобы внедрить зависимость на конкретной Razor-странице, достаточно добавить в её начале следующую директиву:

```csharp
@inject HttpClient HttpClient
```

После этого мы можем выполнять запросы к API. Следует заменить, что поскольку мы настроили HttpClient на конкретный адрес (IP-порт), а Http Verb мы указыаем в вызове (PostAsJsonAsync), то в конкретном запросе нам достаточно просто указать имя контроллера:

```csharp
var request = new Shared.Request.CheckUpgradabilityRequest
{
    ProductModel = upgradabilityParams.ProductModel,
    Modification = upgradabilityParams.Modification,
    SerialNumbers = upgradabilityParams.SerialNumber
};

var response = await HttpClient.PostAsJsonAsync("ruf", request);
var json = await response.Content.ReadFromJsonAsync<CheckUpgradabilityResponse>();
// ...
```

## Как http-взаимодействие реализовано в SPCD

В папке верхнего уровня "SDK" находится файл "Backend.cs", в котором внутри класса Backend помещаются все разработанные API, например: AuditLogAPI, LandingApi, MailingsApi.

Типовой запрос выглядит следующим образом:

```csharp
public async Task<List<string>> DevicesWithoutUsers(List<string> request)
{
    var result = await http.PostAsJsonAsync("Mailings/DevicesWithoutUsers", request);
    return await result.Content.ReadFromJsonAsync<List<string>>()
        ?? throw new InvalidOperationException($"{await result.Content.ReadAsStringAsync()}");
}
```

Или так:

```csharp
public async Task CreateMailings(CreateMailingsRequest createRequest)
{
    var result = await http.PostAsJsonAsync("Mailings/CreateMailings", createRequest);
    if (result.StatusCode == System.Net.HttpStatusCode.BadRequest)
        throw new InvalidOperationException(await result.Content.ReadAsStringAsync());
    result.EnsureSuccessStatusCode();
}
```

К сожалению, обработка ошибок, практически, отсутствует. Это приводит к тому, что при сбое, в нижней части экрана появляется окно с сообщением о возникшей ошибке и кнопки "Reload". Детальная информация о сбое может быть отображена в Developer Console F12.

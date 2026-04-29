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

Для использования CSS-изоляции в Blazor нужно создать файл стилей с тем же именем, что и компонент, но с расширением ".razor.css." Blazor автоматически применит к элементам уникальный атрибут b-xxxxxxxx, обеспечивая изоляцию стилей.

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

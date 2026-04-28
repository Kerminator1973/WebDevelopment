# Использование модальных диалогов в FluentUI

Для работы диалога нужно создать:

- модель с описанием полей диалога - это обычный POCO
- razor-файл с описанием диалога
- компонент, который управляет диалогом

## Модель

Пример файла "SimplePerson.cs", используемый в диалоге для ввода фамилии, имени и возраста некоторого человека:

```csharp
namespace SelectModel.Models
{
    public class SimplePerson
    {
        public string? Firstname { get; set; }
        public string? Lastname { get; set; }
        public int Age { get; set; }
    }
}
```

>Поскольку в проекте может быть много "моделей", для улучшения навигации в проекте рекомендуется использовать имя папки "UIModels" для модальных диалогов, форм, и т.д.

## Файл с описанием диалога

Пример файла "SimpleDialog.razor":

```csharp
@using Microsoft.Fast.Components.FluentUI
@using SelectModel.Models
@implements IDialogContentComponent<SimplePerson>

<FluentMessageBarProvider Section="My First Dialog" MaxMessageCount="1" />

<p>Your lastname is @Content.Lastname and you are @Content.Age years young </p>

<FluentTextField @bind-Value="@Content.Firstname">Your firstname:</FluentTextField>
<FluentTextField @bind-Value="@Content.Lastname">Your lastname:</FluentTextField>
<FluentNumberField @bind-Value="@Content.Age">Your age:</FluentNumberField>

@if (Dialog != null)
{
    <FluentStack Orientation="Orientation.Vertical" Style="border: 1px solid red; padding: 10px">
        <span>This section is visible only when component is hosted inside a Dialog</span>
        <FluentButton OnClick="@(() => ToggleDialogPrimaryActionButton(true))">Enable Dialog Primary Action</FluentButton>
        <FluentButton OnClick="@(() => ToggleDialogPrimaryActionButton(false))">Disable Dialog Primary Action</FluentButton>
    </FluentStack>
}

@code {
    [Parameter]
    public SimplePerson Content { get; set; } = default!;

    [CascadingParameter]
    public FluentDialog? Dialog { get; set; }

    private void ToggleDialogPrimaryActionButton(bool enable)
    {
        Dialog!.TogglePrimaryActionButton(enable);
    }
}
```

Необходимо явно указать, что данный компонент реализует интерфейс IDialogContentComponent со специализацией модели - в конкретном случае это SimplePerson:

```csharp
@implements IDialogContentComponent<SimplePerson>
```

Верстка самого диалога типовая - используется FluentButton, FluentStack, FluentTextField, и т.д. Привязка полей осуществляется с использованием параметра передаваемого из внешнего кода, см.:

```csharp
[Parameter]
public SimplePerson Content { get; set; } = default!;
```

Пока не очень понятно зачем используется **CascadingParameter** в определении диалога:

```csharp
[CascadingParameter]
public FluentDialog? Dialog { get; set; }
```

Заметим, что настройка параметров поведения диалога, в том числе - начальное состояние PrimaryActionButton, осуществляется внешним компонентом.

### Валидация данных в форме

Для управления вводом данных может быть использован атрибутированный код (в описании модели):

```cpp
using System.ComponentModel.DataAnnotations;

public class UserModalViewModel
{
    [Display(Name = "Имя")]
    [Required(ErrorMessage = "Имя обязательно")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "От 2 до 50 символов")]
    public string Name { get; set; } = string.Empty;
```

В верстку модального диалога необходимо явно добавить элементы, имеющие отношение к валидации:

```csharp
<EditForm Model="@Content" OnValidSubmit="HandleValidSubmit">
    <DataAnnotationsValidator />

    <FluentDialogHeader>Проверка возможности обновления</FluentDialogHeader>
    <ValidationMessage />

    <FluentDialogBody Class="w-auto">
        <FluentTextField @bind-Value="Content.ProductName">Product name:</FluentTextField>
        <ValidationMessage For="@(() => Content.ProductName)" />

        <FluentTextField @bind-Value="Content.SerialNumber">Serial number:</FluentTextField>
        <ValidationMessage For="@(() => Content.SerialNumber)" />
    </FluentDialogBody>

    <FluentDialogFooter Class="d-flex justify-content-between">
        <FluentButton Type="ButtonType.Submit">Проверить</FluentButton>
        <FluentButton Type="ButtonType.Button" @onclick="CloseDialog">Закрыть</FluentButton>
    </FluentDialogFooter>
</EditForm>
```

Во-первых, необходимо обернуть форму в **EditForm**. Также критичным является добавление в модальный диалог валидатор на базе аннотированных данных: `<DataAnnotationsValidator />`

Во-вторых необходимо определиться с версткой сообщений об ошибках. Может быть использован один, общий на всех элемент:

```csharp
<ValidationSummary />
```

В качестве альтернативы, для каждого поля можно добавить поле к описанием ошибки. Для этого используется компонент `<ValidationMessage />`, в каждом экземпляре которого указывается имя поля, для которого следует выводить сообщение об ошибке:

```csharp
<FluentTextField @bind-Value="Content.ProductName">Product name:</FluentTextField>
<ValidationMessage For="@(() => Content.ProductName)" />

<FluentTextField @bind-Value="Content.SerialNumber">Serial number:</FluentTextField>
<ValidationMessage For="@(() => Content.SerialNumber)" />
```

Замечу, что тип кнопки "Submit" должен быть обязательно указан вот так: `Type="ButtonType.Submit"`

Область кода:

```csharp
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

Отдельного разъяснения заслуживают следующие строки кода:

```csharp
[Parameter] public UpgradabilityParams Content { get; set; } = new();
[CascadingParameter] public FluentDialog Dialog { get; set; } = default!;
```

Используя атрибут `[Parameter]` мы указываем на то, что родительский компонент должен задать значение компонента явным образом. В случае модального диалога слово "явно" не очень подходит, но тем не менее:

```csharp
UpgradabilityParams upgradabilityParams = new() {};

private async void CheckDeviceUpgradability()
{
    // ...
    var dialog = await DialogService.ShowDialogAsync<UpgradabilityParamsDialog>(
        upgradabilityParams, 
        parameters
    );
    DialogResult? result = await dialog.Result;
```

Атрибут `[CascadingParameter]` означает, что этот параметр тоже приходит к нам откуда-то, но не явным образом, сверху по дереву компонентов через CascadingValue.

В случае FluentDialog объект диалога обычно предоставляется инфраструктурой диалогов автоматически, поэтому его не нужно писать его вручную в каждом месте. То есть:

- не передаётся как атрибут компонента
- доступен всем вложенным компонентам в пределах области каскада
- удобен для "контекстных" объектов (тема, локализация, текущий диалог, EditContext и т.п.)

>Для работы с кодом необходимо развить специализированные навыки поиска информации. Например, представим, что нас интересует следующий код:
>
>```csharp
var dialogInstance = await DialogService.ShowDialogAsync<ModalFeedbackForm>(new DialogParameters()
>```
>
>Если мы выполним поиск по содержимому файлов, то мы не найдём упоминаний класса ModalFeedbackForm, т.к. в явном виде в коде он отсутствует. ModalFeedbackForm - является ссылкой на имя файла "ModalFeedbackForm.razor", который находится по пути: `\ServicePartners.Client\Components\Header\ModalFeedbackForm.razor`.
>
>Подобная особенность вообще свойственная FrontEnd-инструментам, в которых используется компонентная модель.

## Создание диалога

Внешний код, который использует диалог, может выглядеть следующим образом:

```csharp
@inject IDialogService DialogService

@* Добавляем provider, без определения которого диалоги работать не будут *@
<FluentDialogProvider />
<FluentButton Appearance="@Appearance.Accent" @onclick=OnShowModalAsync>Show Modal</FluentButton>

@code {

    private bool _trapFocus = true;
    private bool _modal = true;

    SimplePerson simplePerson = new()
    {
        Firstname = "Dan",
        Lastname = "Sanderson",
        Age = 42,
    };

    private async void OnShowModalAsync()
    {
        DialogParameters parameters = new()
        {
            Title = $"Hello {simplePerson.Firstname}",
            PrimaryAction = "Yes",
            PrimaryActionEnabled = false,
            SecondaryAction = "No",
            Width = "500px",
            TrapFocus = _trapFocus,
            Modal = _modal,
            PreventScroll = true
        };

        var dialog = await DialogService.ShowDialogAsync<SimpleDialog>(simplePerson, parameters);
        DialogResult? result = await dialog.Result;
    }
}
```

Всё начинается с внедрения сервиса IDialogService:

```csharp
@inject IDialogService DialogService
```

Далее обязательно должен быть определён **FluentDialogProvider**, без которого приложение не будет работать полноценно:

```csharp
<FluentDialogProvider />
```

Далее создаются данные модели для передачи в диалог:

```csharp
SimplePerson simplePerson = new()
{
    Firstname = "Dan",
    Lastname = "Sanderson",
    Age = 42,
};
```

Настраиваются параметры диалога:

```csharp
DialogParameters parameters = new()
{
    Title = $"Hello {simplePerson.Firstname}",
    PrimaryAction = "Yes",
    PrimaryActionEnabled = false,
    SecondaryAction = "No",
    Width = "500px",
    TrapFocus = _trapFocus,
    Modal = _modal,
    PreventScroll = true
};
```

Непосредственное открытие диалога выглядит следующим образом:

```csharp
var dialog = await DialogService.ShowDialogAsync<SimpleDialog>(simplePerson, parameters);
DialogResult? result = await dialog.Result;
```

Если нам нужно сбрасывать значения полей при каждом открытии диалога, то сделать это нужно перед вызовом ShowDialogAsync().

## Кастомизация диалога

При создании разметки (rendering), **DialogService** анализирует как набор параметров (DialogParameters), так и фактическую верстку диалога (в нашем случае - верстку компонента SimpleDialog). Если в вертке нет блока `<FluentDialogFooter />`, то DialogService сформирует его. При формировании будут учитываться указанные значения из DialogParameters. Так, например, если в DialogParameters будет указано свойство "PrimaryAction" со значением "Yes", то текст на главной кнопке в Footer-е будет "Yes", а если этого параметра не будет, то будет сгенерирован текст "OK".

Однако если нам нужен ещё более высокий уровень кастомизации, в частности - изменение стилистического оформления, то мы можем определить в верстке целые блоки, которые будут использованы в верстке вместо сегенарированных DialogService. Например, в footer-е есть две кнопки: OK и Cancel, которые мы можем определить в верстке SimpleDialog вот так:

```csharp
<FluentDialogFooter>
    <FluentButton Appearance="Appearance.Accent" OnClick="@SaveAsync">Принять с благодарностью</FluentButton>
    <FluentButton Appearance="Appearance.Accent" OnClick="@CancelAsync">Раздражённо отказаться</FluentButton>
</FluentDialogFooter>
```

К этим кнопкам мы можем применить нужные нам стили. Также мы можем добавить специализированный код, в частности, реакцию на нажатие этих кнопок:

```csharp
private async Task SaveAsync()
{
    await Dialog!.CloseAsync();
}

private async Task CancelAsync()
{
    await Dialog!.CancelAsync();
}
```

Первая кнопка будет закрыта с кодом завершения диалога OK, а вторая вернёт `result.Cancelled`.

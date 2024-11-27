# Использование модальных диалого в FluentUI

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

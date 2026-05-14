# Переход от модального окна в компоненту формы (Fluent UI)

В форме использующей модальные диалоги необходимо явным образом указывать компонент организации такого диалога - FluentDialogProvider:

```csharp
@* Добавляем provider, без определения которого диалоги работать не будут *@
<FluentDialogProvider />
```

Вызов модального диалога осуществляется явным образом и выглядит приблизительно так:

```csharp
DialogParameters parameters = new()
{
    PrimaryAction = "Yes",
    PrimaryActionEnabled = false,
    SecondaryAction = "No",
    Width = "800px",
    TrapFocus = true,
    Modal = true,
    PreventScroll = true,
};

var dialog = await DialogService.ShowDialogAsync<Components.UpdateCheckDialog>(
    lookupParams,
    parameters
);

DialogResult? result = await dialog.Result;
if (result.Cancelled) break;
```

При использовании компонента необходимо лишь корректно указать параметры:

```csharp
<UpdateCheckDialog 
    Content="currentParams"
    OnResult="HandleDeviceResult" />

@code {

    private DeviceLookupParams currentParams = new();

    private void HandleDeviceResult(DeviceLookupParams result)
    {
        // Обработать выбранное устройство

    }
}
```

## Реализация модального диалога

Указание модели данных осуществляется посредством директивы `@implements`:

```csharp
@implements IDialogContentComponent<DeviceLookupParams> // DeviceLookupParams - это модель данных
```

Типовая верстка:

```csharp
<EditForm Model="@Content" OnValidSubmit="@HandleValidSubmit">
    <FluentDialogBody>
        @* Какие-то органы управления *@
    </FluentDialogBody>
    <FluentDialogFooter Class="d-flex justify-content-between">
        <FluentButton Type="ButtonType.Submit">Далее</FluentButton>
        <FluentButton Type="ButtonType.Button" @onclick="CloseDialog">Отмена</FluentButton>
    </FluentDialogFooter>
</EditForm>    
```

Для использования модального диалога необходимо использовать каскадный параметр FluentDialog:

```csharp
@code {
    [Parameter] public DeviceLookupParams Content { get; set; } = new();

    [CascadingParameter] public FluentDialog Dialog { get; set; } = default!;
```

Закрывать диалог следует явным образом, передавая странице результтат, используя `Dialog.CloseAsync()`:

```csharp
private async Task HandleValidSubmit()
{
    // ... Формируем Content
    await Dialog.CloseAsync(Content);
}

private async Task CloseDialog()
{
    await Dialog.CloseAsync(DialogResult.Cancel());
}
```

## Компонент-форма

В случае использования компонента-формы имеет смысл передавать через параметры инициализационные данные, а также предоставить callback-функцию через EventCallback<>:

```csharp
@code {
    [Parameter] public DeviceLookupParams Content { get; set; } = new();
    [Parameter] public EventCallback<DeviceLookupParams> OnResult { get; set; }
```

При нажатии на кнопку "Submit" мы просто вызываем callback-метод родительского класса. Дальнейшую судьбу формы определит родительская страница:

```csharp
private async Task HandleValidSubmit()
{
    // ... Формируем Content
    await OnResult.InvokeAsync(Content);
}
```

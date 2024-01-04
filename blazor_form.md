# Использование форм в Blazor

В классическом веб-приложении форма определяеться с помощью элемента `<form>`. Blazor расширяет возможности форм с помощью компонента `<EditForm>`.

Рекомендуется ознакомиться [со статьёй](https://learn.microsoft.com/ru-ru/training/modules/blazor-improve-how-forms-work/4-take-advantage-power-blazor-forms) по использованию EditForm в Blazor.

**EditForm** поддерживает привязку данных. Так, например, мы можем определить модель в файле "WebApplication.Date":

```csharp
public class WeatherForecast
{
    public DateTime Date { get; set; }

    public int TemperatureC { get; set; }

    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);

    public string Summary { get; set; }
}
```
 
А затем использовать экземпляр модели при определении формы:

```csharp
@using WebApplication.Data

<EditForm Model=@currentForecast>
    <InputDate @bind-Value=currentForecast.Date></InputDate>
    <InputNumber @bind-Value=currentForecast.TemperatureC></InputNumber>
    <InputText @bind-Value=currentForecast.Summary></InputText>
</EditForm>

@code {
    private WeatherForecast currentForecast;
```

**Элемент EditForm обеспечивает двустороннюю привязку данных!**

Типы органов управления формы похожи на используемые в form, но требуют специализации типа данных, вводимых в органе управления: InputDate<TValue>, InputNumber<TValue>, InputSelect<TValue>.

Параметры валидации в EditForm более развитые, чем в классическом HTML 5:

```csharp
<EditForm Model=@currentForecast>
    <InputNumber @bind-Value=currentForecast.TemperatureC width="5" min="-100" step="5"></InputNumber>
</EditForm>
```

## Обработка события отправки формы

EditForm реализует три события, которые выполняются при отправке: OnValidSubmit, OnInvalidSubmit и OnSubmit.

Если необходимо реализовать комплексную проверку поля ввода, то следует рассмотреть возможность использования события **OnSubmit**. Пример валидации:

```csharp
<EditForm Model="@shirt" OnSubmit="ValidateData">
    <!-- Omitted for brevity -->
    <input type="submit" class="btn btn-primary" value="Save"/>
    <p></p>
    <div>@Message</div>
</EditForm>

@code {
    private string Message = String.Empty;

    // Omitted for brevity

    private async Task ValidateData(EditContext editContext)
    {
        if (editContext.Model is not Shirt shirt)
        {
            Message = "T-Shirt object is invalid";
            return;
        }

        if (shirt is { Color: ShirtColor.Red, Size: ShirtSize.ExtraLarge })
        {
            Message = "Red T-Shirts not available in Extra Large size";
            return;
        }

        if (shirt is { Color: ShirtColor.Blue, Size: <= ShirtSize.Medium)
        {
            Message = "Blue T-Shirts not available in Small or Medium sizes";
            return;
        }

        if (shirt is { Color: ShirtColor.White, Price: > 50 })
        {
            Message = "White T-Shirts must be priced at 50 or lower";
            return;
        }

        // Data is valid
        // Save the data
        Message = "Changes saved";
    }
}
```

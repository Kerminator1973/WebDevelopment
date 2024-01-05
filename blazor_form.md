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

В типовом случае, при получении события OnValidSubmit выполняются следующие действия:

- используя HttpClient отправляется сообщение на сервер
- выполняется внутренний переход в приложении на следующую формы (например, на форму подтверждения оплаты)

При получении события OnInvalidSubmit часто активируется блок верстки информирующий о наличии ошибок при заполнении формы.

Следует заметить, что если используется обработчик OnSubmit, то события OnValidSubmit и OnInvalidSubmit не будут приходить в программный код. Однако, вместо этого можно использовать параметр **EditContext**. Например:

```csharp
<EditForm Model="@pizza" OnSubmit=@HandleSubmission>
...
@code {
    void HandleSubmission(EditContext context)
    {
        bool dataIsValid = context.Validate();
        if (dataIsValid)
        {
            // Store valid data here
        }
    }
}
```

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

В Blazor часто в качестве стилистического оформления используется Bootstrap.

## Блокировка кнопки на время отправки заказа на сервер

Часто используется следующий подход:

```csharp
<div class="main">
    <EditForm Model=Order.DeliveryAddress OnSubmit=CheckSubmission>
        <button class="checkout-button btn btn-warning" disabled=@isSubmitting>
            Place order
        </button>
    </EditForm>
</div>

@code {
    private async Task CheckSubmission()
    {
        isSubmitting = true;
        await PlaceOrder();
        isSubmitting = false;
    }    
}
```

## Пример оформления сообщения об ошибке

Для информирования об ошибке может быть использован следующий код:

```csharp
<div class="checkout-delivery-address">
    <h4>Deliver to...</h4>
    @if (isError) {
        <div class="alert alert-danger">Please enter a name and address.</div>
    }
    <AddressEditor Address="Order.DeliveryAddress" />
</div>
```

## Использование DataAnnotationsValidator для проверки полей формы

**DataAnnotations** в Blazor может использоваться также, как и в ASP.NET Core:

```csharp
using  System.ComponentModel.DataAnnotations;

public class Pizza
{
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; }
    
    public string Description { get; set; }
    
    [EmailAddress]
    public string ChefEmail { get; set;}
    
    [Required]
    [Range(10.00, 25.00)]
    public decimal Price { get; set; }
}
```

Список дополнительных атрибутов валидации доступен в [статье](https://learn.microsoft.com/ru-ru/training/modules/blazor-improve-how-forms-work/6-validate-user-input-implicitly). Также рекомендуется для ознакомления [статья](https://learn.microsoft.com/ru-ru/training/modules/blazor-improve-how-forms-work/7-exercise-add-server-client-side-data-validation-address-form)

Для того, чтобы _неявная_ валидация работала, следует добавить дополнительные тэги (DataAnnotationsValidator, ValidationSummary и ValidationMessage) в верстку:

```csharp
@page "/admin/createpizza"

<h1>Add a new pizza</h1>

<EditForm Model="@pizza">
    <DataAnnotationsValidator />
    <ValidationSummary />
    
    <InputText id="name" @bind-Value="pizza.Name" />
    <ValidationMessage For="@(() => pizza.Name)" />
    
    <InputText id="description" @bind-Value="pizza.Description" />
    
    <InputText id="chefemail" @bind-Value="pizza.ChefEmail" />
    <ValidationMessage For="@(() => pizza.ChefEmail)" />
    
    <InputNumber id="price" @bind-Value="pizza.Price" />
    <ValidationMessage For="@(() => pizza.Price)" />
</EditForm>

@code {
    private Pizza pizza = new();
}
```

Настроить сообщения об ошибках можно в описании модели:

```csharp
public class Pizza
{
    public int Id { get; set; }
    
    [Required(ErrorMessage = "You must set a name for your pizza.")]
    public string Name { get; set; }
    
    public string Description { get; set; }
    
    [EmailAddress(ErrorMessage = "You must set a valid email address for the chef responsible for the pizza recipe.")]
    public string ChefEmail { get; set;}
    
    [Required]
    [Range(10.00, 25.00, ErrorMessage = "You must set a price between $10 and $25.")]
    public decimal Price { get; set; }
}
```

Можно реализовать свои собственные правила валидации, разработав класс, производный от **ValidationAttribute**:

```csharp
public class PizzaBase : ValidationAttribute
{
    public string GetErrorMessage() => $"Sorry, that's not a valid pizza base.";

    protected override ValidationResult IsValid(
        object value, ValidationContext validationContext)
    {
        if (value != "Tomato" || value != "Pesto")
        {
            return new ValidationResult(GetErrorMessage());
        }

        return ValidationResult.Success;
    }
}
```

Использовать валидатор можно в описании модели:

```csharp
public class Pizza
{
    // ...

    [PizzaBase]
    public string Base { get; set; }
}
```

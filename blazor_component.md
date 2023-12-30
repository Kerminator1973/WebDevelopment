# Создание компонентов в Blazor

Для ссздания компонента в Blazor достаточно создать некоторую папку (рекомендуется - "Components") и создать в папке файл с разрешением ".razor". В этом файле может быть определена как разметка, так и методы с атрибутами. Например:

```csharp
<h2>New Pizza: @PizzaName</h2>
<p>@PizzaDescription</p>

@code {
    [Parameter]
    public string PizzaName { get; set; }

    [Parameter]
    public string PizzaDescription { get; set; } = "The best pizza you've ever tasted.";
}
```

В приведённом выше примере определено два дочерних свойства компонента: PizzaName и PizzaDescription. Эти свойства может устанавливать родительский компонент.

Мы можем задавать значения по умолчанию, это сделано для атрибута PizzaDescription.

Если мы хотим использовать этот компонент, то мы можем указать _a fully qualified name_ компонента и набор атрибутов. Например:

```csharp
<BlazorWasmApp.Components.Pizza PizzaName="123" PizzaDescription="The cool pizza" />
```

Чтобы не указывать полное имя компонента, следует использовать директиву `@using`:

```csharp
@using BlazorWasmApp.Components;
...
<Pizza PizzaName="123" PizzaDescription="The cool pizza" />
```

## Использование класса с атрибутами для передачи параметров компонентов

Также можно определить класс с атрибутами и использовать их в рамках компонентной модели:

```csharp
public class PizzaTopping
{
    public string Name { get; set; }
    public string Ingredients { get; set; }
}
```

Пример использования:

```csharp
<h2>New Topping: @Topping.Name</h2>

<p>Ingredients: @Topping.Ingredients</p>

@code {
    [Parameter]
    public PizzaTopping Topping { get; set; }
}
```

В родительном классе передача параметров может выглядеть следующим образом:

```csharp
@page "/pizzas-toppings"

<h1>Our Latest Pizzas and Topping</h1>

<Pizza PizzaName="Hawaiian" PizzaDescription="The one with pineapple" />

<PizzaTopping Topping="@(new PizzaTopping() { Name = "Chilli Sauce", Ingredients = "Three kinds of chilli." })" />
```

## Каскадные параметры

В Blazor существует возможность передать значение параметра не конкретному дочернему компоненту, а вниз, по всей иерархии от родительского ко всем вложенным дочерним компонентам. Этот механизм называется **Каскадные параметры**.

В родительском компоненте добавляется специальный тэг `CascadingValue`, который указывает, что некоторые параметры следует передать всем дочерним элементам по всех их иерархии. Например:

```csharp
@page "/specialoffers"

<h1>Special Offers</h1>

<CascadingValue Name="DealName" Value="Throwback Thursday">
    <!-- Любой дочерний компонент, не смотря на его уровень вложенности получит этот параметр -->
</CascadingValue>
```

Чтобы компонент получил такой параметр, следует определить специальный атрибут:

```csharp
<h2>Deal: @DealName</h2>

@code {
    [CascadingParameter(Name="DealName")]
    private string DealName { get; set; }
}
```

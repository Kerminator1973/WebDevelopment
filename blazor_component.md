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

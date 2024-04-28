# Синтаксический сахар в C\#

В этом документе описываются синтаксические конструкции, которые я редко использовал в своем коде, но хотел бы использовать чаще.

## Init-only properties (C\# 10)

Ключевое слово **readonly** позволяет указать на свойство, которое может быть установлено только при инициализации объекта в конструкторе. Ключевое слово **init** используется точно для таких же целей, но применяется к свойству:

```csharp
public class ImmutablePerson
{
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
}
```

Пример использования:

```csharp
ImmutablePerson max = new()
{
    FirstName = "Max",
    LastName = "Rozhkov"
};  // Корректно

max.FirstName = "Olga"; // Компилятор выдаст сообщение об ошибке
```

## Mutated copy of an object (C\# 9)

Предположим, что мы определили следующую структуру (**record**) и создали экземпляр этой записи:

```csharp
public record ImmutableVehicle
{
    public int? Wheels { get; init; }
    public string? Color { get; init; }
    public string? Brand { get; init; }
}

ImmutableVehicle car = new()
{
    Brand = "Lada Kalina",
    Color = "Black Russian",
    Wheels = 4
}
```

Если нам нужен похожий объект, но в котором изменена только часть полей, мы можем создать копию с частично изменёнными данными:

```csharp
ImmutableVehicle repaintedCart = car with { Color = "Metallic Red" };
```

## Deconstruct record

Предположим, что у нас есть запись (record) определённая следующим образом:

```csharp
public record ImmutableAnimal(string Name, string Species);
```

C\# автоматически сгенерирует для нас конструктор и деконструктор, так, что можно "из коробки" использовать следующий код:

```csharp
ImmutableAnimal link = new("Link", "Dachshund");
var (who, what) = oscar;    // Здесь будет вызван Deconstruct method
```

**Deconstruct method** работает следующим образом:

```csharp
public void Deconstruct(out string name, out string species)
{
    name = Name;
    species = Species;
}
```

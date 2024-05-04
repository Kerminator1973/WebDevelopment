# Синтаксический сахар в C\#

В этом документе описываются синтаксические конструкции, которые я редко использовал в своем коде, но хотел бы использовать чаще. Так же в документе описываются термины, применяемые при разработке кода на C\#, не привычные к использованию в других языках программирования.

## Термины

В C\# методы могут быть **static** и **instance**. **Instance method** - это метод, который может быть вызван у конкретного экземляра класса. **Static method** - это метод, который может быть вызван без создания экземпляра класса.

## Switch Expression (C\# 9)

Простой вариант реализации switch expression:

```csharp
public static Orientation ToOrientation(Direction direction) => direction switch
{
    Direction.Up    => Orientation.North,
    Direction.Right => Orientation.East,
    Direction.Down  => Orientation.South,
    Direction.Left  => Orientation.West,
    _ => throw new ArgumentOutOfRangeException(nameof(direction), $"Not expected direction value: {direction}"),
};
```

Также могут быть использованы т.н. **Case guards**, т.е. дополнительные условия, требующие ключевого слова **when**:

```csharp
public readonly struct Point
{
    public Point(int x, int y) => (X, Y) = (x, y);
    
    public int X { get; }
    public int Y { get; }
}

static Point Transform(Point point) => point switch
{
    { X: 0, Y: 0 }                    => new Point(0, 0),
    { X: var x, Y: var y } when x < y => new Point(x + y, y),
    { X: var x, Y: var y } when x > y => new Point(x - y, y),
    { X: var x, Y: var y }            => new Point(2 * x, 2 * y),
};
```

В C\# 9 механизм switch expression был улучшен, появилась возможность использовать тип, как значение оператора switch, а также использовать вложенные switch:

```csharp
decimal flightCost = passenger switch
{
    FirstClassPassenger p => p.AirMiles switch {
        > 35000 => 1500M,
        > 15000 => 1750M,
        - => 2000M
    },
    BusinessClassPassenger => 1000M,
    CoachClassPassenger p when p.CarryOnKG < 10.0 => 500M,
    CoachClassPassenger => 650M,
    _ => 800M
};
```

## Строгое позиционирование параметров в string.Format()

Пример использования:

```csharp
var value = string.Format("Command is {0}, numer is {1}, active is {2}",
    arg0: command,
    arg1: number,
    arg2: active);
```

Однако, **string interpolation** читается проще.

## Упрощённая декларация пространства имён (C\# 10)

Начиная с C\#10 уже не обязательно вкладывать классы в пространство явным образом - теперь можно делать это не явно. Если раньше мы писали код так:

```csharp
namespace MyNameSpace {
    public class Person {
```

То теперь мы можем не делать лишний отступ, что позволяет читать код легче:

```csharp
namespace MyNameSpace;

public class Person {
```

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

## Deconstruct types

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

## Делегаты (delegates)

Определить сигнатуру вызываемого метода можно следующим образом:

```csharp
delegate int DelegateWithMatchingSignature(string s);
```

Предположим, что в экземпляре некоторого класса (p1) у нас есть метод с такой сигнатурой - MethodIWantToCall(). Создать экземпляр делегата, через который можно вызвать метод конкретного экземпляра классам можно вот так:

```csharp
DelegateWithMatchingSignature d = new(p1.MethodIWantToCall);
```

Соответственно, чтобы вызвать метод класса через _delegate instance_ достаточно написать вот такой код:

```csharp
int answer = d("Frog");
```

Ключевое свойство делегата - встроенная поддержка асинхронный операций, которые выполняются в разных потоках.

### Уменьшить количество определений делегатов

Microsoft уже определила два делегата для использования в качестве событий (Events):

```csharp
public delegate void EventHandler(object? sender, EventArgs e);
public delegate void EventHandler<TEventArgs>(object? sender, TEventArgs e);
```

Когда вы хотите определить событие для свого собственного типа, постарайтесь использовать один из уже предопределённых типов. Например:

```csharp

public event EventHandler? Shout
...
// Вывоз внешнего обработчика события из реализации класса
Shout?.Invoke(this, EventArgs.Empty);
```

Связать обработчик с экземпляром класса можно вот так:

```csharp
harry.Shout += Harry_Shout;
```

## Null-forgiving operator (C\# 8)

Начиная с C\#8 инициализация переменной _ссылочного типа_ (в частности - string) значения null вызывает предупреждение компилятора. Т.е. если написать `string a = null;`, это будет считаться лёгким нарушением синтаксиса. Для того, чтобы компилятор не выводил предупреждение, можно использовать постфиксный оператор !:

```csharp
var person = new Person(null!);
```

Ещё вариант:

```csharp
public DbSet<MyType> MyData { get; set; } = null!;
```

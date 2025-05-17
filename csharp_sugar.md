# Синтаксический сахар в C\#

В этом документе описываются синтаксические конструкции, которые я редко использовал в своем коде, но хотел бы использовать чаще. Так же в документе описываются термины, применяемые при разработке кода на C\#, не привычные к использованию в других языках программирования.

Большинство конструкций описаны в книгах [Марка J. Прайса](https://github.com/markjprice) "C# xx and .NET yy - Modern Cross-Platform Development". Книги серии, однозначно, рекомендуются к прочтению. В [бонусных главах](https://github.com/markjprice/cs10dotnet6/blob/main/9781801077361_Bonus_Content.pdf) содержатся дополнительные материалы по gRPC, MAUI, и т.д.

>14 мая 2025 года, по информации Miguel de Icaza (Gnome, Mono, Xamarin), Microsoft уволила инженеров из проекта Maui. Вероятно, что этот продукт будет закрыт.

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

## Использование using для обязательного вызова Dispose

Мы можем использовать следующую конструкцию:

```csharp
using (Machine a = new()) {
    // Код, который использует экземпляр класса
}
```

Компилятор преобразует эту конструкцию приблизительно в следующий код:

```csharp
Machine a = new();
try
{
    // Код, который использует экземпляр класса
}
finally
{
    if (a != null) a.Dispose();
}
```

## Nullable для простых типов (value types)

В C\# мы можем присвоить null экземпляру простого типа. Например:

```csharp
int? n = null;
```

Этот трюк чаще всего используется, когда нам нужно определить модель в рамках Entity Framework, в которой поле в базе данных должно хранить простой тип, но при этом может быть установлено в NULL.

Начиная с C\# 0 можно использовать следующий синтаксис:

```csharp
if (thisCouldBeNull is not null)
{
```

Ещё один интересный синтаксический сахар - возможность задать в тип пераметра указание на невозможность получения нулевого параметра. Допустим, раньше мы использовали следующий код:

```csharp
public void Hire(Person manager, Person employee)
{
    if (manager == null)
    {
        throw new ArgumentNullException(nameof(manager));
    }
    if (employee == null)
    {
        throw new ArgumentNullException(nameof(employee));
    }
    // ...
}
```

В C\# 11 можно написать более компактную конструкцию, которая заменит приведённые выше две проверки со сбрасыванием исключения:

```csharp
public void Hire(Person manager!!, Person employee!!)
{
    // ...
}
```

## Overriding members

C\# является ООП языков и любой метод класса, определённый как **virtual** может быть перегружен в производном классе:

```csharp
public override string ToString()
{
```

Однако, C\# позволяет заменить и не виртуальный метод. Для этого следует использовать ключевое слово **new**:

```csharp
public new void WriteToConsole()
{
```

Заметим, что эта возможность не относится к типовым подходам и применяется редко. C\# объектно-ориентированный язык и полиморфизм - одно из его основных свойств. Соответственно, на практике чаще всего используются традиционные модификаторы virtual/override.

## Зачем нужен модификатор sealed

Существуют классы оказывающие очень большое влияние на производительность приложений. Пример такого класса - String. Для повышения производительности приложения в целом, такие классы могут быть очень сильно оптимизированы, в том числе, ясность семантики может быть принесена в жертву производительности. Если существует высокая вероятность того, что пользователь может не правильно использовать некоторый класс в качестве базового, можно запретить наследование и используя ключевое слово **sealed**:

```csharp
public sealed class ScroogeMcDuck
{
}
```

## Наследование от класса Exception

При создании своего собесенного класса-исключения рекомендуется наследовать его от класса Exception. Также важно переопределить все три конструктора класса:

```csharp
public class PersonException : Exception
{
    public PersonException() : base() { }

    public PersonException(string message) : base(message) { }

    public PersonException(string message, Exception innerException) : base(message, innerException) { }
}
```

## Extension methods

Пример определения **Extension methods**:

```csharp
public static class StringExtensions 
{
    public static bool IsValidEmail(this string input)
    {
```

## Новые типы данных (BigInteger, DateOnly, TimeOnly)

В современных версиях C\# появился тип данных BigInteger, предназначенный для работы с большими целочисленными значениями. Пример определения переменной:

```csharp
BigInteger bigger = BigInteger.Parse("123456789012345678901234567890");
```

В .NET 6 появились новые типы данных для работы с датой и временем: DateOnly и TimeOnly. Тип **DateOnly** лучше транслируется (mapping) в тип колонки в базах данных. Тип **TimeOnly** хорош для установки alarm-ов и настройки планировщиков.

## Span<T>, Index и Range

Одно из наиболее значимых улучшений в .NET Core 2.1 было появление Span<T>, который позволяет работать с подмножеством строки/массива, без создания дополнительной копии.

В C\# 8 появились две дополнительные сущности, которые позволяют идентифицировать индекс в массиве и диапазон, используя два индекса.

Примеры:

```csharp
Index i1 = new(value:3);    // Третий элемент в списке от начала
Index i2 = 3;               // Тоже самое
```

```csharp
Index i3 = new(value:5, fromEnd: true); // Считаем элемент с конца
Index i4 = ^5;              // Тоже самое
```

```csharp
Range r1 = new(start: new Index(3), end: new Index(7));
Range r2 = new(start: 3, end: 7);   // Используется преобразование из int
Range r3 = 3..7;    // Используется синтаксис C\# 8
Range r4 = Range.StartAt(3);
Range r5 = 3..;
Range r6 = Range.EndAt(3);
Range r7 = ..3;
```

Использование ReadOnlySpan:

```csharp
byte[] w = new byte[] { 0x00, 0x0B };
device1.Write(w);
ReadOnlySpan<byte> ff = device1.ReadTimeout(65, 1000);
```

## Высоко-производительная обработка JSON

В .NET Core 3.0 было представлено новое пространство имён для работы с JSON - **System.Text.Json**, которое реализует обработку JSON с использованием высоко-производительных ASI, таких как `Span<T>`.

Библиотека, которая ранее использовалась с работы с Json - **Newtonsoft Json.NET**, использует  с UTF-16. Однако, более высокая производительность достигается благодаря кодировке UTF-8 (используется по умолчанию в приложениях .NET), поскольку это позволяет избежать дополнительной перекодировки JSON-файлов в Json.NET из Unicode-16 в UTF-8.

По утверждениям Microsoft, в новой реализации - **System.Text.Json**, производительность выше в диапазоне от 1.3x до 5x (в зависимости от сценария).

Автор оригинальной библиотеки Json.NET - **James Newton-King**, присоединился к Microsoft и работает над новыми инструментальными средствами и API для Json. Лучшие черты из Json.NET переносятся в System.Text.Json.

Совет Mark J. Price: "_Выбирайте Json.NET если нужна высокая производительность программистов и большой набор вспомогательных инструментов, но если нужна высокая производительность кода, то выбирайте System.Text.Json_".

Библиотека содержит целый ряд средств для управления генерацией JSON-файлов, в частности, может быть отключено выравнивание данных (выравнивание обеспечивает лучшую читаемость текста):

```csharp
var options = new JsonSerializerOptions
{
    WriteIndented = false
};

string json = JsonSerializer.Serialize<Person>(tom, options);
Console.WriteLine(json);
```

Оптимизация выравнивания и сокращение имён полей в выходном JSON-файле даёт оптимизацию размера в ~25%.

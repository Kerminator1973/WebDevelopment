# Как создать foreign key в описании модели Entity Framework

Предложим, что в базе данных есть две таблицы: "Companies" и "Units". Отношение один ко многие: с одной Company может быть связано много Units. В соответствии с **conventions**, описать foreign key в модели Entity Framework следует так:

```csharp
public class Company
{
    public int Id { get; set; }
    public string Name { get; set; }

    //  Коллекция дочерних записей — этого достаточно для связи
    public ICollection<Unit> Units { get; set; } = new List<Unit>();
}

public class Unit
{
    public int Id { get; set; }
    public string Name { get; set; }

    // Явное свойство внешнего ключа
    public int CompanyId { get; set; }

    // Навигационное свойство
    public Company Company { get; set; }
}
```

Для создания Foreign Key сдостаточно добавить коллекцию дочерних записей - EF автоматически создаст в таблице Units колонку CompanyId как внешний ключ к `Companies.Id`.

Если же нам нужно явно работать с ID записи о компании (например, для DTO, валидации, API), то необходим внести изменения в класс Unit, добавив свойство с именем, которое EF распознаёт как FK - в приведённом выше примере - это CompanyId. Если нам нужны данные компании, то необходимо добавить навигационное свойство.

Заметим, что если мы определим поля как nullable, то связь будет не обязательной, т.к. значения полей допускаю NULL:

```csharp
public int? CompanyId { get; set; }
public Company? Company { get; set; }
```

Также может потребоваться явно определить свойства связи, например, каскадное удаление. Это можно сделать в методе `OnModelCreating(ModelBuilder modelBuilder)` класса, производного от DbContext:

```csharp
modelBuilder.Entity<Unit>()
    .HasOne(u => u.Company)
    .WithMany(c => c.Units)
    .HasForeignKey(u => u.CompanyId)
    .OnDelete(DeleteBehavior.Cascade); // или Restrict / SetNull и т.д.
```

# Термины

## Projection/проекция

**Projection** в контексте разработки веб‑приложений с базой данных означает выбор подмножества данных — чаще всего конкретных столбцов из таблицы — вместо возврата всей строки целиком.

На SQL прекция выглядит следующий образом:

```sql
-- Полная выборка (без проекции)
SELECT * FROM users;

-- Проекция: выбираем только нужные столбцы
SELECT id, email, created_at FROM users;
```

Пример на Linq:

```sql
var result = context.Users
    .Select(u => new { u.Id, u.Email, u.CreatedAt })
    .ToList();
```

Для чего используются:

- Снижение сетевого трафика и объёма данных. Возвращается только нужное, особенно важно для API и мобильных клиентов
- Производительность. Меньше данных — меньше операций ввода‑вывода, меньше памяти и CPU на стороне БД и приложения
- Безопасность. Можно не передавать чувствительные поля (например, password_hash, ssn, внутренние флаги) клиенту
- Чистота контракта API. Чётко определено, какие поля возвращаются в ответе, что упрощает версионирование и поддержку
- Совместимость с ORM и DTO. Часто проекция реализуется как маппинг на DTO (Data Transfer Object) или выбор конкретных полей в ORM‑запросе

## Навигационные свойства

**Навигационные свойства** в EF Core — это свойства в классе-сущности (entity), которые позволяют переходить между связанными сущностями — то есть выстраивать связи между таблицами (один‑к‑одному, один‑ко‑многим и т. д.).

Пример описания сущностей:

```csharp
public class Blog
{
    public int Id { get; set; }
    public string Name { get; set; }

    // навигационное свойство: коллекция связанных постов
    public ICollection<Post> Posts { get; set; } = new List<Post>();
}

public class Post
{
    public int Id { get; set; }
    public string Title { get; set; }

    // внешний ключ
    public int BlogId { get; set; }

    // навигационное свойство: ссылка на блог
    public Blog Blog { get; set; }
}
```

Здесь:

- Blog.Posts — навигационное свойство‑коллекция (многие посты для одного блога)
- Post.Blog — навигационное свойство‑ссылка (один блог для поста)

EF Core по соглашениям поймёт, что это связь "один‑ко‑многим" и создаст в БД внешний ключ BlogId и соответствующий `FOREIGN KEY`.

Виды навигационных свойств:

- Ссылочные (reference) — для стороны "один": `public Blog Blog { get; set; }`
- Коллекционные (collection) — для стороны "многие": `public ICollection<Post> Posts { get; set; }`

Обычно используют `ICollection<T>` с реализацией `List<T>` или `HashSet<T>`.

### Использование навигационных свойств

Поскольку навигационные свойства — это не данные, а способ доступа к ним, важно, как именно EF Core их загружает.

_Eager loading_ (жадная загрузка) — сразу в запросе:

```cs
var blogs = context.Blogs
    .Include(b => b.Posts)
    .ToList();
```

_Explicit loading_ (явная загрузка) — вручную через Entry(...).Collection / Reference.

_Lazy loading_ (ленивая загрузка) — автоматически при обращении к свойству (требует virtual и включённого lazy loading).

### Практические нюансы

Инициализация коллекции. Лучше инициализировать сразу:

```cs
public ICollection<Post> Posts { get; set; } = new List<Post>();
```

Это избавит от проверок на null и упростит добавление элементов.

Virtual для lazy loading. Если используется ленивая загрузка, свойства добавить модификатор `virtual`:

```cs
public virtual Blog Blog { get; set; }
public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
```

В некоторых случаях может потребоваться настроить связи через Fluent API. В этом случае _conventions_ (соглашения) не используются:

```cs
modelBuilder.Entity<Post>()
    .HasOne(p => p.Blog)
    .WithMany(b => b.Posts)
    .HasForeignKey(p => p.BlogId)
    .OnDelete(DeleteBehavior.Cascade);
```

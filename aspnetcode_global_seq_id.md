# Глобальный Sequence ID в Entity Framework

Предположим, что в базе данных есть две разных таблицы, которые нужно выгружать в рамках одного запроса. При этом таблицы не связываются через JOIN, а объединяются с использованием UNION.

Например, есть одна таблица "внесение наличных", а вторая "операционные циклы" и нам нужно выгружать их в одном запросе, используя общий уникальный идентификатор для этих таблиц.

Microsoft SQL Server и Postgres позволяют создать глобальный автоинкрементный идентификатор. На SQL это выглядит так:

```sql
CREATE SEQUENCE global_id_seq START WITH 1 INCREMENT BY 1;
```

Мы может использовать этот идентификатор либо как PRIMARY KEY, либо как обычное поле. Например:

```sql
-- Таблица A
CREATE TABLE table_a (
    id BIGINT PRIMARY KEY DEFAULT nextval('global_id_seq'),
    data TEXT
);

-- Таблица B
CREATE TABLE table_b (
    id BIGINT PRIMARY KEY DEFAULT nextval('global_id_seq'),
    info TEXT
);
```

Для того, чтобы использовать этот механизм в ASP.NET Core приложении с использованием Entity Framework, необходимо явно указать на это в описании модели базу данных:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{            
    modelBuilder.HasSequence<long>("global_event_id_seq")
        .StartsAt(1)
        .IncrementsBy(1);

    modelBuilder.Entity<Transaction>(entity =>
    {
        entity.Property(e => e.EventId)
            .HasDefaultValueSql("NEXT VALUE FOR global_event_id_seq");
    });

    modelBuilder.Entity<OperCycle>(entity =>
    {
        entity.Property(e => e.EventId)
            .HasDefaultValueSql("NEXT VALUE FOR global_event_id_seq");
    });
```

Если мы используем не Microsoft SQL Server, а Postgres, то потребуется заменить HasDefaultValueSql() на следующий вариант:

```csharp
.HasDefaultValueSql("nextval('global_event_id_seq')");
```

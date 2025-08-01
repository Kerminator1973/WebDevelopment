# Встроенный в Postgres SQL движок Key/Value

Использовать hstore можно только после активации (установки) соответствующего расширения, следующей командой:

```sql
CREATE EXTENSION IF NOT EXISTS hstore;
```

Чтобы использовать hstore необходимо создать колонку с типом hstore:

```sql
CREATE TABLE my_table (
    id SERIAL PRIMARY KEY,
    data hstore
);
```

Более сложный пример:

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    attributes HSTORE
);
```

Синтаксис добавления записей:

```sql
INSERT INTO my_table (data) VALUES ('"key1" => "value1", "key2" => "value2"');
```

Можно использовать вариант с использованием конструктора hstore:

```sql
INSERT INTO my_table (data) VALUES (hstore('key1', 'value1') || hstore('key2', 'value2'));
```

Для каждого Insert-а выводится отдельная запись в pgAdmin -> View/Edit Data -> All Rows.

Получить данные можно следующим образом:

```sql
SELECT data->'key1' FROM my_table;
```

Однако, этот запрос работает не так, как может интуитивно показаться. Поскольку в запросе отсутствует ключевое слово WHERE, запрос возвращает все записи из таблицы (представлении All Rows в pgAdmin). Однако, если в конкретной записи нет нужно ключа, что возвращаемое значение null. Также как и в традиционном реляционном запросе, использование SELECT-а без WHERE часто лишено смысла.

Более канонической формой является:

```sql
SELECT * FROM my_table WHERE data ? 'key1';
SELECT * FROM my_table WHERE data ?| array['key1', 'key2'];
SELECT * FROM my_table WHERE data @> hstore('key1', 'value1');
```

Где условия задаются следующим образом:

```sql
- `?` Проверить, что ключ существует
- `?|` Проверить, что какой-то ключ существует
- `?&` Проверить, что все ключи существуют
- `@>` Check if the left hstore contains the right hstore
- `<@` Check if the left hstore is contained in the right hstore
```

Обобщая: hstore позволяет сохранять в поле некоторый набор пар "ключ/значение" и искать записи, указывая имя ключа. Важно понимать, что записей содержащих конкретный ключ может быть несколько, а Postgres позволяет отбирать записи по комбинации находящихся в них ключей.

Синтаксис для изменения данных следующий:

```sql
table (data) VALUES (hstore('key1', 'value1') || hstore('key2', 'value2'));
```

## Ещё один тип данных - JSONB

В PostgreSQL есть ещё один тип данных - jsonb, который позволяет выполнять схожие действия, но синтаксис использования немного другой.

Оба механизма - не полноценные базы данный Key/Value, как Redis, или DynamoDB. При принятии решения об использовании следует рассматривать разные варианты.

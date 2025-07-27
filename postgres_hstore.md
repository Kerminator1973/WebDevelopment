# Встроенный в Postgres SQL движок Key/Value

>Раздел находится в состоянии: исследование!

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

Получить данные можно следующим образом:

```sql
SELECT data->'key1' FROM my_table;
```

Синтаксис для изменения данных следующий:

```sql
table (data) VALUES (hstore('key1', 'value1') || hstore('key2', 'value2'));
```

Так же можно использовать условия поиска данных. Примеры:

```sql
SELECT * FROM my_table WHERE data ? 'key1';
SELECT * FROM my_table WHERE data ?| array['key1', 'key2'];
SELECT * FROM my_table WHERE data @> hstore('key1', 'value1');
```

```sql
- `?` Проверить, что ключ существует
- `?|` Проверить, что какой-то ключ существует
- `?&` Проверить, что все ключи существуют
- `@>` Check if the left hstore contains the right hstore
- `<@` Check if the left hstore is contained in the right hstore
```

В PostgreSQL есть ещё один тип данных - jsonb, который позволяет выполнять схожие действия, но синтаксис использования немного другой.

Оба механизма - не полноценные базы данный Key/Value, как Redis, или DynamoDB. При принятии решения об использовании следует рассматривать разные варианты.

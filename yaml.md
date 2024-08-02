# YAML

Довольно часто для хранения конфигураций, используется YAML: _Yet Another Markup Language_.

Ключевая статья - [YAML за 5 минут: синтаксис и основные возможности](https://tproger.ru/translations/yaml-za-5-minut-sintaksis-i-osnovnye-vozmozhnosti), Олег Борисенков.

Пример YAML-документа:

```yaml
---
 doe: "a deer, a female deer"
 ray: "a drop of golden sun"
 pi: 3.14159
 xmas: true
 french-hens: 3
 calling-birds:
   - huey
   - dewey
   - louie
   - fred
 xmas-fifth-day:
   calling-birds: four
   french-hens: 3
   golden-rings: 5
   partridges:
     count: 1
     location: "a pear tree"
   turtle-doves: two
```

Ключевая особенность YAML - используется система отступов.

YAML файл может хранить несколько документов. Документы разделяется тремя дефисами: `---`. Строго говоря, YAML файл должен начинаться с трёх дефисов - это маркер YAML-файла.

В YAML можно использовать комментарии, например:

```yaml
key: #Это однострочный комментарий
   - value line 5
   #Это
   #многострочный комментарий
   - value line 13
```

Данные в YAML содержаться в виде пар "ключ/значение".

YAML позволяет явно указать тип значения в поле:

```yaml
# Это значение преобразуется в int:
is-an-int: !!int 14.10
# Превращает любое значение в строку:
is-a-str: !!str 67.43
# Значение должно быть boolean:
is-a-bool: !!bool yes
```

Чтобы указать нулевой значение поля используется символ "тильда", или литерал **null**:

```yaml
foo: ~
bar: null
```

Последовательности (массивы) в YAML могут быть оформлены двумя способами:

```yaml
shopping: 
- milk
- eggs
- juice
```

Или в одной строке: `shopping: [milk, eggs, juice]`

Словари оформляются, приблизительно, так:

```yaml
Employees: 
- dan:
    name: Dan D. Veloper
    job: Developer
    team: DevOps
- dora:
   name: Dora D. Veloper
   job: Project Manager
   team: Web Subscriptions
```

Для разных языков программирования разработаны библиотеки для работы с YAML-файлами. Так, например, для Python есть библиотека **PyYAML**.

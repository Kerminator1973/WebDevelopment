# Насколько быстры современные СУБД

Выполнение SQL-запроса к СУБД связано с огромным количество вычислительных действий. На вскидку, при выполнении SQL statement могут выполняться следующие действия:

- адаптер доставляет команду в СУБД по сети и возвращает результат
- СУБД осуществляет лексический анализ запроса
- CУБД формирует плани исполнения запроса, используя накопленную статистику
- СУБД осуществляет выборку данных, используя индексы, либо перечитывая данные в операциях ввода/вывода
- СУБД модифицирует данные на дисках (INSERT/UPDATE/DELETE), что может потребовать перемещения данных по диску (но не всегда - данные могут быть разряженными)
- СУБД включает изменённые данные в индексы (бинарные деревья ?)
- СУБД объединяет текущий срез БД и срез, который был сформирован в рамках транзакции (merge)
- СУБД корректирует статистику для обработки последующих запросов

Если бинарное дерево (индекс) получается несбалансированным, то может потребоваться перестроить его.

Если используется ORM, то этот ORM может потратить достаточно много времени на то, чтобы сформировать комплексные запросы (например, с подзапросами и агрегацией) на стороне сервера. Также генерация некоторых обязательных данных, например GUID-а основного ключа, может требовать применения криптографии (генерация случайного числа, которое является частью GUID).

Кажется, что СУБД выполняет очень много работы и неоптимизированное взаимодействие с СУБД может приводить к очень большим проблемам с вычислительной нагрузкой.

Соответственно, интересно получить какую-то оценку реальной производительности современной СУБД, работающей в режиме добавления записей.

Для экспериментов использовался современненный сервер (2025) с большим объёмом ОЗУ и быстрыми NVMe-дисками. Приложение, которое создавало нагрузку размещено [здесь](https://github.com/Kerminator1973/WebDevelopment/tree/master/playground/Benchmark).


Приложение, сохраняет в одну таблицу два поля - целочисленный авто-инкремент и строка с guid. Для поля с guid добавлен индекс, т.е. индекс периодически перестраивается хотя статистически, дерево близко к сбалансированному. Параллельно не выполняются операции чтения данных, нет операций изменения данных. Запросы поступают строго последовательно.

## Метрики

В режиме добавления по одной записи мы получаем от 250 до 400 записей в базу данных в секунду.

Пакетное добавление (по 10 записей в пакете) даёт цифру в районе 2000+ записей в секунду. Т.е. даже для 10 записей в пакете мы получаем ускорение в 5 раз.

Чтобы спроецировать результаты на реальную систему, следует разделить полученную цифру минимум на 5 (запись об изменении, запись в 
журнал аудита, записи содержат много полей, не используется кэширование категорий).

Таким образом, в наивной реализации СУБД может обрабатывать (на уровне базы данных) около 50-60 событий в секунду. 

## Что делать для улучшения производительности

- Bulk Writing, т.е. пакетная запись - даёт кратный рост производительности
- Кэшировать данные на уровне приложения и пользовательского интерфейса
- Использовать UPSERT-операции (Merge)
- В сложных случаях применять хранимые процедуры
- Анализировать план исполнения, подсказывать СУБД, как именно следует строить план исполнения, в том числе, если статистическая оценка селективности со стороны СУБД не корректная
- Создать кластер, в котором есть одна база данных на запись и несколько реплик на чтение. См. шаблон Mediator (Посредник) в сочетании с [CQRS](https://github.com/Kerminator1973/WebDevelopment#CQRS) (Command Query Responsibility Segregation).
- Переносить часть данных в СУБД с другими моделями: NOSQL, ElasticSearch, key/value (Redis)
- Разбивать таблицы по типу использования: маленькие для добавления, большие - для выборки. Оптимизировать перестройку индексов
- Использовать шардирование

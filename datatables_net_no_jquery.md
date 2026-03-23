# Использование DataTables.NET без jQuery

В DataTables.NET 2 использование jQuery является опциональным, т.е. теперь мы можем Vanilla JavaScript-код.

Загрузить библиотеку можно на [официальном сайте](https://datatables.net/download/).

Параметры загрузки:

1. Choose styling - Bootstrap 5 (5.3.0)
2. Select packages - Nothing
3. DataTables core - DataTables (2.3.7)
4. Extensions - Responsive и, возможно, что-то ещё
5. Pick an installation method - Download

Загружается архив - "DataTables.zip", в котором есть и js-файлы, и css-файлы (полная и минифицированая версии).

Пример приложения взять непосредственно с сайта DataTables.net

## Попытка запуска без Boostrap 5 и jQuery

Попытка оказалась неуспешной - в коде DataTables.net есть код, который требует использования jQuery. При этом сам код сайта может не использовать jQuery. Также не подтянулся автоматически Bootstrap 5 - пришлось явным образом загружать его компоненты.

Как результат - минимальный вариант размещён в папке "Playground" - "main.html".

Загрузить Bootstrap 5.3 можно с [официального сайта](https://getbootstrap.com/docs/5.3/getting-started/download/).

Загрузить jQuery можно либо с [сайта DataTables.net из раздела примеров](https://code.jquery.com/jquery-3.7.1.js), либо с официального сайта [jQuery](https://jquery.com/).
# Использование DataTables.NET без jQuery

В DataTables.NET 2 использование jQuery является опциональным, т.е. теперь мы можем Vanilla JavaScript-код.

Загрузить библиотеку можно на [официальном сайте](https://datatables.net/download/).

Параметры загрузки:

1. Choose styling - Bootstrap 5 (5.3.0)
2. Select packages - Bootstrap 5 (5.3.0)
3. DataTables core - DataTables (2.3.7)
4. Extensions - Responsive и, возможно, что-то ещё
5. Pick an installation method - Download

>При выборе "Select packages" следует не указывать ничего, если нам необходимо использовать более свежую версию Bootstrap, например, 5.3.8. Однако в этом случае нам следует включать её отдельно (js и css)

Загружается архив - "DataTables.zip", в котором есть и js-файлы, и css-файлы (полная и минифицированая версии).

Пример приложения взять непосредственно с сайта DataTables.net, из раздела "Examples".

## Попытка запуска без Boostrap 5 и jQuery

Минимальный вариант статического web-приложения размещён в папке "Playground" - "main.html".

Попытка оказалась неуспешной - в коде DataTables.net есть код, который требует использования jQuery. При этом сам код сайта может не использовать jQuery. Также не подтянулся автоматически Bootstrap 5 - пришлось явным образом загружать его компоненты.

```js
"use strict";

if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( ['jquery'], function ( $ ) {
        return factory( $, window, document );
    } );
}
else if ( typeof exports === 'object' ) {
    ...
}
else {
    // Browser
    window.DataTable = factory( jQuery, window, document );
}
```

Проблема возникает в строке:

```js
window.DataTable = factory( jQuery, window, document );
```

Ошибка: _Uncaught ReferenceError: jQuery is not defined_

Разъяснения Gemini 3.1 Pro и Claude Sonnet 4.6 - не соответствуют реальности, бесполезны. Вероятно, DataTables.net работает без jQuery, но в случае использования его совместно с React, или Vue.js.

### Загрузка дополнительных библиотек

Загрузить Bootstrap 5.3.8 можно с [официального сайта](https://getbootstrap.com/docs/5.3/getting-started/download/).

Загрузить jQuery можно либо с [сайта DataTables.net из раздела примеров](https://code.jquery.com/jquery-3.7.1.js), либо с официального сайта [jQuery](https://jquery.com/).
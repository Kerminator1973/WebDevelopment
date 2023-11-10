# Локализация пользовательского интерфейса в ESM

Один из подходов локализации пользовательского интерфейса состоит в динамической загрузке файла с сообщениями на нужном языке. Допустим, что у нас есть несколько js-файлов, имя имена которых начинают со "strings_" за которыми следует идентификатор языка: "strings_el.js", "strings_ru.js", "strings_en.js", "strings_fr.js", "strings_it.js"... В каждом файле определены текстовые сообщения:

```js
export const HELLO = "Здравствуйте";
```

Нам бы хотелось, чтобы в можно было задать язык в качестве параметра командной строки:

```shell
node main.js ru
```

Реализация приложения с поддержкой i18n могла бы выглядеть следующим образом:

```js
const SUPPORTED_LANGUAGES = ['el', 'ru', 'en', 'fr', 'it'];
const selectedLanguage = process.argv[2];

if (!SUPPORTED_LANGUAGES.includes(selectedLanguage)) {
    console.error('The specified language is not supported');
    process.exit(1);
}

const translationModule = `./strings-${selectedLanguage}.js`;
import(translationModule)
    .then((strings) => {
        console.log(strings.HELLO);
    })
```

В приведённом выше примере корректно используется асинхронная (через Promises) загрузка модуля. Ключевой код вот этот:

```js
import(translationModule)
    .then((strings) => {
        // Модуль загружен!
    })
```

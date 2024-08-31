# Unit-тестирование js-кода в web-приложениях

В простых web-приложенях довольно часто используется JavaScript для реализации динамического поведения приложений. В html-файлах мы добавляем ссылку на js-файл с кодом, например, таким образом:

```html
<script src="~/js/monitoring.js" asp-append-version="true"></script>
```

Соответственно, в самом js-файле мы активно работаем с DOM, например, применяя библиотеку jQuery, или "ванильный" JavaScript. Например:

```js
window.addEventListener("load", function () {
    downloadModuleLinkers(false);
});
```

Количество кода в подобных js-файлах может быть очень большим и кажется разумным иметь возможность разработать Unit-тесты для него.

## Jest + JSDOM

Одним из вариантов разработки такого рода тестов является использование фреймворка [Jest](https://jestjs.io/) и библиотеки имитации DOM - [JSDOM](https://github.com/jsdom/jsdom).

Мы можем создать новый проект и добавить к нему необходимые зависимости:

```shell
npm init
npm install --save-dev jest
npm install --save-dev jest-environment-jsdom
```

Предположим, что у нас уже есть некоторый js-файл, исполняющийся в браузере и называется он "storageView.js". Для целей экспериментальной проверки, добавим в него пару функцию:

```javascript
function greet(name) {
    return `Hello, ${name}!`;
}

function add(a, b) {
    return a + b;
}

// Добавляем функции в глобальную область видимости для тестирования
window.greet = greet;
window.add = add;
```

Ключевым моментом является добавление функций в глобальную область видимости (_the global scope_). Если этого не сделать, то мы не получим доступа к функциям из Unit-теста.

Теперь разработает пару проверочных тестов на Jest и разместим их в файле "storageView.test.js". Важно, чтобы в имени тестов был суффикс ".test.js" - по нему Jest понимает, что в этом файле находятся тесты. Пример тестов:

```js
require('./storageView'); // Загружаем тестуемый JavaScript-код

// Выполняем простые тесты
test('greet function', () => {
    expect(window.greet('World')).toBe('Hello, World!');
});

test('add function', () => {
    expect(window.add(2, 3)).toBe(5);
});
```

Кроме этого мы должны добавить файл конфигурации Jest с именем "jest.config.js". В этом файле мы указываем окружение для выполнения тестов - jsdom:

```js
module.exports = {
    testEnvironment: 'jsdom',
};
```

Если не добавить конфигурационный файл, Jest завершит работу с ошибкой:

```output
The error below may be caused by using the wrong test environment, see https://jestjs.io/docs/configuration#testenvironment-string.
Consider using the "jsdom" test environment.
```

Запуск тестов на исполнение осуществляется командой:

```shell
npx jest
```

## Другие варианты

Довольно часто рассматривается библиотека Karma, у которой есть интеграция с Jenkins CI. Однако, этот библиотека получила статус **deprecated** и больше не развивается.

Другие фреймворки тестирования кода: Jasmine, qunit, Mocha, test'em!

В качестве альтернативы JSDOM рассматривается библиотека [fantomjs](https://phantomjs.org/).

## Тестирование кода работы с DOM

Для проверки кода работы с DOM часто используется библиотека JSDOM.

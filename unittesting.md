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

Запустить один тест можно командой:

```shell
jest domManipulation.test.js
```

## Другие варианты

Довольно часто рассматривается библиотека Karma, у которой есть интеграция с Jenkins CI. Однако, этот библиотека получила статус **deprecated** и больше не развивается.

Другие фреймворки тестирования кода: Jasmine, qunit, Mocha, test'em!

В качестве альтернативы JSDOM рассматривается библиотека [fantomjs](https://phantomjs.org/).

## Тестирование кода работы с DOM

Для проверки кода работы с DOM часто используется библиотека JSDOM.

Одной из наиболее распространённых задач JavaScript кода, исполняемого браузером является манипулирование DOM: создание, удаление, или изменение DOM-элементов.

Допустим, в нашем коде есть некоторая функция, которая добавляет элемент в DOM:

```js
function addElement(containerId, text) {
    const container = document.getElementById(containerId);
    if (container) {
        const newDiv = document.createElement('div');
        newDiv.textContent = text;
        container.appendChild(newDiv);
    }
}

window.addElement = addElement;
```

В приведённом выше коде мы используем традиционный Vanilla JavaScript, без jQuery. Тесты, которые проверяют работу с DOM, с использованием библиотеки JSDOM, могут выглядеть следующим образом:

```js
describe('addElement', () => {
    let container;

    beforeEach(() => {
        // Set up a DOM element before each test
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
    });

    afterEach(() => {
        // Clean up after each test
        document.body.removeChild(container);
    });

    test('should add a new div to the container', () => {
        window.addElement('test-container', 'Hello, World!');

        // Check if the new div was added
        const newDiv = container.querySelector('div');
        expect(newDiv).not.toBeNull();
        expect(newDiv.textContent).toBe('Hello, World!');
    });

    test('should not add a div if the container does not exist', () => {
        window.addElement('non-existent-container', 'This should not be added');

        // Check that no new divs were added
        const divs = container.querySelectorAll('div');
        expect(divs.length).toBe(0);
    });
});
```

До выполнения теста мы создаём в body документа некоторый DOM-элемент, а после выполнения теста удалим его, чтобы не ломать схему выполнения тестов. Затем мы вызываем функцию из js-файла выполняемого в браузере. Далее мы выполняем два теста:

- добавить элемент в DOM к существующему элементу и проверить, что добавленный элемент существует
- попытаться добавить элемент к не существующему элементу и убедится, что DOM не был изменён

### Подготовка базового HTML для каждого теста

Если нам нужно подготовить уникальный HTML для конкретного теста, то достаточно просто присвоить строку с этой HTML-версткой `document.body.innerHTML`:

```js
describe('initAuditEventMaps', () => {

    test('Check the extraction algorithm', () => {

        // В данном тесте выполняется проверка извлечения пар ключ/значение
        // из DOM-элементов select/option
        document.body.innerHTML = `
            <select id="selectEventTypeId">
                <option value="0" selected>Любое событие</option>
                <option value="1">Авторизация</option>
            </select>
            <select id="selectStorageId">
                <option value="0" selected>Любое ХЦК</option>
                <option value="1">Московское</option>
                <option value="2">Санкт-Петербург</option>
            </select>`;

        const tuple = window.initAuditEventMaps();

        expect(tuple[0].size).toBe(2);
        expect(tuple[0].get('0')).toBe("Любое событие");
        expect(tuple[0].get('1')).toBe("Авторизация");

        expect(tuple[1].size).toBe(3);
        expect(tuple[1].get('0')).toBe("Любое ХЦК");
        expect(tuple[1].get('1')).toBe("Московское");
        expect(tuple[1].get('2')).toBe("Санкт-Петербург");
    });
});
```

### Пример с использованием DOM

```js
describe('updateIconState', () => {

    test('Check results of update state', () => {

        // В данном тесте выполняется проверка корректности визуализации состояния свойства модуля
        document.body.innerHTML = `
            <div id="iconSilentAlarm">
                <span id="iconSilentAlarmText">Тихая тревога</span>
            </div>`;

        window.updateIconState("iconSilentAlarm", 1, "Тревоги нет");

        const iconElement = document.getElementById('iconSilentAlarm');
        const textElement = document.getElementById('iconSilentAlarmText');

        expect(iconElement.classList.contains('icon-big-red')).toBe(false);
        expect(iconElement.classList.contains('icon-big-green')).toBe(true);
        expect(iconElement.classList.contains('icon-big-gray')).toBe(false);
        expect(textElement.innerText).toBe("Тревоги нет");
    });
});
```

## Вычисление покрытия кода тестами

Из-за особенностей реализации Jest (framework тестирования JavaScript-кода), файл с описанием проекта на JavaScript (package.json) должен быть размещён в корневом каталоге проекта. В той же самой папке, что файл проекта CinnaPages (CinnaPages.csproj") для основного проекта на ASP.NET Core.

К Unit-тестам относятся следующие файлы и папки:

- package.json - это файл проекта на JavaScript
- jest.config.js - конфигурационные параметры Jest
- test - папка с тестами
- coverage.md - данное руководство

Для выполнения тестов необходимо загрузить зависимости следующей командой:

```shell
npm install
```

После загрузки зависимостей, в основной папке появятся:

- package-lock.json - файл с фиксацией конкретных версий зависимостей (нужен для стабильного исполнения приложения)
- node_modules - зависимости основного JavaScript-проекта, которые необходимы для выполнения Jest

Выполнение тестов и сборка информации по покрытию кода тестами выполняется командой:

```shell
npx jest --coverage
```

Результатом работы является подкаталог "coverage", который содержит статический HTML-сайт с информацией о покрытии кода тестами, а так же ряд дополнительных экспортируемых файлов.

### Особенности настройки сборки матрик покрытия кода тестами

Для определения покрытия кода тестами необходимо указать папки с исходными текстами приложения, а также исключениями. Сделать это можно как в файле "jest.config.js", так и в "package.json" в разделе "jest". Ниже приведён примитивный пример настройки параметров оценки покрытия кода тестами:

```js
// jest.config.js
module.exports = {
    testEnvironment: 'jsdom',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['lcov', 'text'],
    collectCoverageFrom: ['wwwroot/js/*.js']
};
```

## Включить покрытие кода тестами в SonarQube

Файл содержащий информацию о покрытии "coverage\lcov.info" следует добавить в конфигурационные параметры SonarQube.

Пример изменения в конфигурационном файле "sonar-project.properties":

```config
sonar.javascript.lcov.reportPaths=/home/developer/projects/RUFServerLite/lcov.info
```

Исключить из статистики покрытия "лишние" файлы можно настройкой:

```config
sonar.coverage.exclusions=**/test/**,**/playground/**,**/public/**,**/scripts/**,**/src/swagger-docs.js,**/src/run.js
```


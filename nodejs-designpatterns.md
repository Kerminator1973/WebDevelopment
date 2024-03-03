# Шаблоны проектирования Node.js

Один из ключевых шаблонов проектирования - **Factory**. Смысл шаблона иллюстрирует следующий пример:

```js
function createImage (name) {
    if (name.match(/\.jp?g$/)) {
        return new ImageJpeg(name);
    } else if (name.match(/\.gif$/)) {
        return new ImageGif(name);
    } else if (name.match(/\.png$/)) {
        return new ImagePng(name);
    } else {
        throw new Error('Unsupported format')
    }
}
```

Шаблон позволяет скрыть особенности создания объекта необходимого пользователю типа за функцией, или классом. Этот тип шаблонов проектирования относят к **Creational Design Patterns**.

Также этот шаблон может быть использован как механизм **инкапсуляции**, т.е. сокрытия реализации (спасибо механизму closures):

```js
function createPerson (name) {
    const privateProperties = {};

    const person = {
        setName (name) {
            if (!name) {
                throw new Error('A person must have a name');
            }
            privateProperties.name = name;
        },
        getName () {
            return privateProperties.name;
        }
    };

    person.setName(name);
    return person;
}
```

В приведённом выше примере мы ограничиваем доступ пользователя объекта к полю privateProperties, который становится эквивалентен private и возвращаем объект с двумя публичными функциями, которые контролируемо используют поле privateProperties.

## Другие методики для инкапсуляции

Closures не удинственный механизм, который можно использовать для инкапсуляции. Другие подходы:

- Использование [the hashbang](https://github.com/tc39/proposal-class-fields#private-fields), начиная с Node.js 12
- Использование [WeakMaps](https://fitzgeraldnick.com/2014/01/13/hiding-implementation-details-with-e6-weakmaps.html)
- Using symbols as keys for private properties: https://2ality.com/2016/01/private-data-classes.html#using-symbols-as-keys-for-private-properties
- Private-переменные в конструкторе по [методике Douglas Crockford](https://www.crockford.com/javascript/private.html)
- Использвование конвециональных договорённостей (conventions), в частности префикса "_" (underscore) в именах переменных (Python style)

## Шаблон проектирования Builder

Шаблон проектирования Builder чаще всего применяется для того, чтобы заменить конструктор объекта c большим количеством параметров. Чаще всего, конструктор с большим количеством параметров всё равно существует, но Builder позволяет использовать его косвенно, значительно увеличивает читаемость и снижает вероятность возникновения ошибки.

 Пример реализации:

```js
class BoatBuilder {
    widthMotors (count, brand, model) {
        this.hasMotor = true;
        this.motorCount = count;
        this.motorBrand = brand;
        this.motorModel = model;
        return this;
    }

    withSails (count, material, color) {
        this.hasSails = true;
        this.sailsCount = count;
        this.sailsMaterial = material;
        this.sailsColor = color;
        return this;
    }

    // hull = корпус
    hullColor (color) {
        this.hullColor = color;
        return this;
    }

    withCabin () {
        this.hasCabin = true;
        return this;
    }

    build() {
        return new Boat({
            hasMotor: this.hasMotor,
            motorCount: this.motorCount,
            motorBrand: this.motorBrand,
            motorModel: this.motorModel,
            hasSails: this.hasSails,
            sailsCount: this.sailsCount,
            sailsMaterial: this.sailsMaterial,
            sailsColor: this.sailsColor,
            hullColor: this.hullColor,
            hasCabin: this.hasCabin
        });
    }
}
```

Вспомогательный класс Builder позволяет создавать объект класса Boat в человеко-читаемой манере (что и является главной целью этого шаблона проектирования):

```js
const myBoat = new BoatBuilder()
    .withMotors(2, 'Best Motor Co.', 'OM123')
    .withSails(1, 'fabric', 'white')
    .withCabin()
    .hullColor('blue')
    .build();
```

Важный момент состоит в том, что значительную часть параметров можно сделать default-ными и не указывать их явным образом при конструировании экземпляра класса.

Также важно, что в каждом методе установки параметром можно приводить их дополнительную обработку: type casting, validation, normalization.

Один из практических примеров использования шаблона проектирования Builder - [SuperAgent](https://nodejsdp.link/superagent-src-builder).

## Revealing Constructor

Reveal = раскрыть.

Одна из особенностей JavaScript состоит в том, что если некоторый объект передаётся в чужую библиотеку, или функции, поля этого объекта могут быть изменены там. Это происходит потому, что JavaScript передаёт объекты по ссылке, чтобы ускорить выполнение приложения. Чтобы избежать изменения полей объекта "чужим" кодом, перед вызовом чужих функций создаётся _defensive copy_ - копия объекта, которая и передаётся "чужакам".

Чтобы избежать необходимости создания defensive copy, передаваемый в чужой код объект должен быть неизменяемым (_immutable objects_). 

Тема _immutable objects_ крайне важна в JavaScript, т.е. она позволяет не только избежать создания _defensive copy_, но и, например, реализовать  механизм _effective change detection_, который активно применяется в таких библиотеках, как React, Angular и Vue.js. В этих библиотеках, каждое изменение состояния/объекта требует создания новой копии. Это означает, что о том произошло ли изменение можно судить просто сравнивая ссылки на зафиксированное значение и текущее значение, используя triple equal (===).

Однако на практике, при создании объекта, может потребоваться выполнить какие-то дополнительные настройки объекта. При этом после создания, объект становится **immutable**. Именно такую ситуацию решает шаблон проектирования **Revealing Constructor**:

- создать объект, который может быть изменён только на этапе создания
- может быть настроено _custom behavior_ на этапе создания
- некоторые переменные класса могут быть проинициализированы только на этапе создания

Шаблон проектирования Revealing Constructor позволяет вносить изменения только на этапе создания, что и дало слова Revealing (раскрывающий) и Constructor в его названии. В книге "Node.js Design Patterns" используется пример создания **ImmutableBuffer** - буфера с данными, которые нельзя изменить в чужом коде.

В общем виде, применение шаблона выглядит следующим образом:

```js
const object = new SomeClass(function executor(revealedMembers) {
    // Вся настройка осуществляется только через revealedMembers на этапе создания
});
```

Реальный пример из жизни - Promises: состояния Promises не может быть изменено просто так. Для его изменения используются только resolve и reject. Для реализации цепочки Promises, на каждом этапе создаётся новый Promise.

## Singleton

Singleton используется для:

- общего использования (sharing) информации о состоянии приложения (stateful information)
- оптимизации использования ресурсов
- синхронизации доступа к ресурсу

В общем случае, нам не нужно каким-то особенным образом реализовывать шаблон проектирования singleton, поскольку он реализуется автоматически при использовании директивы **import**. Node.js кэширует экспортируемый модуль и при использовании import в другом js-файле, вернёт ранее созданный экземпляр. Т.е. следующий ниже код уже является реализацией singleton:

```js
// Файл "dbInstance.js"
import { Database } from './Database.js';

export const dbInstance = new Database('my-app-db', {
    url: 'localhost:5432',
    username: 'user',
    password: 'password'
});
```

Однако, есть нюанс - Node.js кэширует импортируемые модули, используя путь к файлу в качестве ключа. Соответственно, если в дереве проекта есть модули использующие разные версии одной и той же зависимости, то Node.js создаст два разных экземпляра модуля и это разрушит singleton.

Ключевой термин: **hoist** = подъём, поднимать, лифт. Если разные модули могут использовать одну версию зависимости, то она размещается на верхнем уровне node_modules. Если разным модулями нужны разные версии зависимостей, то они размещаются каждая в папке с именем зависимого модуля. Соответственно, размещение зависимости в на уровне node_modules и есть "подъём" реализации на самый верхний уровень.

Ключевая рекомендация - разрабатывая свой собственный package, старайтесь делать его **stateless**, чтобы избежать проблем, в том числе, потенциального создания нескольких экземпляров "singleton".

Ключевая проблема шаблона Singleton в JavaScript состоит в том, что он создаёт сильную сцепленность (_tightly coupled_) между зависимым модулем и зависимостью. Как пример, если потребуется добавить mocking для тестирования кода, то сделать это будет достаточно сложно.

## Dependency Injection

Ключевая задача, решаемая шаблоном проектирования Dependency Injection - ослабить сцепленность компонентов, позволяя упростить замену отдельных модулей при необходимости.

Например, задачу внедрения зависимости класса Blog от класса, реализующего взаимодействие с базой данных можно таким образом:

```js
import { promisify } from 'util';

export class Blog {
    constructor (db) {
        this.db = db;
        this.dbRun = promisify(db.run.bind(db));
        this.dbAll = promisify(db.all.bind(db));
    }
    // ...
}
```

В приведённом выше примере мы не импортируем класс для работы с базой данных, он устанавливается кодом, который использует класс Blog:

```js
const db = createDB(join(__dirname, 'data.sqlite'));
const blog = new Blog(db);
```

Именно такого рода ослабление сцепленности и имеет значение.

Однако, проблема состоит в том, что в реализации класса Blog мы не знаем, что такое db - в больших проектах это очень сильно осложняет читаемость кода. Соответственно, в больших проектах потребуется использовать строгую типизацию (TypeScript).

## Invertion of Control

Этот шаблон проектирования описан Martin Fowler в [его блоге](https://martinfowler.com/articles/injection.html). В этом шаблоне проектирования мы передаём ответственность за создание зависимости стороннему компоненту, называемому **service locator**, который возвращает экземпляр нужной зависимости по её идентификатору. Например:

```js
serviceLocator.get('db');
```

Следует обратить внимание на следующие библиотеки:

- [inversify](https://www.npmjs.com/package/inversify)
- [awilix](https://www.npmjs.com/package/awilix)

## Proxy (также известный как surrogate)

Ключевое отличие шаблона проектирования Proxy от Adapter состоит в том, что Proxy полностью сохраняет интерфейс объекта, к которому он подключается (_subject_).

Чаще всего proxy используется для следующих задач:

- Data validation: прокси выполняет проверку входных параметров до того, как они будут переданы субъекту
- Security: прокси выполняет аутентификацию пользователя, а субъект выполняет основную функцию системы, не заботясь об аутентификации
- Caching: прокси хранит внутренний cache и обращается к субъекту только в том случае, если нужные данные отсутствуют в cache
- Lazy initialization: если создание субъекта дорогое, то прокси может не выполнять его до тех пор, пока данные действительно не понадобятся
- Logging: логирование вызовов
- Remote objects: прокси может забирать удалённые объекты и делать их локальными

Реализация шаблона проектирования в JavaScript может быть очень простой:

```js
class SafeCalculator {
    constructor (calculator) {
        this.calculator = calculator;
    }

    // proxied method
    divide () {
        const divisor = this.calculator.peekValue();
        if (divisor === 0) {
            throw Error('Division by 0');
        }
        return this.calculator.divide();
    }

    // delegated methods
    putValue (value) {
        return this.calculator.putValue(value);
    }

    // ...
}
```

Аналогично можно создать proxy через фабричную функцию:

```js
function createSafeCalculator (calculator) {
    return {
        divide () {
            const divisor = this.calculator.peekValue();
            if (divisor === 0) {
                throw Error('Division by 0');
            }
            return this.calculator.divide();
        },
        putValue (value) {
            return this.calculator.putValue(value);
        },
        // ...
    }
}
```

Недостаток обоих вариантов - если нужно переопределить один-две метода, реализация proxy может быть слишком избыточной.

В npm есть библиотека [delegates](https://www.npmjs.com/package/delegates), которая позволяет создавать proxy, управляя доступом к методам оригинального класса.

Некоторые программисты используют подход **Object augmentation** (или **monkey patching**), который позволяет переопределить только те методы, которые нуждаются в переопределении. Пример:

```js
function patchToSafeCalculator (calculator) {
    const divideOrig = calculator.divide;
    calculator.divide = () => {
        const divisor = this.calculator.peekValue();
        if (divisor === 0) {
            throw Error('Division by 0');
        }
        return divideOrgi.apply(calculator);    
    }

    return calculator;
}

const calculator = new SafeCalculator();
const safeCalculator = patchToSafeCalculator(calculator);
```

Эта техника может казаться очень удобной, но её применение может быть очень опасным, т.к. она влияет на оригинальный объект. В JavaScript вообще следует стремиться избегать Mutations (случаев, когда _immutable_ объект становится _mutable_) любой ценой.

В спецификации **ES2015** определён нативный способ создания мощных proxy-объектов:

```js
const proxy = new Proxy(target, handler);
```

Вот как можно реализовать предыдущие примеры используя Proxy:

```js
const safeCalculatorHandler = {
    get: (target, property) => {
        if (property === 'divide') {
            return function () {
                const divisor = target.peekValue();
                if (divisor === 0) {
                    throw Error('Division by 0');
                }
                return target.divide();
            }
        }
        return target[property];
    }
}

const calculator = new StackCalculator();
const safeCalculator = new Proxy(
    calculator,
    safeCalculatorHandler
);
```

## Дополнительные возможности и ограничения шаблона проектирования Proxy

JavaScript позволяет разработчику перехватывать и переопределять многие операции, которые возможны над объектом. Это позволяет реализовывать такие сценарии использования как: _meta-programming_, _operator overloading_ и _object virtualization_. Например, мы можем написать вот такой код:

```js
const evenNumbers = new Proxy([], {
    get: (target, index) => index * 2,
    has: (target, index) => number % 2 === 0
});

console.log(2 in evenNumbers);  // true
console.log(5 in evenNumbers);  // false
console.log(evenNumbers[7]);    // 14
```

В приведённом выше примере мы создаём виртуальный массив, который хранит все чётные числа и он может быть использован как обычный (regular) массив.

Больше информации о Proxy можно подчерпнуть по ссылкам:

- [Proxy на MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [Представляем прокси ES2015](https://developer.chrome.com/blog/es2015-proxies?hl=ru) by Адди Османи

Стоит добавить, что часто шаблоны Observable и Proxy, например, для реалдизации **reactive programming** (RP) и **functional reactive programming**. Почитать о реактивном программировании можно в статье [Reactive Manifesto](https://www.reactivemanifesto.org/).

Примеры активного использования шаблона проектирования Proxy в различных библиотеках:

- [LoopBack](https://loopback.io/) - популярный web framework для разработки API и микросервисов. Этот framework использует шаблон Proxy, чтобы предоставить возможность перехватывать и расширять вызовы контроллеров. Эта возможность может быть использована, чтобы создать механизм custom validation, или механизм аутентификации
- [Vue.js 3](https://vuejs.org/) - очень популярный JavaScript reactive UI framework, в котором observable-свойства базируются на использовании шаблона проектирования Proxy
- [MobX](https://mobx.js.org/README.html) - известная библиотека, реализующая reactive state management. Чаще всего библиотека используется совместно с Vue.js, или React

## Decorator

Очень похожий по использованию и реализации на шаблон проектирования Proxy. Ключевое отличие - он не меняет поведение базового объекта/класса, а добавляет к нему некоторый новый функционал. Т.е. новый класс-расширение _декорирует_ некоторый существующий класс.

Шаблоны проектирования Proxy и Decorator в случае JavaScript очень походы, вплоть до потери расхождений.

## Adapter

Позволяет нам получить доступ к объекту, который имеет совершенно другой функционал. Пример из реальной жизни: подключение кабеля USB Type-A к порту USB TYpe-C. Для того, чтобы сделать это нужен переходник. В общем случае, адаптер конвертирует объект с заданные интерфейсом таким образом, чтобы мы могли использовать его в контексте, в котором ожидается другой интерфейс. В программной инженерии, адаптер используется для того чтобы взять интерфейс некоторого объекта и сделать его **совместимым** с другим интерфейсом, который ожидается некоторой системой.

## Strategy

Шаблон проектирования **Strategy** создаёт объект, который называют _context_, который поддерживает различные варианты логики поведения, которые внедряются в объект посредством замены **стратегии** - другого объекта, реализующего некоторую изменяемую логику общего объекта.

Примеры:

- Пример из реальной жизни: есть библиотека [Passport.js](https://www.passportjs.org/), у которой есть разные стратегии аутентификации пользователя: аккаунты Facebook/Twitter/Microsoft, пара логин/пароль, и т.д.
- Есть автомобиль и у него могут быть заменены колёса. Автомобиль - это контекст, который реализует основную логику, а колёса - подстройка (стратегия)под некоторые условия. Для зимней дороги используется один тип колёс, а для скоростных дорог - другой
- Конфигурационная система содержит некоторую логику загрузки, изменения и сохранения конфигурационных параметров, но в каком именно формате будут сохраняться данные (JSON, XML, INI, YAML) - зависит от **стратегии**

## State

**State** - это специализация шаблона проектирования Strategy, в которой стратегия изменяется в зависимости от состояния контекста. Т.е. существует некоторый объект с контестом, в котором есть стратегия (или даже несколько стратегий), которые могут изменяться при изменении состояния.

Пример из книги "Node.js Design Patterns" рассматривает реализацию модуля, который получает по TCP/IP JSON-пакеты в условиях нестабильного интернете (интернет вещей). Соответственно, в примере рассматривается два состояния модуля: подключение отсутствует и подключение есть. В каждом из состояний выполняется свой собственный набор дейсвтий, но в совокупности они реализуют одну задачу - получение данных с датчиков в условиях нестабильного подключения.

В примере кода используется библиотека [json-over-tcp-2](https://www.npmjs.com/package/json-over-tcp-2). Замечу, что библиотека старая (последнее обновление - 4 года назад) и её нельзя отнести к популярным библиотекам.

## Template

Шаблон проектирования Template очень похож на Strategy. Ключевое отличие состоит в том, что определяется некоторая общая реализация, но какой-то, или какие-то методы остаются не реализованными - они являются зависимыми от условий конкретной задачи и они используются для специализации шаблона. Таким образом, в рамках этого шаблона проектирования существует общая часть (шаблон) и его специализация.

## Iterator

Один из наиболее важных протоколов, а не шаблонов проектирования. Используется повсеместно и позволяет выполнять итерирование по произвольной коллекции. В JavaScript требуется реализовать два свойства: done и value:

- done устанавливается в true, когда итерация завершена, т.е. больше не осталось вариантов, которые можно вернуть
- value - значение текущего элемента

Пример реализации итератора - перечисление всех букв латинского алфавита:

```js
const A_CHAR_CODE = 65;
const A_CHAR_CODE = 90;

function createAlphabetIterator() {
    let currCode = A_CHAR_CODE;

    return {
        next() {
            const currChar =  String.fromCodePoint(currCode);
            if (currCode > Z_CHAR_CODE) {
                return { done: true };
            }

            currCode++;
            return {
                value: currChar,
                done: false
            }
        }
    }
}
```

Объекты, по которым можно выполнять итерирование называются **iterable**. Чтобы добавить такой функционал к произвольному объекту, можно реализовать [@@iterator](https://262.ecma-international.org/6.0/#sec-well-known-symbols). Пример:

```js
class MyIterable {
    [Symbol.iterator] () {
        // Здесь нужно вернуть итератор
    }
}
```

Далеко не все конструкции JavaScript совместимы с **iterable**, однако, мы можем использовать следующие:

```js
for (const element of matrix2x2) {
    console.log(element);
}
```

Также с **iterable** совместим **spread operator**:

```js
const flattenedMatrix = [...matrix2x2];
console.log(flattenedMatrix);
```

Похожим образом мы можем использовать **destructuring**:

```js
const [oneOne, oneTwo, twoOne, twoTwo] = matrix2x2;
console.log(oneOne, oneTwo, twoOne, twoTwo);
```

Некоторые встроенные API в JavaScipt также поддерживают работу с **iterable**: Map, WeakMap, Set, WeakSet, Promise.all(), Promise.race(), Array.from().

## Generators

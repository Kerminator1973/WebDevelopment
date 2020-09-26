# Что такое web-разработка

Под термином web application часто подразумевают приложение, доступное через браузер. Пользователь запускает Google Chrome, Firefox, или Microsoft Edge, вводит адрес этого приложения (URL), браузер подключает к серверу, загружает какие-то данные и начинает их обрабатывать, отображая результат в своем окне.

Для получения результата – отображения данных некоторую работу по формированию данных выполняет сервер и некоторую работу по отображению данных выполняет браузер, используя ресурсы компьютера клиента. Технологический стек, используемый для разработки приложения на сервере и отображения информации в браузере, могут быть разными. Типы решаемых задач так же различаются: сервер получает данные из разных источников (базы данных, файлы с шаблонами, другие сервера) и генерирует новые данные в форматах, понятных браузеру. Браузер обрабатывает файлы с описанием разметки, стилистического оформления и инструкции по динамическому изменению отображения и управляет выводом.

Задачи, связанные с работой сервера принято называть **Back-End** Development, а задачи, связанные с браузером – **Front-End** Development.

# Технологический стек

Выбор технологического стека критически влияет на разработку программного обеспечения – именно этот выбор закладывает технологические ограничения, которые возникнут в будущем. Поменять технологический стек, на практике, крайне сложно и этот выбор определяет наборы «костылей», которыми будет обладать продукт, а также стоимость его сопровождения и развития.

## Технологии Front-End

При разработке Front-End часто используется принцип, называемый Separation of Concerns. В соответствии с этим принципом, структура данных описывается посредством HTML, за стилистическое оформление определяется каскадными таблицами **CSS**, а динамическое поведение определяет JavaScript-код.

В современных web-приложения HTML является хранилищем структурированных данных - это **документ с иерархической структурой** (дерево), у каждого элемента которой есть:

1. Уникальный идентификатор (id)
2. Набор классов (class) к которым относится этот элемент
3. Тип (tag name)
4. Набор дополнительных атрибутов
5. Содержимое - человеко-читаемый текст

Всё **стилистическое оформление** указывается в каскадных таблицах. Это относится не только к шрифтам и цвету, но и к взаимному расположению элементов, а также к **векторной графике** и **анимации** (transitions). В современном HTML уже нет тэгов TABLE, TD, TR и подобных - взаимное расположение элементов описывается посредством **Flexbox** ([шпаргалка](https://tpverstak.ru/flex-cheatsheet/)).

[Сайт-пример](http://www.csszengarden.com/) использования CSS с объяснениями, является сопровождением книги «The Zen of CSS Design: Visual Enlightenment for the Web».

С CSS связано понятие **CSS Selector** - способ поиска DOM-элемента на странице для применения к нему стилистического оформления. [Статья](https://code.tutsplus.com/ru/tutorials/the-30-css-selectors-you-must-memorize--net-16048) об селекторах. Ещё одна [статья](https://developer.mozilla.org/ru/docs/Web/CSS/Specificity) о том, как браузер применяет стили для комплексных селекторов. Для наиболее сложных случаев рекомендуется использовать специальный [инструмент для определения specificity](https://specificity.keegan.st/).

Отдельная большая задача - [выбор совместимых шрифтов](https://www.cssfontstack.com/), доступность которых на разных операционных системах может отличаться. Google рекомендует хранить шрифты на сайте и загружать их вместе с другими артефактами. Также Google предоставляет бесплатную коллекцию шрифтов [Google Fonts](https://fonts.google.com). [Статья](http://css-tricks.com/snippets/css/using-font-face/) описывает загрузку шрифтов в web-приложении.

Существуют специализированные встраиваемые модули, обеспечивающие единый стиль оформления web-приложения и добавляющие дополнительные органы управления, которые придают приложению профессиональный вид. Наиболее популярной является [Twitter Bootstrap](http://getbootstrap.com/). Существует множество альтернатив Bootstrap, одной из которых является [Semantic UI](https://semantic-ui.com/).

**Динамическое поведение** (JavaScript), преимущественно отвечает за взаимодействие с сервером. В случае применения парадигмы Single Page Application (**SPA**), значение JavaScript значительно шире - он начинает управлять состоянием приложения, переходами между логическими экранами, обеспечивает информационную безопасность, и т.д.

Из-за использования пользователями разных браузеров и их разных версий, существует проблема технологической фрагментации - какие-то технологические возможности могут быть недоступны конкретному пользователю. Чтобы решить подобные проблемы обычно используются вспомогательные инструменты/библиотеки. В течение долгого времени, доминировала библиотека [jQuery](https://jquery.com/), жизненный цикл которой приближается к концу, хотя её влияние всё ещё значимо. В некоторых случаях, разработчики используют [встроенные возможности JavaScript](http://youmightnotneedjquery.com/), т.н. *Vanilla JavaScript*. Для проверки совместимости часто используется ресурс [CanIUse](https://caniuse.com/).

## Альтернативы JavaScript

Основными ограничениями JavaScript на клиентских компьютерах считаются: однопоточность и тот факт, что JavaScript - интерпретируемый язык программирования. Влияение этих факторов может быть минимальным благодаря тому, что многопоточность поддерживается в runtime и благодаря этому, например, клиентский JavaScript может выполнять несколько http(s) запросов одновременно. То же самое можно сказать и о производительности - до того момента, пока JavaScript не используется для выполнения задач с высокой вычислительной нагрузкой (они выполняются Runtime, либо посредством ActiveX, либо посредством кода в host-приложении), проблем с производительностью быть не должно.

Если же необходимо выполнить высокую вычислительную нагрузку непосредственно в клиентском коде, альтернативой JavaScript может выступать технология **WebAssembly**. Эта технология поддерживается современными браузерами и существуют инструменты, которые позволят разрабатывать соответствующий клиентский код. В первую очередь это [Microsoft Blazor](https://dotnet.microsoft.com/apps/aspnet/web-apps/blazor) и [Qt for WebAssembly](https://doc.qt.io/qt-5/wasm.html).

## Основные проблемы web-приложений

Одним из наиболее критичных ограничений, связанных с работой web-приложений является канал связи между клиентским компьютером (браузером) и сервером. На пользовательский опыт крайне негативно влияют: **полоса пропускания** (какой объём данных может быть загружен за единицу времени) и **латентность** сети (как быстро будет получен ответ на запрос, без учёта потерь на подготовку ответа сервером).

Чтобы обеспечить конфортное использование приложения пользователем, необходимо минимизировать объём передаваемой информации и делать это только при необходимости.

Различают два подхода в организации пользовательского интерфейса: **server-side rendering** и **client-side rendering**. В первом случае, вся основная работа по формированию пользовательского интерфейса осуществляется на сервере, т.е. максимально близко к базам данных. Во-втором случае, сервер нагружается существенно меньше, а формирование пользовательского интерфейса осуществляется браузером на основании накопленных (или уточнённых у сервера) данных. Выбор в пользу использования того, или иного подхода зависит от особенностей конкретной задачи. На практике, чаще всего используются гибридные подходы.

Чтобы уменьшить количество запросов на сервер (в том числе, статических данных) используются:

1. Bundling - объединение разнородных ресурсов в один (или несколько) загружаемый файл
2. Minifying - реструктуризация JavaScript/CSS-кода с целью устранения избыточностей. Из кода могут быть удалены комменатрии, переменные могут быть переименованы
3. Client Side Caching - кэширование данные на стороне клиента

К проблемам разработки web-приложений могут быть отнесены: различные функциональные возможности клиентских браузеров, см. [CanIUse](https://caniuse.com/), а также высокая сложность клиентского JavaScript-кода. Часто, в одном js-файле реализован функционал имеющих отношения к десяткам разных органов управления, никак не связанных между собой. Всё это сказывается на сложность сопровождения Front-End и надежности приложения в работе.

В случае, если web-приложение используется глобально, могут возникать различные проблемы доступа к сайту, в частности, долгое время загрузки артефактов из-за большого количества router-ов между пользователем и сервером. Чтобы решить эту проблему используются **Content Distribution Networks (CDN)** - сети кэширующих серверов. Услуги CDN-провайдеров могут быть платными для владельцев web-сайтов.

## Решение проблем при помощи фреймворков

Ключевым направлением развития web-разработки является использование фреймворков и библиотек помогающих в разделении web-приложения на изолированные, простые в сопровождении компоненты. Чаще всего подобные библиотеки реализуют подход под названием **Shadow DOM**, минимизируя влияние медленного механизма Document-Object Model (DOM) на пользовательский опыт. Ещё одной важной состовляющей фреймворков является встроенная поддержка инструментов Bundling-а и минификации кода.

На данный момент, доминирующими решениями являются:

1. Библиотека [React](https://ru.reactjs.org/) от Facebook. [Пример](reactappsample.md) простейшего React-приложения
2. Framework [Angular](https://angular.io/) от Google
2. [Vue.js](https://vuejs.org/), особенно популярная у китайский товарищей

Ключевые термины:

1. [WebPack](https://webpack.js.org/) - инструмент сборки web-приложений. Поддерживает огромное количество plug-ins
2. **Transpiler** - инструменты, преобразующие современный код ([TypeScript](https://www.typescriptlang.org/)/[CoffeeScript](https://coffeescript.org/)) в совместимый с конкретной целевой платформой
3. [Babel](https://babeljs.io/) - одна из наиболее популярных реализаций транспайлеров
4. **Polyfill** - JavaScript-код компенсирующий отсутствие в конкретной реализации JavaScript конкретных функциональных возможностей. Чаще всего применение polyfills приводит к некоторому падению производительности приложения. Дополнительная информация доступна [здесь](http://kangax.github.io/compat-table/es6/).
5. **Bundle** - единица доставки (distribution), в которую могут быть включено несколько файлов
6. **Preset** - готовые наборы предустановок для наиболее популярных особенностей языка 

Особую важность имеет **WebPack**, поскольку этот инструмент позволяет настроить среды отладки и промышленной сборки должным образом. Именно конфигурация WebPack определяет:

1. какой транспайлер будет использован, например: Babel (React), или TypeScript (Angular)
2. какая версии ECMAScript является целевой
3. какие полифилы должны быть подключены при выполнении кода в браузере
4. какой инструментарий должен быть запущен при отладке кода (**nodemon**?)
5. какие файлы и в какие bundles должны быть упакованы и каким loader-ом. Какой следует использовать алгоритм сжатия (**gzip**, **brotli compression**) и утилиту минификации

Чаще всего инструментальные средства конкретного фреймворка создают конфигурационные файлы для WebPack.

## Технологии Back-End

Посмотреть информацию о том, какие технологические стеки выбирают разные IT-компании можно на сайте [StackShare](https://stackshare.io/).

Первым узлом, который обрабатывает запросы браузера является web-сервер, который выполняет маршрутизацию запросов на сервер приложений. Разработчик web-приложения использует  некоторый Framework интегрированный с сервером приложений. Framework, обычно, содержит инструментальные средства для взаимодействия с базами данных, или другими сетевыми сервисами. Ниже приведены примеры технологических стэков для разработки Back-End.

|         Framework         |   Язык     |                    Web-сервер                    | База данных    |
|:-------------------------:|:----------:|:------------------------------------------------:|----------------|
| ASP.NET Core 3            |     C#     |       Internet Information Server и Kestler      | SQL Server     |
| Node.js                   | JavaScript |                Express.js, Koa.js                | mongoDB, Redis |
| Django, Flask             |   Python   |                                                  | MySQL          |
| Spring, Struts, Hibernate |    Java    | Nginx/Apache с Tomcat, Glassfish, Wildfly, Jetty | Oracle         |

Задача Framework состоит в том, чтобы доставить http-запрос в функцию, наиболее подходящую для его обработки. Для этого осуществляется настройка таблиц маршрутизации (Routing) в web-приложении. Основные различия между фреймворками состоят в том, какая именно модель используется для описания таблиц маршрутизации. Одной из наиболее популярных моделей является **Model-View-Controller** (MVC). В этой модели различают методы доступа к данным (чаще всего база данных, Model), методы управления обработкой http-запросов (Controller) и методы генерации HTML-кода (View). Контроллер является связующим звеном и изолирует методы отображения от методов работы с данными в базе.

Огромную важность представляют задачи обработки данных в СУБД. Различают два принципиально разных подхода: **реляционную модель** (SQL) и **NoSQL** (кэширующая база с иерархическим представлением данных). Реляционная модель отлично подходит для выполнения сложных запросов отбора данных, тогда как NoSQL обеспечивает великолепное время поиска слабо-структурированных данных. На практике встречаются комбинированные модели, в которых данные хранятся в SQL СУБД, но часть из них кэшируется в NoSQL (например, в Redis).

При использовании реляционной модели распространено два подхода, которые легко комбинируются: для выполнения запросов используется client-side SQL, либо используются **хранимые процедуры**, размещённые и исполняемые СУБД. В общем случае, хранимые процедуры обеспечивают значительно лучшую производительность, т.к. минимизируют сетевой трафик, данные находятся максимально близко, кэширование запросов на СУБД (**Execution plan**/план исполнения) выполняется. Тем не менее, разработка хранимых процедур - это отдельная компетенция, развитие которой может занимать годы (особенно в случае, если разработчик осуществляет анализ плана выполнения SQL-запросов и занимается оптимизацией структуры базы данных).

Несмотря на то, что многие web-приложения непосредственно формируют SQL-запросы, этот подход не считается оптимальным из-за высокой вероятности ошибок и избыточных действий. Обычно, за генерацию SQL-запросов отвечает специализированный framework - **Object-Relational Mapping (ORM)**. Современные ORM позвололяют описывать модель базы данных в терминах объектов языка программирования и обрабатывать результаты запросов, как контейнеры (списки, векторы, словари, и т.д.). Такой подход позволяет разработчикам без навыков работы с SQL использовать СУБД (на практике, конечно же, SQL знать нужно). К дополнительным функциям ORM можно отнести:

1. Контроль соответствия объектной модели в коде с фактической структурой таблиц в базе данных
2. Управление миграциями, т.е. создание скрипта обновления структуры таблицы в случае, если вышла новая версия приложения
3. Кэширование результатов запрос на client-side

Классическим примером ORM является Entity Framework для Microsoft ASP.NET.

Следует обратить внимание, на глубокую связь между языком программирования и СУБД. Не смотря на то, что кросс-платформенные связи возможно (приложение на C# может использовать MongoDB, а приложения Node.js может работать с традиционными SQL СУБД), тем не менее в случае использования "родного" инструментария эффективность решения значительно выше, чем кросс-платформенного. По этой причине, при выборе технологического стека следует рассматривать именно экосистемы, а не некоторый произвольным образом выбранные части одной большой головоломки.

### Особенности технологического стека Node.js

[Node.js](https://nodejs.org/en/) - это программная платформа, ключевыми компонентами которой является движок **V8** (осуществляющий трансляцию JavaScript-кода в машинный код) и Runtime, разработанного на C++. Бинарный код, полученный из JavaScript, выполняется всегда в одном потоке (основном), но блокирующие операции ввода-вывода Runtime исполняет в отдельных рабочих потоках. Как результат, обеспечивается высокая производительность приложений Node.js, в частности, web-сервера Express.

Ключевая особенность стека - фокус на модульности решений. Типовое приложение включает сотни и тысячи зависимостей (*dependencies*) от библиотек (*packages*). Для управления зависимостями используются специализированные инструменты - **package manager**-ы. Наиболее популярным package manager-ом является [npm](https://www.npmjs.com/). Постепенно набирает популярность [yarn](https://yarnpkg.com/), который считается более быстрым и надёжным.

Разработчики стремяться к уменьшению количества зависимостей, а также фокусировке каждого package на решении конкретной специализированной функции. В практическом плане, это приводит к постепенному переходу к более модульным и компактным продуктам. Так, например, самый популярный web-сервер [Express](https://expressjs.com/ru/) постепенно заменяется [Koa.js](https://koajs.com/), который разрабатывается той же группой программистов.

Наиболее популярной технологией хранения и поиска данных является NoSQL (Not only SQL). Популярная СУБД является [MongoDB](https://www.mongodb.com/). Часто в проектах используется **Object Document Mapper (ODM)** под названием [Mongoose](https://mongoosejs.com/).

Разработчики Node.js активно продвигают новый продукт [Deno](https://deno.land/) на замену Node.js. Акцент в Deno сделан на повышенной безопасности и поддержке **TypeScript**. Runtime в Deno написан на **Rust**.

### Особенности технологического стека ASP.NET Core 3

Основным языком программирования ASP.NET Core 3 является C#. Для описания шаблонов Html-страниц может использоваться Razor-синтаксис, который позволяет встраивать в верстку C#-код, при её генерации сервером. ASP.NET Core 3 поддерживает модель MVC.

Сильными сторонами ASP.NET Core 3 является встроенная поддержка ORM Entity Framework, позволяющая работать с базой данных, используя LINQ-запросы, обращаясь к СУБД, как к контейнеру объектов C#. Можно выбрать один из двух вариантов синтаксиса запросов.

Extension methods:

```csharp
var results = context.Contacts.SelectMany(c => c.SalesOrderHeaders)
    .OrderBy(c => c.SalesOrderDetails.Count)
    .Select(c => new { c.SalesOrderDetails.Count });
```

LINQ Syntax:

```csharp
IQueryable<SalesOrderDetail> query =
    from sale in context.SalesOrderDetails
    where sale.SalesOrderID == s
    select sale;
```

Из других удобных особенностей C#: поддержка Dependency Injection.

В качестве web-сервера рекомендуется использовать **Microsoft Internet Information Server**. Для отладки кода можно использовать встроенный сервер **Kestrel**.

Считается, что web-приложения на ASP.NET Core 3 обладают высокой производительностью и надёжностью.

Приложения ASP.NET Core 3 могут работать как под Windows, так и под Linux (Apache).

### Особенности технологического стека Java

Сильная сторона Java - огромное количество мощных библиотеки, мощная эко-система.

Ключевой библиотекой для взаимодействия с базой данных является [Hibernate ORM](http://hibernate.org/orm/).

[Apache Struts](https://struts.apache.org/) - фреймворд для разработки web-приложений с использованием шаблона проектирования MVC.

Набор библиотек [Spring](https://spring.io/) содержит множество инструментов, исключительно эффективных для разработки корпоративных приложений: Serverless, Cloud, Microservices, Reactive, Event Driven.

Рекомендуется к прочтению статья [Top 10 Libraries every Java Developer should know](https://towardsdatascience.com/top-10-libraries-every-java-developer-should-know-37dd136dff54).

# Шаблоны проектирования

При разработке web-приложений шаблоны проектированию применяются порой, существенно чаще, чем при разработке приложений других типов.

## CRUD и RESTful

Акроним расшифровывается как Create, Read, Update, Delete/Destroy и ссылается на четыре наиболее универсальных операций работы с, практически, с любой сущностью. Под сущностью подразумевается некоторое понятие из конкретной прикладной области, например: пользователь, счёт в банке, запись в блоге.

С CRUD тесно связано шаблон проектирования RESTFul, который выполняет mapping HTTP Routes и CRUD. Шаблон является универсальным, с ним знакомо большинство пользователей и в большинстве случаев, web-разработчиком достаточно перечислить список сущностей, чтобы понять ожидаемых результат, объём работы и её сложность.

Пример определения HTTP Routes для сущности "собака" в RESTful:

| Команда |    Пример URL   | HTTP Verb |                         Описание                         |
|:-------:|:---------------:|:---------:|:--------------------------------------------------------:|
|  Index  | /dogs           |    GET    | Вывести список всех собак                                |
|   New   | /dogs/new       |    GET    | Вывести форму для ввода данных о новой собаке            |
|  Create | /dogs           |    POST   | Добавить новую собаку в базу данных                      |
|   Show  | /dogs/:id       |    GET    | Показать информацию об одной собаке                      |
|   Edit  | / dogs/:id/edit |    GET    | Показать форму для редактирования информации о собаке    |
|  Update | /dogs/:id       |    PUT    | Обновить данные о собаке, а потом перейти куда-нибудь    |
| Destroy | /dogs/:id       |   DELETE  | Удалить информацию о собаке, а потом перейти куда-нибудь |

## MVC

Акроним расшифровывается как **Model-View-Controller**. Шаблон рекомендуется отделять модель (способ представления и хранения данных) от view - уровня представления (пользовательский интерфейс). Связующим звеном является Controller, в котором, чаще всего выполняется бизнес логика. Уровень представления генерирует события, которые обрабатываются контроллером, контроллер обращается за данными к Model и передаёт эти данные во View для формирования пользовательского интерфейса.

Шаблон позволяет достаточно легко реализовывать схемы, в рамках одной системы может существовать несколько разных пользовательских интерфейсов (например, для web и для мобильных устройств). Также, модификация структуры данных, или переход на другую СУБД является существенно менее сложной задачей, чем в случае, если разделение на уровни не осуществляется.

# Инструментальные средства для web-разработки

Наиболее универсальный IDE со множеством plug-in-ов [Microsoft Visual Studio Code](https://code.visualstudio.com/).

Популярный HTML/CSS редактор с поддержкой Zen-программирования - [Sublime Text 3](https://www.sublimetext.com/3). Под Zen-программированием подразумевается возможность частичного ввода информации и автоматической генерации html-тэгов при нажатии кнопки <Tab>. Например, для текста: `div.worker` при нажатии на кнопку <Tab> будет сформирована следующая html-разметка:

```html
<div class="worker"></div>
```

Мета-язык Zen Coding может быть достаточно комплексным и при наличии навыков, кратно ускорять разработку html-верстки. См. также [Emmet](https://packagecontrol.io/packages/Emmet).

Платный, но очень мощный инструмент - [JetBrains WebStorm](https://www.jetbrains.com/webstorm/).

Существует огромное количество облачных IDE. Для примера: [GitPod](https://www.gitpod.io/), [CodeAnywhere](https://codeanywhere.com/) и [Github Codespaces](https://github.com/features/codespaces). Облачное средство прототипирования и экспериментирования - [CodePen](https://codepen.io/).

# Осталось "за кадром"

[Gatsby.js](https://www.gatsbyjs.com/) - генератор статических сайтов. Ключевая идея: сайт генерируется с использованием базы данных и шаблонов периодически, например, раз в сути, по ночам. Все артефакты являются окончательно сформированными (минимизированными, сжатыми). Вычислительные ресурсы сервера используются максимально эффективно, скорость работы сайта - максимально высокая.

[Next.js](https://nextjs.org/) - популярный фреймворк для Server-Side Rendering. Основывается на React.js.

# Дополнительная информация

Почему [Heroku](heroku.md) так важен для web-разрабочика.

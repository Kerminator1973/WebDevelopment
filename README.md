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

В крупных проектах возникает проблема избыточных CSS, которая влияет как на объём передаваемых по сети данных, так и на простоту сопровождения web-приложения. Для решения проблемы можно использовать специализированные пред-процессоры SaSS/SCSS, [LESS](http://lesscss.org/), [Stylus](https://stylus-lang.com/) и другие. [Syntactically Awesome Stylesheets (SASS)](http://sass-lang.com/) является одним из наболее популярных инструментов для описания каскадных таблиц с элементами языка программирования. Пример определения каскадных таблиц на **SCSS** - новой версии SaSS:

```sass
$font-stack:    Helvetica, sans-serif
$primary-color: #333
body
    font: 100% $font-stack
    color: $primary-color
```

**Динамическое поведение** (JavaScript), преимущественно отвечает за взаимодействие с сервером. В случае применения парадигмы Single Page Application (**SPA**), значение JavaScript значительно шире - он начинает управлять состоянием приложения, переходами между логическими экранами, обеспечивает информационную безопасность, и т.д.

Из-за использования пользователями разных браузеров и их разных версий, существует проблема технологической фрагментации - какие-то технологические возможности могут быть недоступны конкретному пользователю. Чтобы решить подобные проблемы обычно используются вспомогательные инструменты/библиотеки. В течение долгого времени, доминировала библиотека [jQuery](https://jquery.com/), жизненный цикл которой приближается к концу (основные проблемы: медленная, провоцирует к захламлению scope идентификаторов HTML-объектов). В некоторых случаях, разработчики используют ["чистый" JavaScript](http://youmightnotneedjquery.com/), т.н. *Vanilla JavaScript*. Для проверки применимости некоторой функции в конкретном браузере может быть использован ресурс [CanIUse](https://caniuse.com/).

В последние годы появляется много приложений поддерживающих **The WebSocket Protocol**. Его ключевое отличие от http состоит в том, что WebSocket является двунаправленным протоколом с постоянно установленным соединением. Это значит, что при необходимости отправки сообщения не нужно выполнять handshake, а сервер может отправить сообщение любому из активных web-приложений, исполняющихся в браузере, в произвольный момент времени. Этот протокол позволят динамически обновлять HTML-контент со стороны сервера. Наиболее популярными библиотеками для работы с WebSocket являются [Socket.io](https://socket.io/) и [SignalR](https://github.com/SignalR/SignalR).

## Альтернативы JavaScript

Основными ограничениями JavaScript на клиентских компьютерах считаются: однопоточность и тот факт, что JavaScript - интерпретируемый язык программирования. Влияение этих факторов может быть минимальным благодаря тому, что многопоточность поддерживается в runtime и благодаря этому, например, клиентский JavaScript может выполнять несколько http(s) запросов одновременно. То же самое можно сказать и о производительности - до того момента, пока JavaScript не используется для выполнения задач с высокой вычислительной нагрузкой (они выполняются Runtime, либо посредством ActiveX, либо посредством кода в host-приложении), проблем с производительностью быть не должно.

Если же необходимо выполнить высокую вычислительную нагрузку непосредственно в клиентском коде, альтернативой JavaScript может выступать технология **WebAssembly**. Эта технология поддерживается современными браузерами и существуют инструменты, которые позволят разрабатывать соответствующий клиентский код. В первую очередь это [Microsoft Blazor](https://dotnet.microsoft.com/apps/aspnet/web-apps/blazor) и [Qt for WebAssembly](https://doc.qt.io/qt-5/wasm.html).

## Основные проблемы web-приложений

Одним из наиболее критичных ограничений, связанных с работой web-приложений является канал связи между клиентским компьютером (браузером) и сервером. На пользовательский опыт крайне негативно влияют: **полоса пропускания** (какой объём данных может быть загружен за единицу времени) и **латентность** сети (как быстро будет получен ответ на запрос, без учёта потерь на подготовку ответа сервером).

Чтобы обеспечить конфортное использование приложения пользователем, необходимо минимизировать объём передаваемой информации и делать это только при необходимости.

Различают два подхода в организации пользовательского интерфейса: [server-side rendering](server-side-rendering.md) и [client-side rendering](client-side-rendering.md). В первом случае, основная работа по формированию пользовательского интерфейса осуществляется на сервере, т.е. максимально близко к базам данных. Во-втором случае, сервер нагружается существенно меньше, а формирование пользовательского интерфейса осуществляется браузером на основании накопленных (или уточнённых у сервера) данных. Выбор в пользу использования того, или иного подхода зависит от особенностей конкретной задачи.

Чтобы уменьшить количество запросов на сервер (в том числе, статических данных) используются:

1. Bundling - объединение разнородных ресурсов в один (или несколько) загружаемый файл. Пример объединения нескольких SVG-файлов в один, доступен [здесь](svg-bundling.md)
2. Minifying - реструктуризация JavaScript/CSS-кода с целью устранения избыточностей. Из кода могут быть удалены комменатрии, переменные могут быть переименованы
3. Client Side Caching - кэширование данные на стороне клиента

К проблемам разработки web-приложений могут быть отнесены: различные функциональные возможности клиентских браузеров, см. [CanIUse](https://caniuse.com/), а также высокая сложность клиентского JavaScript-кода. Часто, в одном js-файле реализован функционал имеющих отношения к десяткам разных органов управления, никак не связанных между собой. Всё это сказывается на сложность сопровождения Front-End и надежности приложения в работе.

Также значимой проблемой может быть использование разных версий JavaScript как в браузере, так и на серверной стороне. Похожая проблема существует и при использовании разных версий Node.js, которые поддерживают разные версии и свойства ECMAScript (JavaScript). Возможное решение проблемы - применение транспайлинга кода, т.е. его трансляции в JavaScript-код, совместимый с целевой системой.

В случае, если web-приложение используется глобально, могут возникать различные проблемы доступа к сайту, в частности, долгое время загрузки артефактов из-за большого количества router-ов между пользователем и сервером. Чтобы решить эту проблему используются **Content Distribution Networks (CDN)** - сети кэширующих серверов. Услуги CDN-провайдеров могут быть платными для владельцев web-сайтов.

Потенциально критичная проблема - слабое управление кэшированием объектов, в частности, javascript-кода. При публикации новой версии приложения, при загрузке нового HTML-файла может использовать JavaScript-код из кэша, что может привести к фатальным ошибкам в коде. Для решения проблемы, URL для загрузки компонента (js, css) может содержать либо версию сборки, либо случайное значение, обновляемое при публикации новой версии.

## Решение проблем при помощи фреймворков

Ключевым направлением развития web-разработки является использование фреймворков и библиотек помогающих в разделении web-приложения на изолированные, простые в сопровождении компоненты. Чаще всего подобные библиотеки реализуют подход под названием **Shadow DOM**, минимизируя влияние медленного механизма Document-Object Model (DOM) на пользовательский опыт. Ещё одной важной состовляющей фреймворков является встроенная поддержка инструментов Bundling-а и минификации кода.

На данный момент, доминирующими решениями являются:

1. Библиотека [React](https://ru.reactjs.org/) от Facebook. React - это ядро. Для создания полноценных приложений нужны вспомогательные *3d party* компоненты. [Пример](reactappsample.md) простейшего React-приложения.
2. Framework [Angular](https://angular.io/) от Google. Бывший лидер. Проблемы с SEO. Особенность - все необходимые компоненты уже встроены во Framework
3. [Vue.js](https://vuejs.org/), Легковесный. Особенно популярный у китайский товарищей. *Evan You* - один из разработчиков Angular.js
4. [Svelte](https://svelte.dev/). Особенность - предварительная компиляция кода с целью ускорить время старта и общую производительность web-приложения

В простых приложениях могут быть использованы mini-frameworks, которые использую Shadow DOM для решения одной специализированной задачи, например, для управления отображением, фильтрацией, сортировкой и поиском данных в таблице. Пример такой специализированной библиотеки - [DataTables.net](https://datatables.net/).

Ключевые термины:

1. [WebPack](https://webpack.js.org/) - инструмент сборки web-приложений. Поддерживает огромное количество plug-ins
2. **Transpiler** - инструменты, преобразующие современный код ([TypeScript](https://www.typescriptlang.org/)/[CoffeeScript](https://coffeescript.org/)) в совместимый с конкретной целевой платформой
3. [Babel](https://babeljs.io/) - одна из наиболее популярных реализаций транспайлеров
4. **Polyfill** - JavaScript-код компенсирующий отсутствие в конкретной реализации JavaScript конкретных функциональных возможностей. Чаще всего применение polyfills приводит к некоторому падению производительности приложения. Дополнительная информация доступна [здесь](http://kangax.github.io/compat-table/es6/).
5. **Bundle** - единица доставки (distribution), в которую могут быть включено несколько файлов
6. **Preset** - готовые наборы предустановок для наиболее популярных особенностей языка 
7. **HTML Preprocessor** - компонент, осуществляющий генерацию HTML-верстки, используя шаблоны документов

Особую важность имеет **WebPack**, поскольку этот инструмент позволяет настроить среды отладки и промышленной сборки должным образом. Именно конфигурация WebPack определяет:

1. какой транспайлер будет использован, например: Babel (React), или TypeScript (Angular)
2. какая версии ECMAScript является целевой
3. какие полифилы должны быть подключены при выполнении кода в браузере
4. какой инструментарий должен быть запущен при отладке кода (**nodemon**?)
5. какие файлы и в какие bundles должны быть упакованы и каким loader-ом. Какой следует использовать алгоритм сжатия (**gzip**, **brotli compression**) и утилиту минификации
6. каким образом должны быть сформированы имена клиентских файлов (css и js) для того, чтобы при их изменении на сервере, браузер не забрал ранее локально закэшированные файлы

Чаще всего инструментальные средства конкретного фреймворка создают конфигурационные файлы для WebPack.

## Информационная безопасность

При разработке web-приложений, чаще всего приходится решать задачи, связанные и информационной безопасностью, к которым относятся:

1. Аутентификация пользователя
2. Управление сессионной информацией
3. Подтверждение достоверности сервера и клиента

В различных технологических стеках используются разные инструменты, но схожие подходы. Говоря об аутентификации пользователя критически важным является хранение на сервере пароля пользователя как **хэш-кода**, а не plain text. Это связано с тем, что подавляющее число пользователей используют одни и те же **credentials** (пару логин/пароль). Соответственно, при компрометации базы с пользовательскими данными, злоумышленники пробуют похищенные credentials на множестве крупных сайтов и это часто приводит к взлому аккаунтов, в том числе, в банковских системах.

При вычислении хэш-кода должно подмешиваться случайное значение (часто такое значение называется *salt*, и хранится в отдельном поле записи о пользователе), а сама операция может состоять из нескольких операций вычисления хэша (*the number of rounds*, часто устанавливают в значение восемь).

Важно знать, что вычисление хэш-кода является односторонней криптографической операцией (*one-way algorithm*), что означает, что можно вычислить хэш-код для пароля, но нельзя вычислить пароль по хэш-коду. Примером алгоритма для вычисления хэш-кода является **SHA512**.

Для управления сессионной информацией чаще всего используется JSON Web Token (**JWT**) - блок данных, которых состоит из заголовка, полезной нагрузки и хэш-кода (электронно цифровой подписи). После проверки пароля, сервер формирует JWT и возвращает его клиенту (JavaScript-коду исполняемому в браузере). Клиентское приложение сохраняет этот код в localStorage браузера и при каждом следующей запросе на сервер добавляет его в MIME-заголовок https-запроса. Сервер проверяет созданным его же ключами JWT и либо выполняет, либо отклоняет запрос. Чаще всего у JWT установлен период действия, при истечении которого JWT считается нелегитимным. Сервер может передать клиенту новый JWT, если посчитает это возможным. В рамках подхода считается, что злоумышленник не сможет получить доступ к localStorage конкретного пользователя.

Для проверки достоверности клиента и сервера может осуществляться односторонняя, или двухсторонняя аутентификация. Для проведения аутентификации используется **ассиметричная криптография**. Ключевые слова: сертификаты, корневой сертификат, SSL, TLS, Cipher Suite.

# Типы команд разработчиков и архитектурных шаблонов

Web-программирование это комбинация ПО работающего на клиентском компьютере (чаще всего - код исполняется браузером) и серверного ПО. Различают несколько архитектурных шаблонов:

**Monolith** - в этом типе архитектур, программисты обычно являются _full-stack developers_. Они разрабатывают и front end, и back end. Такой тип команд считается наиболее ортодоксальным.

**FE/BE** - разные группы инженеров отвечают за разработку front end и back end. Специализация позволяет создавать более сложные системы, но ценой больших затрат на команду и командное взаимодействие.

**Microservices** - в этом подходе система разделяет на целый ряд связанных, но слабо сцепленных сервисов, каждый из которых может разрабатываться отдельной командой. В этом случае, логика системы в целом может быть очень сложной. Простота интеграции достигается в том случае, если декомпозиция сервисов оказалось удачной (_fine-grained_).

**Micro frontends** - разные команды занимаются не только разными сервисами, но и разными задачами в области front-end. Этот подход способен ещё больше повысить сложность системы в целом.

В статье [What Are Micro Frontends? Is It Even Necessary to Use Them?](https://medium.com/better-programming/what-are-micro-frontends-is-it-even-necessary-to-use-them-f1393d65ef2f) Harsha Vardhan эта тема рассматривается подробнее.

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

Ключевая особенность стека - фокус на модульности решений. Типовое приложение включает сотни и тысячи зависимостей (*dependencies*) от библиотек (*packages*). Для управления зависимостями используются специализированные инструменты - [менеджеры зависимостей npm и yarn](npm-vs-yarn.md).

Разработчики стремяться к уменьшению количества зависимостей, а также фокусировке каждого package на решении конкретной специализированной функции. В практическом плане, это приводит к постепенному переходу к более модульным и компактным продуктам. Так, например, самый популярный web-сервер [Express](https://expressjs.com/ru/) постепенно заменяется [Koa.js](https://koajs.com/), который разрабатывается той же группой программистов. По ссылке доступна [статья](express.md) с описанием основных возможностей Express.

Следует заметить, что огромное community и доступность сотен тысяч open-source библиотек делают эко-систему Node.js и JavaScript фантастически популярной. В значительной степени, успешность разработки web-приложения на Node.js зависит от разумно выбранных шаблонов и подходящих к шаблонам, надёжных библиотек.

Наиболее популярной технологией хранения и поиска данных является NoSQL (Not only SQL). Популярная СУБД является [MongoDB](https://www.mongodb.com/). Часто в проектах используется **Object Document Mapper (ODM)** под названием [Mongoose](https://mongoosejs.com/). Вместе с тем, с ORM для реляционных баз данных всё тоже прекрасно. Популярные ORM: [Sequelize](https://sequelize.org/), [TypeORM](https://typeorm.io/#/), [Bookshelf](https://bookshelfjs.org/) и [Objection](https://vincit.github.io/objection.js/).

Райян Даль, создатель Node.js осуществляет разработку нового продукта [Deno](https://deno.land/). С сильными и слабыми сторонами обоих *runtimes* можно [ознакомиться здесь](deno.md).

Для повышения производительности, могут быть использованы native-библиотеки, компирирующиеся из C/C++. Для сборки часто используется специальный модуль [node-gyp](https://www.npmjs.com/package/node-gyp).

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

В качестве web-сервера рекомендуется использовать **Microsoft Internet Information Server**. Для отладки кода можно использовать встроенный сервер **Kestrel**. Статья по настройке IIS и SQL Server доступна [здесь](iis.md).

Считается, что web-приложения на ASP.NET Core 3 обладают высокой производительностью и надёжностью.

Приложения ASP.NET Core 3 могут работать как под Windows, так и под Linux (Apache).

### Особенности технологического стека Java

Сильная сторона Java - огромное количество мощных библиотеки, мощная эко-система. Основной разработчик Java - корпорация Oracle, поставляет два **Java Development Kit** (JDK): платный, надежный, с длительным циклом поддержки (LTS) **Oracle JDK** и бесплатный экспериментальный **Open JDK**. Статья [За Oracle JDK нужно будет платить. Какие теперь варианты?](https://habr.com/ru/company/epam_systems/blog/430084/).

Ключевой библиотекой для взаимодействия с базой данных является [Hibernate ORM](http://hibernate.org/orm/).

[Apache Struts](https://struts.apache.org/) - фреймворк для разработки web-приложений с использованием шаблона проектирования MVC.

Набор библиотек [Spring](https://spring.io/) содержит множество инструментов, исключительно эффективных для разработки корпоративных приложений: Serverless, Cloud, Microservices, Reactive, Event Driven.

Рекомендуется к прочтению статья [Top 10 Libraries every Java Developer should know](https://towardsdatascience.com/top-10-libraries-every-java-developer-should-know-37dd136dff54).

## Serverless Backend

Одним из популярных направлений разработки Backend является Serverless. Основная идея состоит в делегировании функций управления ресурсами провайдеру облачных услуг. Наиболее популярными являются [Google Firebase](https://firebase.google.com/) и [AWS Lambda](https://aws.amazon.com/ru/lambda/).

Приложение использует предоставленный облачным провайдером SDK, либо REST API для выполнения типовых задач:

1. Аутентификация пользователей
2. Сохранение данных в базе (чаще всего NoSQL)
3. Хранение статических файлов (Hosting)
4. Системы машинного обучения

Компания, разрабатывающая мобильное, или web-приложение не создаёт серверов – она использует SDK, а обработка запросов, масштабирование (развертывание дополнительных instances) выполняются самой платформой (Firebase, AWS).

В случае использования AWS Lambda, или Firebase Cloud Functions – могут быть разработаны специализированные функции, выполняющиеся на сервере, что позволяет добавить функционал, изначально отсутствующий у облачных провайдеров.

Достоинства:

1. Отличное масштабирование
2. Высокая надёжность (не так для Firebase Realtime Database)
3. Очень лёгкая интеграция сервисов в клиентское ПО
4. Огромное разнообразие сервисов аутентификации

Недостатки:

1. Оплата по факту использованных ресурсов – можно легко выйти за бюджет и даже разориться, из-за небольших недоработок в коде
2. Высокая, фактическая, стоимость – в том числе, есть неявные статьи расходов, которые сложно запланировать, не имея значительного опыта в использовании сервисов
3. В России отсутствуют центры обработки данных Amazon, Microsoft и Google. Время отклика хуже, чем в развитых странах мира
4. Возможно введение «цифрового железного занавеса» с любой из сторон (санкции США, либо блокировки РосКомНадзора)

Важные термины:

**Federated Identity** – это возможность выполнять аутентификацию пользователя по его/её логину в других крупных системах (Google, Apple, Facebook, Twitter, GitHub, Microsoft).

**Provisioning Resources** – выделение/предоставление ресурсов.

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

Критика REST API: в следующих случаях использование REST API затруднено:

1. Большое количество операций Upload (они вообще не рассматриваются в схеме)
2. Случаи, когда пользовательявным образом указывает уникальный идентификатор ресурса при его создании
3. При использовании групповых операций, которые REST API вообще не рассматривает

## MVC

Акроним расшифровывается как **Model-View-Controller**. Шаблон рекомендуется отделять модель (способ представления и хранения данных) от view - уровня представления (пользовательский интерфейс). Связующим звеном является Controller, в котором, чаще всего выполняется бизнес логика. Уровень представления генерирует события, которые обрабатываются контроллером, контроллер обращается за данными к Model и передаёт эти данные во View для формирования пользовательского интерфейса.

Шаблон позволяет достаточно легко реализовывать схемы, в рамках одной системы может существовать несколько разных пользовательских интерфейсов (например, для web и для мобильных устройств). Также, модификация структуры данных, или переход на другую СУБД является существенно менее сложной задачей, чем в случае, если разделение на уровни не осуществляется.

# Reverse Proxy

В промышленных системах web-приложения доступны не напрямую, а через так называемые [Reverse Proxy](https://medium.com/intrinsic/why-should-i-use-a-reverse-proxy-if-node-js-is-production-ready-5a079408b2ca). Это делается по нескольким причинам:

1. Защищённость системы: за зващиту отвечает специализированные инструмент
2. Reverse Proxy работает с сертификатами безопасности и выполняет архивирование ответа сервера (эффективность reverse proxy может быть выше на 15-50%)
3. Осуществляется проверка и подмена полей http-запросов в MIME-заголовке
4. Повышенная производительность и надёжность: Reverse Proxy может распределять запрос между несколькими worker-ами (например, между несколькими копиями Node.js)

Резюмируя: использование Reverse Proxy позволяет увеличить производительность системы в целом, а также улучшить её безопасность.

В качестве таких прокси часто используются Microsoft Internet Information Server, [nginx](https://nginx.org/ru/) и [HAProxy](http://www.haproxy.org/).

На официальном сайте **nginx** доступна бесплатная книга о защите web-приложений от внешних атак.

# Инструментальные средства для web-разработки

## Visual Studio Code (с Plug-Ins)

Наиболее универсальный IDE со множеством plug-in-ов [Microsoft Visual Studio Code](https://code.visualstudio.com/). Мои любимые Plug-Ins:

1. [Bookmarks](https://marketplace.visualstudio.com/items?itemName=alefragnani.Bookmarks) by Alessandro Fragnani
2. [Bracket Pair Colorizer 2](https://marketplace.visualstudio.com/items?itemName=CoenraadS.bracket-pair-colorizer-2) by CoenraadS
3. [Material Icon Theme](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme) by Philipp Kief
4. [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
5. [Tabnine Autocomplete AI](https://marketplace.visualstudio.com/items?itemName=TabNine.tabnine-vscode) by Tabnine

Дополнительно рекомендуется установить параметры:

1. Шрифт для редактора VSCode - **FireCode** (с поддержкой лигатур). Доступен на [Google Fonts](https://fonts.google.com/specimen/Fira+Code?query=Fira+Code).
2. Убрать Mini-Map, который загромождает экран. **Текстовый редактор -> Мини-Карта -> Enabled** установить в False
3. Автоматическое сохранение кода при переходе из VSCode в другое окно: **Текстовый редактор -> Файлы -> Auto Save** установить в onWindowChange
4. Не выводить сообщение о превышении длины комментария при commit-е в GitHub на 50-ом символе. **Расширения -> Git -> Input Validation Subject Length** установить в 72

## Sublime Text 3

Популярный HTML/CSS редактор с поддержкой Zen-программирования - [Sublime Text 3](https://www.sublimetext.com/3). Под Zen-программированием подразумевается возможность частичного ввода информации и автоматической генерации html-тэгов при нажатии кнопки <Tab>. Например, для текста: `div.worker` при нажатии на кнопку <Tab> будет сформирована следующая html-разметка:

```html
<div class="worker"></div>
```

Мета-язык Zen Coding может быть достаточно комплексным и при наличии навыков, кратно ускорять разработку html-верстки. См. также [Emmet](https://packagecontrol.io/packages/Emmet). Доступен [Plug-In](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.ZenCoding) для Visual Studio.

## Другие инструменты

Платный, но очень мощный инструмент - [JetBrains WebStorm](https://www.jetbrains.com/webstorm/).

Существует огромное количество облачных IDE. Для примера: [GitPod](https://www.gitpod.io/), [CodeAnywhere](https://codeanywhere.com/) и [Github Codespaces](https://github.com/features/codespaces). Облачное средство прототипирования и экспериментирования - [CodePen](https://codepen.io/).

Исключительно важным продуктом для отладки REST API является [Postman](https://www.postman.com/). Этот продукт позволяет, посредством GUI, сконструировать любой http(s) запрос и проанализировать полученный результат. Продукт считается индустриальным стандартом. Схожий функционал есть у консольного приложения [CURL](https://curl.haxx.se/), но в этом продукте нет такого мощного и удобного графического пользовательского интерфейса, как у Postman.

# Осталось "за кадром"

[Gatsby.js](https://www.gatsbyjs.com/) - генератор статических сайтов. Ключевая идея: сайт генерируется с использованием базы данных и шаблонов периодически, например, раз в сути, по ночам. Все артефакты являются окончательно сформированными (минимизированными, сжатыми). Вычислительные ресурсы сервера используются максимально эффективно, скорость работы сайта - максимально высокая.

[Next.js](https://nextjs.org/) - популярный фреймворк для Server-Side Rendering. Основывается на React.js.

# Дополнительная информация

## Heroku

Почему [Heroku](heroku.md) так важен для web-разработчика.

## Favicon

Что такое **Favicon**, на отсутствие которой ругается Google Chrome в Developer Console (F12)?

```
.../favicon.ico Failed to load resource: the server responded with a status of 404 (Not Found)
```

Это иконка вашего web-приложения, которую браузер отображает в закладке (Page Tab).

## OpenJS Foundation

[Организация](https://openjsf.org/projects/) которая стоит за множеством популярных ориентированных на JavaScript-проектов, в том числе: jQuery, Node.js, Express и т.д.

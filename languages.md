# Почему нельзя создать только один универсальный язык программирования

Язык программирования является набором правил, позволяющих описать реализацию концепцию типового приложения. Различаются именно концепции типового приложения, определяющие набор применяемых шаблонов (моделей).

К основным шаблонам (моделям) можно отнести:

- модель управления памятью (ручная, сборка мусора)
- модель владения объектами (свободная, явное владение)
- модель многопоточности: явная поддержка многопоточности, поддержка "зелёных"-потоков (tasks)
- поддержка парадигмы ООП
- поддержка обобщённого программирования
- модель интеграции с библиотеками, разработанными на других языках программирования
- полнота реализации runtime. Например, в C++ runtime минимальный, что облегчает перенос приложений на другие платформы. В C\# runtime полный, что удобно с точки зрения разработки прикладного кода
- типизация (строгая, слабая, не явная - имеется ввиду выведение типа)
- компактность Runtime. Компактный Runtime можно использовать на микроконтроллерах (MicroPython), либо в облачных лямбда-функциях
- поддержка интроспекции, удобство анализа приложения внешними инструментами
- особенности инструментальных средств, например, IDE выводит результаты type inference прямо в редактор исходных текстов, или linting работает "из коробки" и в обязательном порядке выводится при компиляции приложения

Не основные, но важные шаблоны это:

- разнообразие синтаксического сахара
- dependency injection / внедрение зависимостей
- система управления модулями (например: cargo, npm, NuGet, никакая)
- streams - API, которые позволяют выполнять полный цикл обработки блока данных (chunk), без необходимости сохранения всех результатов работы очередного этапа в буфере
- Zero Cost Abstractions (это особенность C++, в которой акциент сделан именно на том, что высокоуровневый код работает с такой же производительностью, как и низкоуровневый)
- возможность изменения полей объекта в стороннем коде. Например, в C++ можно запретить изменение объекта передаваемого в некоторый класс используя модификатор **const**, а в JavaScript этого сделать нельзя и для защиты полей объекта приходится использовать _defensive copy_, т.е. передавать во "враждебный" код не сам объект, а лишь его копию, которая будет уничтожена после вызова
- возможности по предобработке данных на этапе компиляции: макросы и атрибутированный код

Выбор варианта реализации модели является критически влияет на язык программирование и его годность для разработки конкретных типов приложений. Лучшего варианта не существует, т.к. для некоторых приложений прекрасно подходит сбощик мусора, но для других приложений его использование может быть недопустимым.

При оценке языка программирования следует принимать во внимание систему управления пакетами, а также наличие альтернативных компиляторов/Runtimes.

Кроме этого, у языков программирования могут быть и негативные особенности, которых не удалось избежать при проектировании языка:

- конструкции, которые могут сильно влиять на эффективность работы системы в целом, из-за чрезмерного использования ОЗУ, или процессорного времени. Например, побочные эффекты могут проявляться в случае чрезмерного использования async/await, замыканий/включения внешнего контекста в лямбда-функции, _variadic arguments_
- конструкции, создающие трудноуловимые ошибки, или критически влияющие на когнитивную сложность кода. Пример: переопределение операторов позволяет создавать "умные переменные" для контроля допустимого диапазона значений, для нейтрализации которых может потребовать сгенерировать ассемблерный код и проанализировать его

## Си/C++

Управление выделением памяти "вручную", через менеджер памяти. Модель владения объектами - свободная. Многопоточность уровня операционной системы.

В Си не поддерживается ни ООП, ни обобщённое программирование. В C++ поддерживаются оба.

Строгая типизация.

Ответ на критику C++ приведён в статье [Страуструп ответил на призыв Белого дома США переходить на языки с безопасностью памяти](https://habr.com/ru/news/801525/). Основные тезисы:

- C++ — это не C
- C++ далеко продвинулся с 1979 года. Качественный код на С++ пишут с применением концепции RAII (Resource Acquisition Is Initialization, получение ресурса есть инициализация), контейнеров и умных указателей, а не «традиционной мешанины указателей C»
- Понимание безопасности не всегда корректно. Из миллиардов строчек кода на C++ лишь небольшая доля полностью следует современным рекомендациям безопасности, а сообщество по-разному оценивает, какие аспекты безопасности важны

Большое количество альтернативных компиляторов от крупных вендоров (Microsoft, Intel, open-source gcc).

## Rust

Можно (условно) утверждать, что Rust - духовный наследник Си, с обобщённым кодом и мощным Runtime (Crate).

Управление памятью "вручную", но ввиду поддержки модели явного владения, программист не обязан управлять выделением памяти.

Фокус языка смещён именно на *objects ownership*.

Компилятор генерирует нативный код для разных платформ и по эффективности нативного кода близок к C++.

В языке реализованы мощные инструменты выполняения вычислений и обработки данных на этапе компиляции: макросы и атрибутированный код.

## JavaScript

Автоматический сборщик мусора.

Пользовательский код однопоточный, но Runtime - многопоточный, уровня операционной системы. Пользовательская многопоточность значительно снижает сложность разработки concurrency-кода, а асинхронное выполнение обеспечивает высокую утилизацию вычислительных ресурсов. Однако, на JavaScript крайне сложно поддерживать аппаратную многопоточность на уровне пользовательского кода.

ООП поддержан слабо. Обобщённого кода, практически нет.

Синтаксический сахар поддерживается на уровне транспайлеров, в частности - TypeScript. Важно отметить, что существует несколько разных транспайлеров.

## C\#

Автоматическая сборка мусора.

Многопоточность - уровня операционной системы, а также т.н. *green threads* (Tasks) уровня Runtime. Поддержка green threads сделана очень эффективно, что позволяет не только обеспечить высокую степень утилизации вычислительных ресурсов, но и распределять эту нагрузку по разным ядрам процессора.

Очень мощный синтаксический сахар, в частности, поддержка **LINQ query comprehension syntax**, которая позволяет писать код, который выглядит очень похоже на SQL в коде на C\#.

ООП и обобщённое программирование поддерживаются, но на минималках.

## Java

Практически то же самое, что и C\#, но с более консервативным синтаксисом.

## Python

Автоматическая сборка мусора.

Пользовательский код однопоточный. Ownership - не поддерживается.

ООП - зачаточное состояние. Обобщённое программирование не поддерживается.

Слабая типизация.

Однако, цель Python в другом - он использует внешние библиотеки, наиболее важные из которых разработаны на C++ (см. Boost.Python). Это позволяет разрабатывать очень простой пользовательский код, который использует очень быстрые библиотеки. Пример: Python и Machine Learning.

## Направления развития в экосистема языка программирования

Изучая языки программирования следует обратить внимание на следующие области знаний:

- синтаксис языка
- история развития - отличия стандартов языка
- tooling
- стандартные библиотеки
- шаблоны проектирования

Не обязательным, но полезным могут быть такие навыки, как:

- разработка собственных и сопровождение чужих библиотек
- эффективное программирование алгоритмов

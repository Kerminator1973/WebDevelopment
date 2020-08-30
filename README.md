# Что такое web-разработка

Под термином web application часто подразумевают приложение, доступное через браузер. Пользователь запускает Google Chrome, Firefox, или Microsoft Edge, вводит адрес этого приложения (URL), браузер подключает к серверу, загружает какие-то данные и начинает их обрабатывать, отображая результат в своем окне.

Для получения результата – отображения данных некоторую работу по формированию данных выполняет сервер и некоторую работу по отображению данных выполняет браузер, используя ресурсы компьютера клиента. Технологический стек, используемый для разработки приложения на сервере и отображения информации в браузере, могут быть разными. Типы решаемых задач так же различаются: сервер получает данные из разных источников (базы данных, файлы с шаблонами, другие сервера) и генерирует новые данные в форматах, понятных браузеру. Браузер обрабатывает файлы с описанием разметки, стилистического оформления и инструкции по динамическому изменению отображения и управляет выводом.

Задачи, связанные с работой сервера принято называть **Back-End** Development, а задачи, связанные с браузером – **Front-End** Development.

## Технологический стек

Выбор технологического стека критически влияет на разработку программного обеспечения – именно этот выбор закладывает технологические ограничения, которые возникнут в будущем. Поменять технологический стек, на практике, крайне сложно и этот выбор определяет наборы «костылей», которыми будет обладать продукт, а также стоимость его сопровождения и развития.

### Технологии Front-End

При разработке Front-End часто используется принцип, называемый Separation of Concerns. В соответствии с этим принципом, структура данных описывается посредством HTML, за стилистическое оформление определяется каскадными таблицами CSS, а динамическое поведение определяет JavaScript-код.

Из-за использования пользователями разных браузеров и их разных версий, существует проблема технологической фрагментации - какие-то технологические возможности могут быть недоступны конкретному пользователю. Чтобы решить подобные проблемы обычно используются вспомогательные инструменты/библиотеки. В течение долгого времени, доминировала библиотека [jQuery](https://jquery.com/), жизненный цикл которой приближается к концу, хотя её влияение всё ещё значимо. В некоторых случаях, разработчики используют [встроенные возможности JavaScript](http://youmightnotneedjquery.com/), т.н. *Vanilla JavaScript*. Для проверки совместимости часто используется ресурс [CanIUse](https://caniuse.com/).

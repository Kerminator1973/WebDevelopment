# Blazor WebAssembly & Bootstrap

В традиционной модели использования [Twitter Bootstrap](https://getbootstrap.com/) идентификация конкретного экземпляра элемента верстки возлагается на разработчика web-приложения. Программист ищет компонент основываясь на иерархическом представлении классов, либо используя уникальный идентификатор компонента.

В framework-ах и библиотеках, таких как Blazor, React, Vue.js, поиск органов управления по уникальному идентификатору крайне затруднён. Это связано с тем, что в подобных framework-ах взаимодействие компонентов осуществляется косвенным образом - через properties, callbacks и state management. Соответственно, совместить явное назначение уникальных идентификаторов органам управления с компонентной моделью не просто затруднительно, а буквально невозможно. Например, можно определить в верстке компонента модальный диалог из Bootstrap 5 и затем вызвать у него метод **show**():

```js
    // Создаём объёкты для работы с модальными диалогами
    globalDevices.b5filterModal = new bootstrap.Modal(document.getElementById('filterModal'), {});

    // Форма будет начинаться с диалога выбора параметров фильтрации
    setTimeout(function() {
        globalDevices.b5filterModal.show();
    }, 0);
```

Но что произойдёт, что наш компонент будет существовать в нескольких копиях? Таким образом, поиск по значению атрибута id в компонентных библиотеках - это атрипаттерн. По этой причине, мы не можем использовать Bootstrap, SemanticUI, или другие библиотеки для стилистического оформления в оригинальном виде. Чаще всего, в экосистеме конкретного продукта Blazor/React/Vue.js существует адаптация библиотеки Bootstrap, которая позволяет использовать её в парадигме Blazor/React/Vue.js/и т.д.

Одной из адаптаций Bootstrap под Blazor является **Blazor Bootstrap** by Vikram Reddy. Ввиду того, что адаптация может быть глубокой, фактор версии оригинальной библиотеки Bootstrap (4, или 5) уже не имеет решающего значения.

В качестве альтернативы можно рассматривать библиотеку [Bootstrap Blazor](https://blazor.zone/) от китайских товарищей.

Сущестуют реализации Semantic UI для Blazor, например, [SemanticBlazor](https://github.com/strakamichal/SemanticBlazor). К сожалению, Semantic UI не очень популярен у Blazor-разработчиков.

Начать изучение Blazor Bootstrap следует [со страницы](https://docs.blazorbootstrap.com/getting-started/blazor-webassembly-net-8). На GitHub приведена более [подробная инструкция](https://github.com/vikramlearning/blazorbootstrap) по созданию проекта. В соответствии с инструкцией, следует загрузить шаблон проекта и сгенерировать новое решение:

```shell
dotnet new install Blazor.Bootstrap.Templates::1.10.0
```

Соответственно, при создании проекта следует выбирать шаблон от Vikram Reddy. Заметим, что в визуальном плане шаблон чуть попроще, чем шаблон от Microsoft и, возможно, имеет смысл рассмотреть объединение в приложении разных частей обоих шаблонов.

**ВНИМАНИЕ!** По каким-то причинам, сгенерированный мной шаблон приложения использует .NET 7, а не .NET 8. Также шаблон активно использует CDN (https://cdn.jsdelivr.net/), что недопустимо в банковских приложениях.

Пример создания модального диалога можно взять из [примера BlazorBootstrap](https://demos.blazorbootstrap.com/modals):

```csharp
<Modal @ref="modal" Title="Modal title">
    <BodyTemplate>
        Modal body text goes here.
    </BodyTemplate>
    <FooterTemplate>
        <Button Color="ButtonColor.Secondary" @onclick="OnHideModalClick">Close</Button>
        <Button Color="ButtonColor.Primary">Save changes</Button>
    </FooterTemplate>
</Modal>

<Button Color="ButtonColor.Primary" @onclick="OnShowModalClick">Show Modal</Button>

@code {
    private Modal modal = default!;

    private async Task OnShowModalClick()
    {
        await modal.ShowAsync();
    }

    private async Task OnHideModalClick()
    {
        await modal.HideAsync();
    }
}
```

## Уведомляющие сообщения

Для уведомления о результатах выполнения асинхронных операций, в web-приложениях часто используют специализированные библиотеки, примером которых является [Alertify.js](https://alertifyjs.com/). В BlazorBootstrap также есть компонент, который реализует схожий функционал - [Toast](https://docs.blazorbootstrap.com/components/toasts).

В верстке следует определить сам объект и кнопку для его активации:

```html
<Toasts class="p-3" Messages="messages" AutoHide="true" Delay="6000" Placement="ToastsPlacement.BottomRight" />

<Button Color="ButtonColor.Primary" @onclick="() => ShowMessage(ToastType.Primary)">Primary Toast</Button>
```

Активация Toaster выполняется следующим кодом C#:

```csharp
List<ToastMessage> messages = new List<ToastMessage>();

private void ShowMessage(ToastType toastType) => messages.Add(CreateToastMessage(toastType));

private ToastMessage CreateToastMessage(ToastType toastType)
=> new ToastMessage
{
    Type = toastType,
    Message = $"Hello, world! This is a simple toast message. DateTime: {DateTime.Now}",
};
```

В приведённом выше примере следует обратить внимание на атрибуты AutoHide и Delay - они определяют режим работы "автоматическое сокрытие сообщения" и продолжительность отображения элемента на экране.

## Дополнительные рекомендации

Диалоги, построенные с использованием Bootstrap рекомендуется оформлять в виде отдельных компонентов (.razor) и помещать в папку "Shared".

## Сборка Blazor.Bootstrap из исходных текстов (изменение самой библиотеки)

Скачать исходные тексты библиотеки можно из репозитария [GitHub](https://github.com/vikramlearning/blazorbootstrap).

В Solution-е библиотеке есть несколько проектов - следует собирать проект blazorbootstrap. Поскольку мы собираем библиотеку, предварительно можно выбрать целевую платформу. По умолчанию, платформа - .NET 6. Заметим, что в мае 2024 г. шаблоны приложений создавались под .NET 7.

Сборка библиотеки проходит без проблем - результирующая библиотека находится в папке `\blazorbootstrap\bin\Debug\net6.0\BlazorBootstrap.dll`

В проекте прикладного приложения на Blazor Bootstrap WebAssembly добавляем ссылку на библиотеку:

- Выбираем свой демо-проект в solution tree
- В контекстном меню "Add -> Project Reference... "
- Нажимаем кнопку "Browse..." и находим BlazorBootstrap.dll

Добавить BlazorBootstrap.dll как зависимость не достаточно. Необходимо так же скопировать файлы из папки "wwwroot" проекта Blazor.Bootstrap в соответствующую папку нового проекта: "\[приложение]\wwwroot\_content\Blazor.Bootstrap". 

После этого проект запускается и отладчик позволяет входить из нашего приложения в исходные тексты BlazorBootstrap и выполнять его отладку.

### Проблемы

Однако разметка приложения слегка ломается. В частности разваливается часть верстки, связанная с адаптацией под разрешение экрана. Для того, чтобы добраться до разных экранов приложений необходимо нажать кнопку "раскрыть доступные страницы", которая должна отображаться только при минимальной ширине экрана (на мобильном устройстве с портретной ориентацией).

Причина проблемы состоит в том, что не хватает одного, очень специфического css-файла. Если мы откроем проект BlazorBootstrap и опубликуем (publish) приложение, то в локальной папке публикации мы увидим следующий файл: `\wwwroot\Blazor.Bootstrap.styles.css`. Этот файл нужно поместить в папку разрабатываемого приложения "_content/Blazor.Bootstrap" и добавить директивы его загрузки в "index.html":

```html
<link href="_content/Blazor.Bootstrap/Blazor.Bootstrap.styles.css" rel="stylesheet" />
```

После этого изменения, верстка будет отображаться корректно.

Для информации, узнать, что в разрабатываемом приложении отсутствуют стили из файла "Blazor.Bootstrap.styles.css" можно, если найти Package Blazor.Bootstrap на [Nuget.org](https://nuget.info/packages/Blazor.Bootstrap/2.2.0) и перейти в режим анализа содержимого пакета - Package Explorer. Сравнение файлов в NuGet Package и папке wwwroot разрабатываемого приложения также подскажет, что в последнем отсутствует файл "Blazor.Bootstrap.styles.css".

Следует заметить, что в процессе исследования был найден ряд проблем с проектом:

- часть js-файлов не загружается (`Failed to load resource: the server responded with a status of 404 () : DataTableApp.styles.css:1`)
- выбрать в шаблоне целевую платформу нельзя
- дублирование sln-файлов в двух разных папках: один sln там, где нужно, а второй в папке проекта, т.е. там же, где и csproj

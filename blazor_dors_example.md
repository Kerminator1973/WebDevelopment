# Пример разработки компонента выбора модели прибора DORS

Средствами Visual Studio 2022 сгенерирован шаблон приложения Blazor WebAssembly.

Поскольку планируется добавить компонент для выбора модели прибора, т.е. повторно используемый компонент, имеет смысл разместить его в папке "Shared". Имя компонента - ModelSelector.razor. Для удобства тестирования компонента, его следует сразу же разместить в родительской форме, доступной в приложении, например, на странице "Counter.razor". Для этого достаточно добавить в верстку компонент:

```csharp
<SelectModel.Shared.ModelSelector />
```

Имя компонента складывается из названия проекта, имени папки "Shared" и имени компонента. Мы можем существенно упростить верстку посредством использования директивы **using**:

```csharp
@page "/counter"
@using SelectModel.Shared
...
<ModelSelector />
```

В соответствии с поставленной задачей, компонент должен содержать три выпадающих списка: название прибора, страна для которой выполнена кастомизация прибора и исполнение, т.е. набор функций, чаще всего - специфический для конкретного заказчика.

> Примеры моделей приборов есть в \RUFServerLite\playground\attribs\index.js

Далее следует добавить в разметку компонента три выпадающих списка.

Первый же взгляд на прототип подсказывает, что каждый из выпадающих списков также можно оформить как отдельный компонент, поскольку у них есть общие свойства: список, выбранный элемент, блокировка выбора (если предыдущий элемент ещё не был выбран), callback-и, и т.д.

Один из ключевых вопросов в дизайне компонента - как именно следует хранить информацию о моделях. Результатом выбора модели должен быть числовой идентификатор. На каждом из этапов выбора данных может осуществляться обновление содержимого pull-down list. Логичный шаг - добавить основные реакции на действия пользователя и посмотреть, в каком виде данные было бы удобно использовать в коде.

> При отладке кода столкнулся со странной ситуацией: точка останова не страбатывает в Visual Studio 2022, но сам код выполняется и можно увидеть выводт в консоль браузера, который осуществляется строкой: `Console.WriteLine($"Selected model: {model}");`

## Переключение фокуса ввода

После того, как динамическая загрузка списка заработала, следует добавить функции переключения фокуса ввода на следующий элемент выпадающего списка, раскрытие его и приведение всех дочерних органов управления в начальное состояние.

> Реализация переключения фокуса сопряжена с необходимостью выполнения JavaScript-кода, поскольку в Blazor нет возможности вызвать метод focus() у списка. Это усложняет реализацию, поскольку её код с этого момента приходится писать как на C#, так и на JavaScript.

### Последовательность действий для переключения фокуса ввода

Создаём уникальный идентификатор выпадающего списка с помощью Guid:

```csharp
@inject IJSRuntime JSRuntime

<select id="@GenerateId()" @onchange="OnSelectionChanged">
    // ...
</select>
```

Запоминаем в дочернем компоненте этот уникальный идентификатор:

```csharp
@code {
    // ...

    // Сгенерированный при вызове GenerateId() уникальный идентификатор списка (select)
    private string selectId = String.Empty;

    private string GenerateId()
    {
        selectId = $"{Guid.NewGuid()}";
        return selectId;
    }
}
```

При необходимости переключения фокуса, в родительском компоненте вызываем метод SetFocus() дочернего компонента, на который следует переключить фокус:

```csharp
private void onSelectModel(string model)
{
    // ...

    countrySelector?.SetFocus();
}
```

Вызываем JavaScript-код, который умеет переключать фокус:

```csharp
public void SetFocus()
{
    JSRuntime.InvokeVoidAsync("setFocusOnChildInput", selectId).GetAwaiter().GetResult();
}
```

В JavaScript-коде переключаем фокус:

```html
<script>
    function setFocusOnChildInput(id) {
        const dropdown = document.getElementById(id);
        dropdown.focus();
    }
</script>
```

Приведённый выше подход работает, но он выглядит переусложнённым и, кроме того, он не раскрывает выпадающее меню при переключении фокуса на него. Вероятно, следует использовать Bootstrap 5 и имеющиеся в нём дополнительные возможности.

## Подключение библиотеки FluentUI

Подобная задача уже была решена мной для jQuery/UI и Boostrap 5. Существует реализация Bootstap 5 для Blazor от [Vikram Reddy](./blazor_bootstrap.md), однако в этом инструменте есть определённые ограничения. Более интересным кажется инструмент от Microsoft - FluentUI.

Установка библиотеки:

```shell
dotnet add package Microsoft.Fast.Components.FluentUI
```

Для полноценного использования элементов FluentUI, необходимо зарегистрировать специализированный сервис, вызовом AddFluentUIComponents():

```csharp
builder.Services
    .AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) })
    .AddFluentUIComponents();
```

В соответствии с [рекомендациями Microsoft](https://learn.microsoft.com/en-us/fluent-ui/web-components/integrations/blazor), необходимо добавить the composed scoped CSS file в head-раздел файлов "index.html", или "_Layout.cshtml":

```html
<link href="{PROJECT_NAME}.styles.css" rel="stylesheet" /> 
```

> В моём проекте, в файле "index.html" такая строка уже была: `<link href="SelectModel.styles.css" rel="stylesheet" />`

Для проверки работоспособности, в один из компонентов был добавлен следующий код:

```csharp
@using Microsoft.Fast.Components.FluentUI

<FluentCard>
    <h2>Hello World!</h2>
    <FluentButton Appearance="@Appearance.Accent">Click Me</FluentButton>
</FluentCard>
```

Страница с официальной документацией по FluentUI [доступна здесь](https://fluentui-blazor.net/).

> Использовать FluentSelect внутри FluentCard нельзя, т.к. у FluentCard есть чёткие границы, которые блокируют область отображения списка при его раскрытии.

При использовании шаблонного класса Option<T>, добавление

## Попытка полноценного решения задачи с раскрытием выпадающего меню

Списки select удалось успешно заменить на FluentSelect, но проблема с установкой и автоматическим переключением фокуса ещё не решена.

У компонента FluentSelect есть свойство Open, которое гипотетически можно было бы использовать для раскрытия списка, однако, это параметер:

```csharp
[Parameter]
public bool? Open { get; set; }
```

Оптимальным был бы полный уход от использования `@JSRuntime`.

К сожалению, имеющийся набор возможностей FluentSelect не позволяет добиться поставленной цели. Однако, используя механизм получения ссылок на элементы разметки - @ref, можно создать у конкретного органа управления идентификатор и получить доступ к этому элементу в JavaScript-коде:

```csharp
<FluentSelect Items=@Items
            OptionText="@(i => i.Text)"
            OptionValue="@(i => i.Value)"
            OptionSelected="@(i => i.Selected)"
            @ref="fluentSelect"
            @onchange="OnSelectionChanged" />
```

```csharp
@code {
    // ...

    private FluentSelect<Option<string>>? fluentSelect;

    public void SetFocus()
    {
        if (fluentSelect != null)
        {
            JSRuntime.InvokeVoidAsync("setFocusOnChildInput", fluentSelect.Id).GetAwaiter().GetResult();
        }
    }
}
```

```js
<script>
    window.setFocusOnChildInput = (id) => {
        const dropdown = document.getElementById(id);
        console.dir(dropdown);
    }
</script>
```

В функции setFocusOnChildInput уже можно пытаться работать с DOM, используя JavaScript.

> Следует заменить, что данный подход плох тем, что при создании каждого дочернего элемента SelectorList, будет создаваться функция setFocusOnChildInput(). Это легко проверить, если разместить перед ней `console.log('Определена функция setFocusOnChildInput');`. Т.е. в решение закладывается дополнительная, не вынуженная вычислительная нагрузка.

Но не следует сдаваться раньше времени - вариант со свойством Open вполне себе работоспособен. Нужно просто привязать его к свойству дочернего элемента SelectorList и функционал будет работать именно так, как нужно:

```csharp
<FluentSelect Items=@Items
    @bind-Open="isOpen"
/>
```

```csharp
@code {
    // ...

    private bool isOpen = false;

    public void SetFocus()
    {
        isOpen = true;
    }
}
```

Вот и всё - когда мы выбирает значение в одном списке, автоматически раскрывается следующий!

## Привязка реальных данных

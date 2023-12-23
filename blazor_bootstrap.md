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

Начать изучение Blazor Bootstrap следует [со страницы](https://docs.blazorbootstrap.com/getting-started/blazor-webassembly-net-8). На GitHub приведена более [подробная инструкция](https://github.com/vikramlearning/blazorbootstrap) по созданию проекта. В соответствии с инструкцией, следует загрузить шаблон проекта и сгененрировать новое решение:

```shell
dotnet new install Blazor.Bootstrap.Templates::1.10.0
```

Соответственно, при создании проекта следует выбирать шаблон от Vikram Reddy. Заметим, что в визуальном плане шаблон чуть попроще, чем шаблон от Microsoft и, возможно, имеет смысл рассмотреть объединение в приложении разных частей обоих шаблонов.

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

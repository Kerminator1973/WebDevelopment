# Blazor WebAssembly & Bootstrap

Ввиду применения собственной компонентной модели в Blazor, оригинальный [Twitter Bootstrap](https://getbootstrap.com/) не может быть использован без существенной потери функциональных возможностей. По этой причине, в промышленных решениях используются адаптации Bootstap под платформу Blazor. Одной из адаптаций является **Blazor Bootstrap** by Vikram Reddy.

Начать изучение Blazor Bootstrap следует [со страницы](https://docs.blazorbootstrap.com/getting-started/blazor-webassembly-net-8).

На GitHub приведена более [подробная инструкция](https://github.com/vikramlearning/blazorbootstrap) по созданию проекта. В соответствии с инструкцией, следует загрузить шаблон проекта и сгененрировать новое решение:

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

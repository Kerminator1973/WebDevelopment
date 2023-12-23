# Blazor WebAssembly & Bootstrap

Начать изучение Blazor Bootstrap следует [со страницы](https://docs.blazorbootstrap.com/getting-started/blazor-webassembly-net-8).




Предположим, что мы определили верстку диалога Bootstrap 5:

```html
<div class="modal fade" id="modalDemo" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">Добавить новый тип бинарного объекта</h4>
                <button type="button" class="btn-close" data-bs-dismiss="modal" />
            </div>
            <div class="modal-body">

                <!-- Внутри диалога размещаем поля для ввода данных -->
                <div class="input-group mb-3">
                    <div class="input-group-prepend">
                        <span class="input-group-text">Имя файла</span>
                    </div>
                    <input id="name_addBinObj" type="text" class="form-control"
                           placeholder="Например: 1:\config.xml">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" id="btnAddBinObjType">Добавить</button>
                <button class="btn btn-warning" id="btnCancelBinObjModal">Закрыть</button>
            </div>
        </div>
    </div>
</div>
```

Также предположим, что у нас есть кнопка, при нажатии на которую вызывается некоторый код C#:

```html
<button class="btn btn-primary" @onclick="ShowDialog">Show Dialog</button>
```

Код C# должен вызвать JavaScript-код:

```html
@code {
    private async Task ShowDialog()
    {
        await JS.InvokeVoidAsync("showDialog");
    }
}
```

Код создания модального окна и визуализация этого окна может выглядеть следующим образом:

<script>
    var globalAttrs = {
        b5Modal: null
    };

    window.showDialog = () => {

        if (null === globalAttrs.b5Modal) {
            globalAttrs.b5Modal = new bootstrap.Modal(document.getElementById('modalDemo'), {});
        }

        globalAttrs.b5Modal.show();
    };
</script>

Однако, кажется более разумным реализовать по максимуму логику управления формами в JavaScript-коде, а в C# выполнять только код, который осуществляет взаимодействие с серверным API.

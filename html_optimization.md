# Нетипичные способы применения HTML

Возможности оптимизации HTML-приложений, практически, безграничны. В данном документе содержится информация описание различных техник оптимизации кода.

## Загрузка большого количества миниатюр

В типовой ситуации браузер загружает лишь небольшое количество ресурсов одновременно (условно, 5 файлов), а остальные ставит в очередь на загрузку. Если мы, например, хотим отобразить большое количество миниатюных изображений на экране и при этом не хотим перегружать сервер, мы можем поместить эти изображения непосредственно в тело HTML-документа. Для этого, мы должны закодировать изображение в base64, добавить мета-данные, указывающие на то, что в src хранится не ссылка на изображение, а само изображение непосредственно.

Выглядеть это может может следующим образом:

```csharp
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA
    AAAFCAYAAACNbyblAAAAHElEQVR42mP8z8AIAwAB/1gD5gAAAABJRU5ErkJggg==" 
    alt="Miniature Image" />
```

Побочный негативный эффект - размер изображения будет на треть больше, т.к. кодирование в base64 использует восемь бит для кодирования шести бит оригинального изображения.

### Пример практического использования

На практике этот трюк использовался в приложении на Blazor для вставки изображения из буфера обмена.

```html
<img src="@base64Image" alt="Clipboard Image" />
```

Код на Blazor:

```csharp
string base64Image;
async Task GetImageFromClipboard()
{
    base64Image = await JSRuntime.InvokeAsync<string>("GetImageFromClipboard");
}
```

Код на JavaScript:

```js
window.GetImageFromClipboard = async function () {

    if (!navigator.clipboard || !navigator.clipboard.read) {
        return "API чтения из буфера обмена не поддерживается.";
    }

    const permissionStatus = await navigator.permissions.query({ name: "clipboard-read" });
    if (permissionStatus.state === "denied") {
        return "Разрешение на доступ к буферу обмена отклонено.";
    }

    const clipboardItems = await navigator.clipboard.read();
    for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
            if (type.startsWith('image/')) {
                const blob = await clipboardItem.getType(type);
                const reader = new FileReader();
                return new Promise((resolve, reject) => {
                    reader.onloadend = () => {
                        resolve(reader.result); // возвращаем base64
                    };
                    reader.onerror = (error) => {
                        //console.error("Ошибка чтения файла:", error);
                        reject(error);
                    };
                    reader.readAsDataURL(blob);
                });
            }
        }
    }

    return null;
}
```

# Загрузка файлов с сервера и выгрузка на сервер

Загрузка файлов из web-браузера является комплексной процедурой из-за того, что браузер самостоятельно выполняет запись файлов в локальной файловой системе, не предоставляя JavaScript API для доступа к диску.

Типовым решением является разделение задачи загрузки файла на две части: непосредственно загрузка данных и сохранение на локальный диск. Такое разделение предоставляет возможность обрабатывать коды ответа сервера (Http Status Codes).

Непосредственно загрузка данных может быть осуществлена посредством GET-запроса:

```js
const xhr = new XMLHttpRequest();
xhr.open('GET', url, true);
xhr.responseType = 'blob';

xhr.onload = function () {
    if (xhr.status === 200) {
        // ...
    }
};

xhr.onerror = function () {
    ...
};

xhr.send();
```

При получении кода ответа 200 в JavaScript-коде есть blob (заполненная данными область памяти), который можно использовать как URL для тэга **Anchor**, фиктивное нажатие на который приведёт с сохранению загруженных данных в файл на диске. Пример кода:

```js
xhr.onload = function () {
    if (xhr.status === 200) {
        
        // Формируем Blob - данные в оперативной памяти, которые могут быть
        // доступны через URL-синтаксис. Мы связываем этот объект в памяти
        // с DOM-элементом anchor и через этот элемент сохраняем данные в
        // локальной файловой системе
        const blob = new Blob([xhr.response], { type: contentType });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);

        // Указываем имя файла, под которым он будет сохранён на локальном диске
        link.download = filename;

        // Запускаем процесс скачивания
        document.body.appendChild(link);
        link.click();

        // После того, как документ загружен, удаляем верстку
        document.body.removeChild(link);

        // После загрузки, освобождаем память URL object-а
        window.URL.revokeObjectURL(link.href);
    }
};
```

Разделение процесса на две подзадачи предоставляет дополнительную возможность - тип загруженного документа может зависеть от Http Status Code. Например, в случа 200 кода мы можем обработать blob как бинарный файла, а в случае кода ошибки - как json. Например:

```js
const reader = new FileReader();
reader.onload = function ({ target: { result } }) {
    try {
        const jsonData = JSON.parse(result);
        const errorMessage = jsonData.error
            ? "Ошибка: " + jsonData.error
            : "Код ошибки: " + xhr.status;
        // ...

    } catch (error) {
        console.log("Код ошибки: " + xhr.status);
    }
};

// Запускаем процесс чтения blob-объекта, как текста (т.к. JSON это текстовый формат)
reader.readAsText(xhr.response);
```

### Пример из книги "Exploring Blazor"

В книге "Exploring Blazor. Second Edition" by  Taurius Litvinavicius, приведён следующие JavaScript-код загрузки файла из Blazor-приложения:

```js
function downloadfile(name, bt64) {
    var downloadlink = document.createElement('a');
    downloadlink.download = name;
    downloadlink.href = "data:application/octet-stream;base64," + bt64;
    document.body.appendChild(downloadlink);
    downloadlink.click();
    document.body.removeChild(downloadlink);
}
```

### Потенциальные ошибки при скачивании файлов

Приложение может выгружать документы разных типов: json, pdf, text, database backup. Однако может возникнуть ситуация при которой токен AspNetCore.Identity протухнет. В этом случае Middleware вернёт код 302 и выполнит redirect на страницу Login.html, чтобы оператор мог выполнить повторную аутентификацию. Наш JavaScript-код не увидит переадрессацию 302 (он получит Http Status Code 200), но вместо ожидаемого типа данных вернёт HTML. По этому косвенному признаку можно понять, что токен "протух" и перебросить операторана страницу Login.

Сделать это можно, например, вот таким кодом:

```js
const contentType = xhr.getResponseHeader('Content-Type');
if (contentType.startsWith('text/html')) {
    window.location = "/Login?handler=Logout";
    return;
}
```

### Что происходит на сервере

Предположим, что мы запустили на сервере некоторый процесс (приложение операционной системы), который вернул нам поток данных. Предположим, что эти данные находятся в переменной result, строчного типа. Передать эти данные браузеру (в обработчике GET-запроса) можно следующим образом:

```csharp
// Сохраняем результат операции в файл. Критически важно установить корректную кодировку,
// на тестовом сервере это "iso-8859-1" (28591), она же Latin1
using (StreamWriter writer = new StreamWriter(filePath, false, Encoding.GetEncoding(28591)))
{
    await writer.WriteLineAsync(result);
}

var fileBytes = System.IO.File.ReadAllBytes(filePath);
return File(fileBytes, "application/octet-stream", "database.backup");
```

## Выгрузка файлов на сервер

Для того чтобы выгрузить данные на сервер в HTML-верстке следует добавить input-поле с типом **file**:

```html
<input type="file" id="sqlToUpload" name="files" />
<button id="btnUploadSQL" class="btn btn-primary mt-2">
    <svg class="icon"><use xlink:href="/icons/icons.svg#upload"></use></svg>
    Загрузить SQL
</button>
```

При нажатии на кнопку может быть вызван JavaScript-код, которые извлечёт данные из input-а в использует их в POST-запросе. Например:

```js
const btnRestore = document.getElementById('btnUploadSQL');
btnRestore.addEventListener('click', function (event) {

    event.preventDefault();

    // Для сборки POST-запроса используем орган управления типа 'file': <input type="file">
    let formData = new FormData();

    // Допускаем, что выгружаемых файлов может быть несколько
    let input = document.getElementById('sqlToUpload');
    for (const file of input.files) {
        formData.append("files", file);
    }

    $.post({
        url: "/Settings?handler=RestoreDatabase",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("XSRF-TOKEN",
                $('input:hidden[name="__RequestVerificationToken"]').val());
        },
        processData: false,
        contentType: false,
        data: formData,
        success: function (response) {
    // ...
```

Заметим, что вызов `event.preventDefault()` блокирует стандартную обработку щелчка на кнопке - отправку форма браузером, а не нашим кодом. Иногда разработчики добавляют вызов `event.stopPropagation()`, но в нём нет особенного смысла - эта функция просто блокирует обработку события родительскими элементами.

### Обработка POST-запроса с данными на сервере

В обработчике POST-запроса можно указать, что входной параметр - список из нескольких объектов типа IFormFile:

```csharp
public async Task<IActionResult> OnPostRestoreDatabaseAsync(List<IFormFile> files)
{
    try
    {
        foreach (var formFile in files)
        {
            if (formFile.Length > 0)
```

Мы можем, например, скопировать полученные данные в файл, через поток данных (stream):

```csharp
using (var stream = new FileStream(filePath, FileMode.Create))
{
    await formFile.CopyToAsync(stream);
}
```

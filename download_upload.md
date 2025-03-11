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

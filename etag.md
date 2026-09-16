# Что такое ETag. Как работает кэширование

Для того, чтобы браузер закэшировал изображение на локальном диске необходимо, чтобы сервер добавил в заголовок ответа на запрос ресурса два поля: "ETag" и "CacheControl".

Эти поля указывают браузеру на возможность кэширования данных.

В ASP.NET Core установка этих полей может выглядеть следующим образом:

```csharp
app.MapGet("/api/files/{fileName}", (string fileName, HttpContext httpContext, IWebHostEnvironment environment) =>
{
    var assetsPath = Path.GetFullPath(Path.Combine(environment.ContentRootPath, "assets"));
    var imagePath = Path.Combine(assetsPath, fileName);

    if (!File.Exists(imagePath))
        return Results.NotFound();

    var fileInfo = new FileInfo(imagePath);
    var contentType = GetContentType(fileInfo.Extension);
    var lastModified = fileInfo.LastWriteTimeUtc;

    var etag = new Microsoft.Net.Http.Headers.EntityTagHeaderValue($"\"{fileInfo.Length}-{lastModified.Ticks}\"");

    httpContext.Response.Headers.CacheControl = "no-cache";

    return Results.File(
        imagePath,
        contentType: contentType,
        lastModified: lastModified,
        entityTag: etag,
        enableRangeProcessing: true
    );
});
```

Поле ответа "no-cache" означает "кэшировать, но перед использованием обязательно проверить у сервера через If-None-Match".

В качестве альтернативы может быть установлено `public, max-age=0, must-revalidate`

ETag (_Entity Tag_) необходимо передать браузеру, чтобы при повторной попытке он прислал заголовок "If-None-Match", используя который сервер может принять решение о том, что картинка не нуждается в загрузке и ответить кодом "304 Not Modified".

В заголовке "If-None-Match" может быть один, или несколько ETag:

- "abc123"
- "v1", "v2", "v3"

Если кэша нет, браузер вообще не отправляет "If-None-Match".

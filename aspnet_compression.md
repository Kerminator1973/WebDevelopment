# Сжатие ответов сервера в ASP.NET Core

Сжатие ответов позволяет уменьшить размер передаваемых данных по 5 раз. ASP.NET Core позволяет выбрать подходящий баланс между эффективностью сжатия и расходом вычислительных ресурсов на сервере.

Пример для динамического сжатия контента с использованием Gzip:

```csharp
// Добавляем поддержку динамического сжатия контента при ответе сервера
services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes;
    options.Providers.Add<GzipCompressionProvider>();
});

services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Optimal;
});
```

Пример для динамического сжатия контента с использованием Brotli:

```csharp
services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes;
    options.Providers.Add<BrotliCompressionProvider>();
});

services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Optimal;
});
```

Можно обеспечить максимальный коэффициент сжатия передаваемых данных, но это может повысить нагрузку на CPU буквально в разы

```csharp
options.Level = CompressionLevel.SmallestSize;
```

Также мы можем явно указать, какие типа контента следует подвергать сжатию:

```csharp
options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
{
    "application/xml",
    "text/xml",
    "text/plain; charset=utf-8",
    // добавьте свои типы
});
```

При конфигурировании сервиса (`Configure()`) необходимо добавить поддержку динамического сжатия при ответе сервера. Порядок инициализации middleware важен! Cжатие должно регистрироваться до middleware, которые генерируют ответы (Static Files, Razor Pages):

```csharp
// Регистрация перемещёна в начало pipeline
app.UseResponseCompression();

// Обеспечиваем поддержку загрузки статических файлов (js, css, и т.д.)
app.UseStaticFiles();
```

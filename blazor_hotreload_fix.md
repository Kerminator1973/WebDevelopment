# Решение проблемы с Hot Reload в Blazor

При разработке ряда web-приложений на Blazor WebApp WASM на платформе .NET 8 мы столкнулись с тем, что не работает Hot Reload. Эта проблема в максимальной степени затронула frontend-разработичков, которые стали тратить кратно больше времени при работе над версткой при отладке приложений.

Долгая история поиска привела к описанию ошибки [Blazor WebApp Wasm Hot Reload does not work with UseRouting](https://github.com/dotnet/aspnetcore/issues/52339). Из описания следует, что при инициализации приложения необходимо размещать код инициализации middleware управления файлами в Blazor (**UseBlazorFrameworkFiles**) до инициализации других middleware:

```cshart
app.UseBlazorFrameworkFiles();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();
```

Изменение порядка инициализации middleware привели к восстановлению работоспособности Hot Reload.

С высокой вероятностью, начиная с .NET 9 проблема будет устранена "из коробки".

>Появилась другая проблема связанная с Hot Reload. Если сделать все по инструкции выше, то Hot Reload работает, но перестаёт работать авторизация пользователя.

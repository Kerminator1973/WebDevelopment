# ConfigureApplicationCookie() в ASP.NET Core

В приложениях ASP.NET Core 8 с использованием Identity, хранение информации о текущей пользовательской сессии может осуществляться в cookie. Настройка cookie, а также поведения Identity осуществляется в методе ConfigureApplicationCookie(). Типовая настройка выглядит следующим образом:

```csharp
.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
    options.LoginPath = "/Login";
    options.LogoutPath = "/Login?handler=Logout";
    options.AccessDeniedPath = "/AccessDenied";
    options.SlidingExpiration = true;
})
```

Ключевыми полями являются **ExpireTimeSpan** и **SlidingExpiration**. Первый из этих параметров позволяет указать время жизни _Authentication Ticket_, а второй параметр - будет ли обновляться "билет" автоматически.

Проверить, как обновляется "билет" можно добавив следующий обработчик события аутентификации:

```csharp
options.Events = new Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationEvents
{
    OnValidatePrincipal = async context => {
        var expiresUtc = context.Properties.ExpiresUtc;
        await Task.CompletedTask;
    }
};
```

В этом обработчике мы можем установить контрольную точку и увидеть, что при переходе со страницы на страницу expiresUtc не изменяется до тех пор, пока не пройдёт половина временного периода, указанного в **ExpireTimeSpan**.

Например, если время жизни билета - 30 минут, и через 20 минут пользователь перейдёт на некоторую страницу, то токен будет перевыпущен. Если пользователь придёт через 40 минут, то его перебросят на LoginPage.

Ещё один пример: предположим, что ExpireTimeSpan - 30 минут. Через 13 минут пользователь перешёл на новую страницу и на ней наш код устанавливает тайм-аут в 30 минут, по истечению которого пользователя перебрасывают на LoginPage. Однако токен стухнет через 17 минут, а  пользователь будет сидеть в незаблокированном окне ещё 13 минут (с протухшим токеном).

## Принудительная перезагрузка страницы при протухании tikect-а

Получаем из Authentication Ticket информацию о том, когда токен перестанет быть валидным и рассчитываем через сколько секунд это произойдёт. Делаем запас в 4 секунды (погрешность на загрузку страницы) и устанавливаем специальный заголовок в ответе на http-запрос. Заголовок "Refresh" умеют обрабатывать почти все браузеры. По истечению времени, управление будет передано на запрос закрытия пользовательской сессии.

Этот подход позволяет блокировать пользовательский интерфейс в момент, близкий к "протуханию" Authentication Ticket:

```csharp
options.Events = new Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationEvents
{
    OnValidatePrincipal = async context => {

        var expiresUtc = context.Properties.ExpiresUtc;
        var timeDifference = expiresUtc - DateTimeOffset.UtcNow;
        var secondsBetween = timeDifference?.TotalSeconds;

        if (secondsBetween > 5)
        {
            var secondsToExpire = (int)secondsBetween - 4;
            context.HttpContext.Response.Headers["Refresh"] = $"{secondsToExpire}; url=/Login?handler=Logout";
        }

        await Task.CompletedTask;
    }
};
```

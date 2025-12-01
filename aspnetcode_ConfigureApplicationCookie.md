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

Таким образом ticket хранится не на сервере, а на клиенте. При получении http-запроса сервер может не только проверить ticket из получить из него `ClaimsPrincipal`, но также и обновить ticket. Следует заметить, что для проверки ticket-а доступ к базе данных membership не нужен. Однако доступ к базе данных необходим для выполнения следующих операций:

- Security‑stamp validation. Middleware нужна база данных, чтобы проверить текущий security stamp в таблице AspNetUsers, чтобы проверить, что не был изменён пароль, сессия не была добавлена в revocation list
- Refresh of claims. Если были изменены права, то доступ к базе данных необходим
- Sign‑out from all devices. Осуществился выход со всех устройств, необходимо модифицировать revocation list
- Role/permission changes. Необходим доступ к базе данных, чтобы пересоздать ticket

**Revocation List**, т.е. список отозванных сессий может храниться в реляционной базе данных, хотя чаще всего для него используют Redis, NoSQL store, или другии базы типа key/value.

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

Приведённый выше пример добавляется в вызов `ConfigureApplicationCookie()` и является настройкой одного из параметров Identity.

## Anti-Forgery Token

Anti-Forgery Token является парой связанных значений, одна часть которого хранится в Cookie, а вторая на HTML-странице и включается в Post-запрос.

Обычно вторая часть определена на странице как:

```html
<input name="__RequestVerificationToken" …>
```

Значение включается либо в поле запроса, либо в дополнительное поле MIME-заголовка.

Сервер использует первую часть из Cookie и вторую часть из http-запроса и при нарушении криптографической связанности отвергает запрос. Защита рабоает в тех случаях, когда злоумышленник смог скопировать cookie тем, или иным способом и отправить его в поддельном запросе. Поскольку злоумышленник не имеет токене текущей формы (из поля __RequestVerificationToken) и не может его подделать, хищение токена не позволяет получить доступ к пользовательским данным на сервере и выполнить операций от имени пользователя.

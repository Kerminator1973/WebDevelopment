# Настройка авторизации пользователя с использованием Active Directory

Интеграционный сервер осуществляет Windows Authentication с использованием Active Directory.

В настройках конфигурации запуска IIS в Visual Studio необходимо:

- установить крыжик в пункте "Enable Windows Authentication"
- убрать крыжик в пункте "Enable Anonymous Authentication"

В некоторых приложениях используется доменная аутентификация для доступа пользователей и проверка клиентского сертификата для доступа устройств через API. В этом случае, крыжик в пункте "Enable Anonymous Authentication" необходим. В коде разрешение использования анонимной аутентификации выглядит таким образом:

```csharp
[AllowAnonymous]
[IgnoreAntiforgeryToken(Order = 1001)]   
public class AdmApiModel : PageModel
```
 
Защита API строится посредством проверки установки защищённого соединения между клиентом и сервером, с использованием TLS 1.2, 1.3.

В случае запуска приложения через IIS, в файле "Startup.cs" необходимо указать, что аутентификация будет осуществляться через AD:

```csharp
using Microsoft.AspNetCore.Server.IISIntegration;
...
services.AddAuthentication(IISDefaults.AuthenticationScheme);
```

В случае, если необходимо запускать приложение через Kestrel, следует использовать другой вызов:


```csharp
using Microsoft.AspNetCore.Authentication.Negotiate;
...
services.AddAuthentication(NegotiateDefaults.AuthenticationScheme).AddNegotiate();
```

Для работы через Kestrel может потребоваться установить пакет `Microsoft.AspNetCore.Authentication.Negotiate`.

Если мы хотим добавить проверку вхождения пользователя в определённую группу, то это можно сделать следующим образом:

```csharp
services.AddControllers(config =>
{
    // ...
    config.Filters.Add(new AuthorizeFilter(new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .RequireRole(securityGroup)
        .Build()
        ));
});
```

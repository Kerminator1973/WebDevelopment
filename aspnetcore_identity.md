# ASP.NET Core 8 Identity

ASP.NET Core 8 Identity это система управления пользователями (membership), которая выполняет операции:

- регистрации пользователей
- входа и выхода из системы
- хэширования паролей
- управления ролями
- генерации токенов безопасности

Для встраивания в код приложений используется dependency-injection.

Identity "по умолчанию" работает с Entity Framework. Однако система хранения данных о пользователях и ключах безопасности может быть изменена.

Ключевыми интерфейсами и классами являются:

- UserManager<TUser> - используется для регистрации новых пользователей и изменения паролей
- SignInManager<TUser> - базирующийся на cookie механизм проверки валидности пароля
- RoleManager<TRole> - используется для назначения пользователю роли, или ролей
- IDataProtectionProvider - генерирует криптографические токены, которые могут быть, в том числе, переданы по электронной почте

ASP.NET Core использует несколько типов токенов, для разных сценариев, но все токены генерирутся через IDataProtection для обеспечения от несанкционированного доступа (tamper-proof) и управления жизненным циклом токена.

Различаются:

- Data-Protection Tokens - используются в случае, если аутентификационная информация хранится в авторизационных Cookie. Эти токены подписываются и шифруются для защиты от подделки, содержат информацию о пользователе (ID, роли, claims), а срок действия контролируется настройками
- JWT Beared Tokens - используются для взаимодействия по API. Токен размещается в заголовке HTTP-запроса. В токене содержится полезная нагрузка (payload), а также время жизни, после которого его нужно перегенерировать использя дополнительный refresh token
- Refresh Tokens - долго живущие токены, хранящиеся в безопасном хранилище (часто - в базе данных) на стороне клиента. Когда время жизни JWT завершается, клиент может отправить на сервер Refresh Token и сгенерировать новый JWT
- Antiforgery Tokens (CSRF protection) - состоит из двух частей: одна передаётся в cookie, а вторая хранится на самой странице и передаётся в заголовке Http-запроса, или в поле формы. Задача - подтвердить, что POST-запрос был отправлен именно с той формы, которая до этого была получена посредством GET-запроса

### Data-Protection Tokens

За шифрование Data-Protection Tokens отвечает Data Protection Stack — встроенная система защиты данных, которая использует Data Protection API (DPAPI). Data Protection API автоматически:

- Генерирует криптографические ключи
- Хранит их во временном хранилище по умолчанию
- Обновляет ключи по расписанию

Секрет, необходимый для работы системы шифрования не хранится в коде, или в конфигурации "appsettings.json" - обычно используются специализированные папки операционной системы:

- на локальной машине хранятся в папке: `%LOCALAPPDATA%\ASP.NET\DataProtection-Keys`
- в production на Windows-машине: `HKEY_LOCAL_MACHINE\SOFTWARE\...`
- в production на Linux/Docker/Kubernetes: `/var/aspnet/dataprotection-keys`
- в облачных средах (Azure, AWS, GCP): в облачных хранилищах ключей (Azure Key Vault, AWS KMS и т. п.)

В кластерных сценариях (например, с использованием балансировщика нагрузки) все серверы должны иметь доступ к одному хранилищу ключей. Если этого не сделать, то при переброске сессии пользователя на другой компьютер, его авторизационные cookie не будут расшифрованы и авторизация будет потеряна.

В Program.cs можно явно указать хранилище:

```csharp
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(@"/path/to/keys")) // Linux
    .ProtectKeysWithDpapi();                     // Windows (реестр)
    // Или:
    .ProtectKeysWithCertificate("thumbprint");   // Сертификат
    .UseCryptographicAlgorithms(...)             // Алгоритмы
    .SetApplicationName("my-app-name");          // Одинаковое имя для всех инстансов
```

Можно хранить секреты в Redis, либо в реляционной базе данных. Чтобы хранить ключи в реляционной базе данных, необходимо создать таблицу:

```sql
CREATE TABLE DataProtectionKeys ( Id INT IDENTITY(1,1) PRIMARY KEY, FriendlyName NVARCHAR(256) NULL, Xml TEXT NOT NULL, ExpirationDate DATETIME NULL );
```

Установить зависимость DataProtection:

```shell
dotnet add package Microsoft.AspNetCore.DataProtection.EntityFrameworkCore
```

Настроить сервис хранения секретов:

```csharp
services.AddDataProtection()
       .UseEntityFrameworkCore(context => 
              context.Set<DataProtectionKey>().FromSqlRaw( "SELECT * FROM DataProtectionKeys"))
       .SetApplicationName("my-app-name");
```

### Типы токенов

Тип используемого токена можно иногда понять по внешнему виду:

- Antiforgery (CSRF) token: в заголовке Http-запроса есть поле "XSRF-TOKEN", или "X-XSRF-TOKEN"
- Если токен начинается со строки "CfDJ8", то это скорее всего либо Token AspNetCore.Identity.Application, либо ASP.NET Core data‑protection token
- строка в base64 - это либо JWT, либо Refresh Token

Распознать, какие типы токенов используются, можно по коду регистрации сервисов приложения. Например, следующий код приведёт к использованию ASP.NET Core Identity:

```csharp
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
       .AddEntityFrameworkStores<AppDbContext>();
```

А следующий код говорит о том, что используется JWT Bearer authentication:

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
       .AddJwtBearer(options => { ... });
```

Также полезным может быть анализ зависимостей файла .csproj, с использованием команды `dotnet list package`:

- Microsoft.AspNetCore.Identity - это ASP.NET Core Identity (cookie + data‑protection tokens)
- Microsoft.AspNetCore.Authentication.JwtBearer -JWT Bearer authentication
- Microsoft.AspNetCore.Authentication.OpenIdConnect - OpenID Connect (часто вместе с IdentityServer, или другой внешней системой)
- IdentityServer4 / Duende.IdentityServer - Полная реализация OpenID Connect / сервер OAuth2
- Microsoft.AspNetCore.Authentication.Cookies - Аутентификация на базе сookie, но без полноценной Identity (используется собственное хранилище пользователей)
- Microsoft.AspNetCore.Antiforgery - CSRF protection
- Microsoft.IdentityModel.Tokens - Token validation utilities (used for JWT, SAML, etc.)
- AspNetCore.Authentication.ApiKey - простя схема использования API‑ключей

Также полезным может быть поиск используемых Middleware: `app.UseAuthentication()` и `app.UseAuthorization()`

>Гипотетически, мы можем использовать одну и ту же реализацию IDataProtectionProvider в проектах ASP.NET 4.0 и ASP.NET Core 8, добавив в качестве зависимости Microsoft.AspNetCore.DataProtection:
>
>```xml
><!-- In the .csproj (or packages.config) of the Web Forms / MVC 4 app -->
><PackageReference Include="Microsoft.AspNetCore.DataProtection" Version="8.*" />
>```
>
>Это может потребовать использования общего хранилища ключей, а также решения большого количества проблем совместимости, в частности они должны иметь одно имя приложений (см. SetApplicationName), использовать одинаковые алгоритмы Key-ring encryption, и т.д.

## Как можно обновить cookie для продолжения работы

Механизм описан на [странице](./aspnetcode_ConfigureApplicationCookie.md) и реализован в проекте ProIDC.

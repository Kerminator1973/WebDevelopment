# Особенность работы Kestrel

Типовой задачей при разработке ПО является отладка систем, состоящих из нескольких подсистем. Например, приложение ASP.NET Core может работать на хостовой системе, а клиентское Desktop-приложение в виртуальной машине.

Для обеспечения возможности отладки кода обоих сторон взаимодействия необходимо обеспечить запуск приложения из среды разработки приложений (IDE). Часто, такой средой является Microsoft Visual Studio 2022.

Чтобы указать порт, через который Kestrel будет принимать запросы, достаточно указать его в файле профиля запуска "launchSettings.json". Например:

```json
{
  "$schema": "https://json.schemastore.org/launchsettings.json",
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "applicationUrl": "http://0.0.0.0:5237",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    },
    "https": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "applicationUrl": "https://0.0.0.0:7099;http://0.0.0.0:5237",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

Соответственно, запускать приложение из Visual Studio следует используя конфигурации "http", или "https".

Для того, чтобы принимать запросы с разных компьютеров, необходимо в настройках "applicationUrl" заменить "localhost" на "0.0.0.0". IP-адрес "0.0.0.0" указывает на то, что запросы следует принимать с любого внешнего IP-адреса.

## Запуск приложения из командной строки

Если мы хотим указать порт, отличный от default-ного, на котором приложение будет принимать запросы, то перед запуском приложения ASP.NET Core следует установить переменную окружения:

```shell
SET ASPNETCORE_HTTP_PORTS=1445
```

Этого же результата можно добиться, если указать порт явным образом в файле "appsettings.json":

```json
"Kestrel": {
  "Endpoints": {
    "Http": {
      "Url": "http://localhost:5000"
    },
    "Https": {
      "Url": "https://localhost:5001"
    }
  }
},
```

Для указания обработки запросов с разных IP-адресов можно использовать переменную окружения ASPNETCORE_URLS:

```shell
SET ASPNETCORE_URLS=http://*:5000
SET ASPNETCORE_URLS=http://*:80;https://*:443
```

Варианты `0.0.0.0` (для IPv4) и `[::]` (для IPv6) также могут быть использованы.

При выполнении запросов на клиентской стороне необходимо явным образом указывать используемый протокол (http, или https).

Определение IP-адреса хостовой машины, который должен быть использован из клиентской машины [описано здесь](https://github.com/Kerminator1973/WebDevelopment/blob/master/iis.md#accesstohost). Особенности конфигурирования сетевой подсистемы виртуальной машины описаны [здесь](https://github.com/Kerminator1973/WebDevelopment/blob/master/homesite.md#usingvmware).

## Как тоже самое выглядит в коде

Если бы мы делали тоже самое в коде, то выглядело бы это так:

```csharp
public static IHostBuilder CreateHostBuilder(string[] args) =>
    Host.CreateDefaultBuilder(args)
    .ConfigureWebHostDefaults(webBuilder =>
    {
        webBuilder
            .UseUrls("http://*:5000")
            .CaptureStartupErrors(true)
            .UseStartup<Startup>();
    });
```

Вызов UseUrls() позволяет настроить подключение как http, так и https:

```csharp
UseUrls("http://0.0.0.0:5000", "https://0.0.0.0:5001");
```

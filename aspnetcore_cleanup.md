# Очистка системы от компонентов .NET

Получить список размещений nuget-пакетов на диске:

```shell
dotnet nuget locals all --list
```

Вывод может быть следующим:

```
http-cache: C:\Users\kermi\AppData\Local\NuGet\v3-cache
global-packages: C:\Users\kermi\.nuget\packages\
temp: C:\Users\kermi\AppData\Local\Temp\NuGetScratch
plugins-cache: C:\Users\kermi\AppData\Local\NuGet\plugins-cache
```

В моё случае:

- http-cache: 2.7 ГБ.
- глобальные packages: 13.4 ГБ

Очистка только cache:

```shell
dotnet nuget locals http-cache --clear
dotnet nuget locals temp --clear
```

Очистка глобальных packages:

```shell
dotnet nuget locals global-packages --clear
```

Чистка реально помогает, т.к. позволяет удалить устаревшие и бесполезные зависимости. Всё, что реально нужно, будет скачено при следующей сборке проекта.

# Пример создания контейнеров Docker для web-приложения

Web-приложение разработано на ASP.NET Core 8 и требует использования базы данных Postgres.

Подготовку контейнеров кажется логичным начать с Postgres.

Чтобы ускорить разработу сценарией можно воспользоваться ChatGPT, однако, предложенные скрипты следует внимательно проанализировать, адаптировать под реальную задачу и выполнить оптимизацию контейнеров (если потребуется).

## Подготовка первого контейнера (Postgres)

Содержимое Dockerfile может выглядеть следующим образом:

```dockerfile
# Use the official PostgreSQL image from the Docker Hub
FROM postgres:latest

# Set environment variables for PostgreSQL
ENV POSTGRES_DB=proidc3
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=38Gjgeuftd

# Copy the seed data SQL script into the Docker image
COPY ./seed.sql /docker-entrypoint-initdb.d/

# Expose the PostgreSQL port
EXPOSE 5432
```

Пример тестового SQL-скрипта:

```sql
-- seed.sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO users (name, email) VALUES
('Alice', 'alice@example.com'),
('Bob', 'bob@example.com');
```

Собрать контейнер можно командой:

```shell
docker build -t my-postgres-app .
```

Запуск контейнера:

```shell
docker run --name my-postgres-container -d my-postgres-app
```

Чтобы проверить, что Seed-данные применились, можно подключиться к контейнеру и запросить добавленные данные:

```shell
docker exec -it my-postgres-container psql -U postgres -d proidc3
```

```sql
SELECT * FROM users;
```

В моём случае был создан контейнера на Debian 17.0.1.

При создании контейнера было выдано предупреждение о том, что не рекомендуется использовать инструкции ARG и ENV для чувствительных данных:

```output
1 warning found (use docker --debug to expand):
SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data (ENV "POSTGRES_PASSWORD") (line 7)
```

В частности, проблемной является строка Dockerfile:

```Dockerfile
ENV POSTGRES_PASSWORD=38Gjgeuftd
```

На самом деле, встраивать директивы ENV в Dockerfile - на самая лучшая идея. Более разумно устанавливать их при запуске Docker-контейнера, например:

```shell
docker run --name my_postgres -e POSTGRES_PASSWORD=mysecretpassword -d postgres
```

Вынести пароли можно во внешний .env-файл и передавать не пароль в явном виде, а файл:

```shell
docker run --name my_postgres --env-file .env -d postgres
```

Пример ".env":

```env
POSTGRES_PASSWORD=mysecretpassword
```

## Создание реальной структуры базы данных

В приложениях на ASP.NET Core 8 часто используется подход Code First для Entity Framework. Это означает, что модель базы данных содержится в программном коде и её можно импортировать (как схему в виде SQL-скрипта) используя консольную команду:

```shell
dotnet ef migrations script
```

Генерация скрипта потребует компиляции приложения и завершится выводом скрипта в пользовательскую консоль. Мы можем использовать команду перенаправления вывода в файл.

Заметим, что если в нашем проекте есть несколько миграций, то скрипт будет содержать "сомнения и ошибки" разработчиков, например, вот такие команды:

```sql
ALTER TABLE "CriticalIssues" DROP COLUMN "HasProcessed";
```

Если продукт ещё не вводился в промышленную эксплуатацию, то может иметь смысл удалить все старые миграции и создать одну новую, чистую.

## Подготовка web-приложения для развертывании в Docker-контейнера

Сборка приложения для публикации, в общем случае, осуществляется следующей командой:

```shell
dotnet publish -c Release -o ./publish
```

При сборке приложения на Linux x64, был создан подкаталог с большим количеством файлов, ключевым из которых является "CinnaPages" (без расширения имени файла). Мы можем запустить файл этот файл, как обычный исполняемый файл: `./CinnaPages`

Это файл запускается на выполнение.

Единственная проблема, которую пришлось решить с локально развернутой копией PostgreSQL - установить новый пароль для пользователя postgres:

```sql
ALTER USER postgres PASSWORD 'new_password';
```

После этого действия web-сервер прекрасно запустился, автоматически выполнил миграцию и заработал в штатном режиме.

### Publish Single File

Однако может быть использован режим **Publish Single File**, который позволяет уменьшить количество файлов в папке публикации:

```shell
dotnet publish -c Release -o ./publish -p:PublishSingleFile=true -p:PublishTrimmed=true -p:RuntimeIdentifier=win-x64
```

Кроме этого, следует обратить внимание на идентификатор Runtime. В приведённом выше примере - это Microsoft Windows x64, но для работы в Docker следует использовать `-p:RuntimeIdentifier=linux-x64`

На моём стенде, при первом запуске было получено сообщение об отсутствии файла "CinnaPages.runtimeconfig.json". Основываясь на подсказках из интернет, файл был сформирован следующим образом:

```json
{
  "runtimeOptions": {
    "tfm": "net8.0",
    "framework": {
      "name": "Microsoft.NETCore.App",
      "version": "8.0.110"
    },
    "rollForward": "latestMinor"
  }
}
```

После создания файла приложение запустилось, но развалилось с исключением:

```output
Unhandled exception. System.TypeLoadException: Could not load type 'Microsoft.AspNetCore.Mvc.ApplicationParts.ConsolidatedAssemblyApplicationPartFactory' from assembly 'Microsoft.AspNetCore.Mvc.Razor, Version=8.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'.
   at System.Reflection.RuntimeAssembly.GetTypeCore(String, ReadOnlySpan`1, Boolean, Boolean)
   at System.Reflection.TypeNameParser.GetType(String, ReadOnlySpan`1, String)
   at System.Reflection.TypeNameParser.NamespaceTypeName.ResolveType(TypeNameParser&, String)
   at System.Reflection.TypeNameParser.Parse()
   at System.Reflection.TypeNameParser.GetType(String, Func`2, Func`4, Assembly, Boolean , Boolean , Boolean )
   at System.Reflection.TypeNameParser.GetType(String, Assembly, Boolean , Boolean )
   at System.Type.GetType(String typeName, Boolean throwOnError)
   at Microsoft.AspNetCore.Mvc.ApplicationParts.ProvideApplicationPartFactoryAttribute.GetFactoryType()
   at Microsoft.AspNetCore.Mvc.ApplicationParts.ApplicationPartFactory.GetApplicationPartFactory(Assembly)
   at Microsoft.AspNetCore.Mvc.ApplicationParts.ApplicationPartManager.PopulateDefaultParts(String)
   at Microsoft.Extensions.DependencyInjection.MvcCoreServiceCollectionExtensions.GetApplicationPartManager(IServiceCollection, IWebHostEnvironment)
   at Microsoft.Extensions.DependencyInjection.MvcCoreServiceCollectionExtensions.AddMvcCore(IServiceCollection)
   at Microsoft.Extensions.DependencyInjection.MvcServiceCollectionExtensions.AddControllersCore(IServiceCollection)
   at Microsoft.Extensions.DependencyInjection.MvcServiceCollectionExtensions.AddControllers(IServiceCollection)
   at Program.<Main>$(String[]) in /home/developer/projects/ProIDC3/source/CinnaPages/Program.cs:line 84
   at Program.<Main>(String[])
Aborted (core dumped)
```

Проблемной оказалась следующая строка:

```csharp
builder.Services.AddControllers();
```

Пока полноценно запустить приложение в работу, в режиме Single File не удалось. Возможно, проблема связана с параметром `PublishTrimmed` - необходимо дополнительно изучить режим сборки однофайлового приложения.

## Dockerfile для приложения на ASP.NET Core 8

Стартовый Dockerfile можно взять с [сайта Learn Microsoft](https://learn.microsoft.com/ru-ru/dotnet/core/docker/build-container?source=recommendations&tabs=linux&pivots=dotnet-8-0):

```Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /App

# Copy everything
COPY . ./
# Restore as distinct layers
RUN dotnet restore
# Build and publish a release
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /App
COPY --from=build-env /App/out .

# Specify the entry point for the application
ENTRYPOINT ["dotnet", "CinnaPages.dll"]
```

В этом скрипте приложение собирается из исходников в папку -out контейнера **build-env**, а затем создаётся новый компактный контейнер, в котором есть только ASP.NET Core 8 Runtime и наше собранное приложение. Если мы используем внешнюю сборку, т.е. уже имеем результаты сборки, то можно ограничиться четырьмя последними строчками, но корректно указав исходную папку "publish":

```Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY publish/ /app/
ENTRYPOINT ["dotnet", "CinnaPages.dll"]
```

Сборка контейнера:

```shell
docker build -t cinna-pages .
```

Запуск контейнера:

```shell
docker run -d -p 8080:80 cinna-pages
```

## Размещение Docker Image у провайдера

**Under construction!**

После того, как мы собрали Docker images, мы можем разместить их на сервере провайдера. По умолчанию, провайдером является DockerHub, но мы можем использовать и российские IT-компании, например, Selectel. Команда подключения к репозитарию:

```shell
docker login registry.selectel.ru -u your-username -p your-password
```

Создание тэга:

```shell
docker tag your-image-name registry.selectel.ru/your-selectel-username/your-image-name:your-tag
```

Загрузка образа в репозитарий провайдера:

```shell
docker push registry.selectel.ru/your-selectel-username/your-image-name:your-tag
```

Ещё одна важная команда Docker - `commit`. Она берет верхний уровень контейнера, тот, что для записи и превращает его в слой для чтения. После этого мы можем выполнить push и залить получившийся контейнер в репозитарий. Эта операция позволяет сохранять в образе правки образа, выполненные вручную.

## Как будет выглядеть docker-compose.yml

**Under construction!**

Когда мы будем разрабатывать скрипт для запуска контейнеров посредством Docker Compose, скрипт в файле "docker-compose.yml" может выглядеть следующим образом:

```yaml
version: '3.8'

services:
  db:
    image: postgres:latest
    environment:
      POSTGRES_DB: proidc3
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 38Gjgeuftd
    volumes:
      - ./seed.sql:/docker-entrypoint-initdb.d/seed.sql
    ports:
      - "5432:5432"
```

Запуск образов посредством Docker Compose выполняется следующей командой:

```shell
docker-compose up
```

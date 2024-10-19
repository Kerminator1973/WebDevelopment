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

При создании контейнера было выдано предупреждение о том, что не рекомендуется использовать инструкции ARG и ENV для чувствительных данных. В частности, проблемной является строка Dockerfile:

```Dockerfile
ENV POSTGRES_PASSWORD=38Gjgeuftd
```

TODO: _необходимо рассмотреть альтернативы_.

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

Однако может быть использован режим **Publish Single Page**, который позволяет уменьшить количество файлов в папке публикации:

```shell
dotnet publish -c Release -o ./publish -p:PublishSingleFile=true -p:PublishTrimmed=true -p:RuntimeIdentifier=win-x64
```

Кроме этого, следует обратить внимание на идентификатор Runtime. В приведённом выше примере - это Microsoft Windows x64, но для работы в Docker следует использовать `-p:RuntimeIdentifier=linux-x64`

## Dockerfile для приложения на ASP.NET Core 8

**Under construction!**

Стартовый пример Dockerfile:

```Dockerfile
# Use the official .NET SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy the project files and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy the rest of the application files and publish
COPY . ./
RUN dotnet publish -c Release -o out

# Use the official .NET runtime image to run the application
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out ./

# Specify the entry point for the application
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

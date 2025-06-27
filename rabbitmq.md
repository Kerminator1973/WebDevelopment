# Under construction!

Информация в данном файле базируется на материалах Telegram-канала ".NET Разработчик" под загаловком "RabbitMQ в .NET с Нуля". В данной статье выполняется проверка материалов, а также их адаптация.

Оригинальная статья [RabbitMQ in .NET from Scratch](https://thecodeman.net/posts/rabbitmq-in-dotnet-from-scratch) by Stefan Đokić.

## "RabbitMQ в .NET с Нуля"

RabbitMQ — это брокер сообщений. Он как надёжный почтовый сервис для вашего ПО. Вместо того, чтобы одна система напрямую вызывала другую (что создаёт тесную связь), RabbitMQ выступает в качестве посредника:

- одна часть вашего приложения отправляет сообщение
- другая часть получает и обрабатывает его

Это называется асинхронной связью, и отлично подходит для производительности, надёжности и масштабируемости.

Ключевые компоненты:

- Производитель (Producer) – отправляет сообщения
- Потребитель (Consumer) – получает сообщения
- Очередь (Queue) – место, где сообщения ждут обработки
- Обменник (Exchange) – "диспетчер", который направляет сообщения в соответствующие очереди
- Привязка (Binding) – правила, которые связывают обменники с очередями

### Установка RabbitMQ (локально с Docker)

Запустить Docker-контейнер с Rabbit MQ можно следующей командой:

```shell
docker run -d --hostname rabbitmq --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

В команде указан порт, по которому можно подключиться к web-консоли - **15672**. Для подключения используется URL `http://localhost:15672`. Логин и пароль по умолчанию: `guest`/`guest`

>Web-консоль успешно запускается. Команды для остановки контейнера приведены [в статье](https://github.com/Kerminator1973/WebDevelopment/blob/master/docker.md).
>
>Замечу, что в [официальной документации по RabbitMQ](https://www.rabbitmq.com/docs/download) рекомендуется использовать следующую версию брокера запросов:
>
>```shell
>docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management
>```

### Реализация в .NET

Создадим простой проект:

- API отправляет "e-mail" в RabbitMQ
- фоновый сервис прослушивает и "обрабатывает" сообщение

Добавим RabbitMQ в проект:

```powershell
Install-Package RabbitMQ.Client
```

>Создание консольного приложения .NET (Publisher-а):
>
>```shell
>dotnet new console -n mqPublisher
>```
>
>Добавление зависимости:
>
>```shell
>dotnet add package RabbitMQ.Client
>```

Определим класс сообщения:

```csharp
public record Email(string To, string Subject, string Body);
```

Производитель

Его роль – отправлять сообщения в RabbitMQ. Он должен:

- подключиться к RabbitMQ
- создать очередь (или проверить её существование)
- сериализовать сообщение (например, в JSON)
- отправить сообщение в очередь

```csharp
public class EmailPublisher
{
  private const string QUEUE = "email-queue";

  public async Task Publish(Email email)
  {
    var fctry = new ConnectionFactory() { HostName = "localhost" };
    using var conn = await fctry.CreateConnectionAsync();
    using var channel = await conn.CreateChannelAsync();

    // Создаём очередь
    await channel.QueueDeclareAsync(
      queue: QUEUE,
      durable: true,
      exclusive: false,
      autoDelete: false,
      arguments: null);

    // Создаём сообщение
    var msg = JsonSerializer.Serialize(email);
    var body = Encoding.UTF8.GetBytes(msg);

    // Публикуем
    await channel.BasicPublishAsync(
      exchange: string.Empty,
      routingKey: QUEUE,
      mandatory: true,
      basicProperties: new BasicProperties { Persistent = true },
      body: body);
  }
}
```

> Пример кода Publisher-а вполне рабочий - я могу наблюдать, что сообщение добавляется в очередь и доступно для дальнейшей обработки. Предложенный в статье код я разместил в файле "EmailPublisher.cs":
>
>```csharp
>using System;
>using System.Text;
>using System.Text.Json;
>using RabbitMQ.Client;
>
>namespace Mq
>{
>    public record Email(string To, string Subject, string Body);
>
>    public class EmailPublisher
>    {
>```
>
>В "Program.cs" добавил код создания экземпляра Publisher-а и добавление сообщения:
>
>```csharp
>using Mq;
>
>var mq = new Mq.EmailPublisher();
>await mq.Publish(new Email("volobuev@gmail.com", "Hello", "First Meeting"));
>```
>
>Интерфейс Rabbit MQ, на первый взгляд - потрясающий!

Параметры очереди:

- durable: сохранять на диске, чтобы очередь не терялась при перезапуске брокера
- exclusive: может ли использоваться другими соединениями
- autoDelete: удалять ли сообщения при отключении последнего потребителя

Получатель прослушивает очередь и обрабатывает сообщения по мере их поступления. Он должен:

- подключиться к RabbitMQ
- подписаться на очередь
- ожидать сообщений
- десериализовывать и обрабатывать сообщения

Рекомендуемый и наиболее удобный способ получения сообщений — настроить подписку с помощью интерфейса IAsyncBasicConsumer. Затем сообщения будут доставляться автоматически по мере их поступления. Один из способов реализации потребителя — использовать класс AsyncEventingBasicConsumer, в котором доставки и другие события жизненного цикла потребителя реализованы как события C#:


```csharp
public class EmailConsumer : BackgroundService
{
  private const string QUEUE = "email-queue";

  protected override async Task ExecuteAsync(CancellationToken ct)
  {
    var fctry = new ConnectionFactory() { HostName = "localhost" };
    using var conn = await fctry.CreateConnectionAsync(ct);
    using var channel = await conn.CreateChannelAsync(cancellationToken: ct);

    await channel.QueueDeclareAsync(
      queue: QUEUE,
      durable: true,
      exclusive: false,
      autoDelete: false,
      arguments: null,
      cancellationToken: ct);

    var consumer = new AsyncEventingBasicConsumer(channel);
    consumer.ReceivedAsync += async (sender, eventArgs) => {

      var body = eventArgs.Body.ToArray();
      var json = Encoding.UTF8.GetString(body);
      var email = JsonSerializer.Deserialize<Email>(json);

      Console.WriteLine($"Email: {email?.To}, Тема: {email?.Subject}");

      // Имитируем отправку email…
      Task.Delay(1000).Wait();

      await ((AsyncEventingBasicConsumer)sender).Channel.BasicAckAsync(
        eventArgs.DeliveryTag, 
        multiple: false);
    };

    await channel.BasicConsumeAsync(
      queue: QUEUE,
      autoAck: true,
      consumer: consumer,
      cancellationToken: ct);
  }
}
```

>Для успешной сборки приложения потребителя сгенерировал по шаблону консольное приложение и, кроме RabbitMQ добавил следующие зависимости:
>
>```shell
>dotnet add package Microsoft.Extensions.Hosting
>dotnet add package Microsoft.Extensions.DependencyInjection
>dotnet add package Microsoft.Extensions.Logging
>```
>
>Начальная часть консольного приложения:
>
>```csharp
>using Microsoft.Extensions.DependencyInjection;
>using Microsoft.Extensions.Hosting; // For BackgroundService
>using Microsoft.Extensions.Logging; // For ILogger
>using System;
>using System.Threading;
>using System.Threading.Tasks;
>using RabbitMQ.Client;
>using RabbitMQ.Client.Events;
>using System.Text;
>using System.Text.Json;
>
>namespace BackgroundServiceDemo
>{
>    public record Email(string To, string Subject, string Body);
>    
>    public class EmailConsumer : BackgroundService
>    {
>```
>
>На старте приложение загрузило из очереди находящиеся там сообщения, но, по каким-то причинам, не извлекало их динамически.
>
>Чтобы добиться получения сообщений по мере их появления в очереди, необходимо в вызове BasicConsumeAsync() поменять значение поля `autoAck` с true на false, а также добавить "бесконечное ожидание" после вызова BasicConsumeAsync():
>
>```csharp
>await channel.BasicConsumeAsync(
>    queue: QUEUE,
>    autoAck: false,
>    consumer: consumer,
>    cancellationToken: ct);
>
>await Task.Delay(Timeout.Infinite, ct);
```

### Типы обмена в RabbitMQ

Обменник (Exchange) в RabbitMQ решает, куда отправить сообщение. Каждый тип обмена имеет свою стратегию маршрутизации сообщений.

1. Direct Exchange (маршрутизация один-к-одному)

Сообщение направляется в очереди с точно таким же ключом маршрутизации. Это как отправка почты определённому получателю. Например, отправка email только в очередь, ответственную за маркетинговую рассылку:

```csharp
channel.ExchangeDeclare(
 "direct-exchange", ExchangeType.Direct);
channel.QueueBind(
 "market-queue", "direct-exchange", "market");
 ```

Если вы отправите сообщение с routingKey: "market" (см. вызов BasicPublishAsync в примере кода производителя), оно попадёт в очередь "market-queue".

2. Fanout Exchange (отправка всем)

Сообщения отправляются во все очереди, связанные с этим обменником, игнорируя routingKey. Например, всеобщая рассылка по всем сервисам (email, СМС):

```csharp
channel.ExchangeDeclare(
 "fanout-exchange", ExchangeType.Fanout);
channel.QueueBind(
 "email-queue", "fanout-exchange", "");
channel.QueueBind(
 "sms-queue", "fanout-exchange", "");
 ```

Любое сообщение, отправленное в "fanout-exchange", попадёт в обе очереди.

3. Topic Exchange (маршрутизация по шаблону)

Использует шаблон routingKey для гибкой настройки:
- * - ровно одно слово,
- # - 0 и более слов.

Например, маршрутизация логов на основе важности и типа системы:

```csharp
channel.ExchangeDeclare(
 "topic-exchange", ExchangeType.Topic);
channel.QueueBind(
 "error-queue", "topic-exchange", "log.error.#");
channel.QueueBind(
 "auth-queue", "topic-exchange", "log.*.auth");
"log.error.auth" – попадёт в обе очереди.
"log.info.auth" – попадёт в auth-queue.
"log.error.database" – попадёт в error-queue.
```

4. Headers Exchange (маршрутизация по метаданным)
Вместо routingKey использует заголовки сообщения. Например, маршрутизация сообщений по сложным условиям (x-type="invoice" и region="EU"):

```csharp
channel.ExchangeDeclare(
 "headers-exchange", ExchangeType.Headers);
var args = new Dictionary<string, object>
{
  {"x-match", "all"}, // либо "any"
  {"x-type", "invoice"},
  {"region", "EU"}
};
channel.QueueBind(
 "invoice-eu-queue", 
 "headers-exchange",
 string.Empty,
 args);
 ```
 
Только сообщения, которые включают и x-type="invoice", и region="EU" в своих заголовках, попадут в очередь "invoice-eu-queue".

### Итого

RabbitMQ — мощный инструмент для создания масштабируемых, слабо связанных систем, а .NET делает его удивительно простым в интеграции. Независимо от того, создаете ли вы микросервисы или просто хотите разгрузить основное приложение от выполнения некоторых длительных задач, RabbitMQ вам поможет.

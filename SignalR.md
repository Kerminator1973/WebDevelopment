# Использование SignalR в ASP.NET Core 8

Базовая статья находится [здесь](https://learn.microsoft.com/en-us/aspnet/core/tutorials/signalr?view=aspnetcore-8.0&tabs=visual-studio).

SignalR предназначен для двухстороннего обмена (полнодуплексный режим) информацией между браузером и web-сервером. В качестве транспорта могут быть использованы технологии: WebSockets, Server-Sent events, или http (Long Polling). Передаваемые сообщения могут быть закодированы различными способами, включая **JSON**, или **MessagePackProtocol** (передача информации со сжатием).

**Server-Sent events** похож на WebSockets, но реализует одностороннее постоянное соединение, в котором сервер может отправлять сообщения клиентам.

По сравнению с **WebSockets**, SignalR предоставляет следующие возможности:

- Автоматическое восстановление соединения
- Альтернативные транспорты
- API для создания _server-to-client remote procedure calls_ (RPC)
- Возможность параллельной отправки сообщений всем клиентам, либо группе клиентов
- Hubs. _A SignalR Hub is a high-level pipeline that enables connected servers and clients to invoke methods on each other_
- Интеграция с механизмами аутентификации пользователей, а также использование Dependency Injection

Слабые стороны SignalR:

- Слабый **QoS**
- Доставка событий не гарантируется. Требуется доработка функционала
- Количество SDK относительно не большое: C#, Java (Android), Python и JavaScript
- Масштабировать использование SignalR достаточно сложно

В банковской сфере SignalR не любят по следующим причинам:

- WebSockets: на старых маршрутизаторах может на хватать entries для хранения всех установленных на данный момент соединений. По этой причине, часть установленных соединений разрывается маршрутизаторами и это приводит к потере части сообщений. В системах мониторинга это выглядит как систематический, не контролируемый разрыв соединений по всей сети
- Long-polling: балансировщик нагрузки должен уметь переадрессовывать запрос на тот же сервер (_Sticky Load Balancing_), который ранее обрабатывал запросы того же SignalR-клиента. Далеко не все балансировщики умеют это делать.

SignalR работает поверж http и https, используя дополнительный заголовок запроса **Upgrade**, чтобы переключиться с HTTP на WebSockets.

## Установка клиентских библиотек (client-side)

В ASP.NET Core входят серверные библиотеки SignalR, но клиентские библиотеки необходимо добавлять в проект.

Для того, чтобы добавить клиентские (браузерные) библиотеки SignalR следует указать курсором мыши в "Solution Explorer" на папку "wwwroot" и выбрать в контекстном меню команду "Add -> Client-Side Library". В появившемся диалоге следует выбрать "unpkg" в поле "Provider". В поле "Library" следует указать `@microsoft/signalr@latest`. Также необходимо выбрать папку, в которую будут помещены исходные тексты приложения - **Target Location**.

Полученные из репозитария js-файлы (папка в "dist") необходимо включить на соответствующей HTML-странице.

В случае использования Visual Studio Code, рекомендуется сначала установить пакет **Microsoft.Web.LibraryManager.Cli**

```shell
dotnet tool install -g Microsoft.Web.LibraryManager.Cli
```

А уже затем установить необходимые компоненты, посредством **libman**:

```shell
libman install @microsoft/signalr@latest -p unpkg -d wwwroot/js/signalr --files dist/browser/signalr.js --files dist/browser/signalr.min.js
```

### Клиентская библиотека для приложения на C\#

 В [лекции Microsoft](https://learn.microsoft.com/ru-ru/training/modules/aspnet-core-signalr-polling-fix/3-refactor-to-signalr) указывается на то, что в проект должны быть добавлены следующие зависимости:

- Microsoft.AspNetCore.SignalR.Client
- Microsoft.AspNetCore.SignalR.Protocols.MessagePack

Protocol.MassagePack добавляет сжатие передаваемой информации - Microsoft рекомендует добавлять его в проекты с SignalR.

## Создание хаба (server-side)

В приложении ASP.NET Core 8, сгенерированном по шаблону в Visual Studio 2022, поддержка SignalR была встроена изначало.

В дополнительных главах книги "C# 10 and .NET 6. Modern Cross-Platform Development" by Mark J. Price, есть пример приложения ASP.NET Core, в котором используется технология SignalR.

**Hub** (_концентратор_) - это точка привязки (Endpoint), в которую серверное приложение передаёт информацию о запросе клиента. Hub - строго-типизированный, т.е. он не может быть использован отдельно от класса, который реализует обработку таких запросов. В статье [Tutorial: Get started with ASP.NET Core SignalR](https://learn.microsoft.com/en-us/aspnet/core/tutorials/signalr?view=aspnetcore-8.0&tabs=visual-studio) приведён следующий пример реализации:

```csharp
using Microsoft.AspNetCore.SignalR;

namespace SignalRChat.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}
```

Метод SendMessage() может быть вызван из JavaScript-кода в браузере, который выглядит следующим образом:

```js
document.getElementById("sendButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var message = document.getElementById("messageInput").value;
    connection.invoke("SendMessage", user, message).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});
```

В реализации SendMessage() мы отправляем полученное сообщение всем клиентам, используя **Clients.All.SendAsync**().

Если мы хотим отправлять сообщения SignalR из контроллера web-сервера, следует использовать механизм **Dependency Injection**. Например:

```csharp
public class EventModel : PageModel
{
    private static IHubContext<CinnaHub>? _hubContext = null;

    public EventModel(IHubContext<CinnaHub> hub)
    {
        _hubContext = hub;
    }

    public async Task<ActionResult> OnPostChangeStateAsync([FromBody] StorageStateDTO val)
    {
        try
        {
            await _hubContext.Clients.All.SendAsync("onStatusChange", val.storageId, val.state);
```

### Лучшие практики

```csharp
// Плохой пример: список параметров разрастается, код становится хуже управляемым
public void SendMessage(string to, string body);

// Лучший пример: создаём отдельный класс Message, который удобно расширять
// и это слабо влияет на управляемость программного кода
public class Message
{
    public string To { get; set; }
    public string Body { get; set; }
}

public void SendMessage(Message message);
```

## Инициализация Dependency Injection

В файл "Program.cs" следует внести следующие изменения:

```csharp
builder.Services.AddRazorPages();
builder.Services.AddSignalR();  // <-- Добавляем базовый сервис SignalR
// ...
var app = builder.Build();
// ...
app.MapHub<CinnaHub>("/monitoringHub"); // <-- Указываем Endpoint для концентратора
app.Run();
```

Если от клиента будет получен запрос на подлючение к "/monitoringHub", то этот запрос будет передаваться экземпляру класса CinnaHub. Отсюда следует, что в приложении может быть реализовано несколько разных концентраторов SignalR.

```csharp
app.MapHub<AnotherSignalRHub>("/anotherHub");
```

## Отправить сообщение по ConnectionId

При получении сообщения о подключении нового пользователя мы можем узнать уникальный номер подключённого (**ConnectionId**) и даже отправить сообщение этому потребителю:

```csharp
public override async Task OnConnectedAsync()
{
    string connectionIdSafe = (Context?.ConnectionId ?? "Unknown");

    try
    {
        Debug.WriteLine($"New connection: {connectionIdSafe}");

        // Отправляем сообщение клиенту при подключении клиента к серверу
        await Clients.Client(connectionIdSafe).SendAsync("onInit");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"{connectionIdSafe} failed to connect: {ex.Message}");
        throw;  // Пробрасываем исключение выше по коду, не изменяя Stack information
    }
    finally
    {
        await base.OnConnectedAsync();
    }
}
```

## Получение сообщений в клиентской части

В клиентском JavaScript-коде следует добавить следующие команды:

```js
document.addEventListener('DOMContentLoaded', function (event) {

    // Взаимодействие посредством SignalR
    var connection = new signalR.HubConnectionBuilder().withUrl("/monitoringHub").build();

    connection.on("onStatusChange", function (storageId, status) {
        console.log(`Received new status: ${storageId} = ${status}`);
    });

    connection.start().then(function () {
        
        // Здесь можно отправить стартовое сообщение. Например:
        connection.invoke("SendMessage", "Petrov", "Hello, SignalR!").catch(function (err) {
            return console.error(err.toString());
        });

    }).catch(function (err) {
        return console.error(err.toString());
    });
});
```

## Конфигурирование SignalR

Мы можем настроить условия работы SignalR (options), при добавлении сервиса, например:

```csharp
services.AddSignalR(options => {
    // Настройка параметров концентратора SignalR
    options.EnableDetailedErrors = true;
})
    .WithAutomaticReconnect()   // <-- Автоматическое восстановление соединения
    .AddMessagePackProtocol();  // <-- Активация режима сжатия сообщений
```

В приведённом выше примере, мы активируем использование MessagePackProtocol, автоматическую переустановку соединения при потере связи, а также добавляем детализованную информацию об ошибках в работе механизма.

Следует заметить, что если мы вызываем **WithAutomaticReconnect**() без параметров, то клиент настраивает ожидание 0, 2, 10 и 30 секунд соответственно, прежде чем пытаться выполнить каждую попытку повторного подключения, остановившись после четырех неудачных попыток. Т.е. в этом варианте, соединение может не быть автоматически восстановлено, если связь отсутствовала больше 45 секунд.


Обработка восстановления соединения может выглядеть следующим образом (директивы логирования опущены для уменьшения объёма кода):

```csharp
connection.Closed += async (error) =>
{
    await Task.Delay(Random.Shared.Next(2000, 5000));

    // Запускаем метод мультиплексора, которой многократно пытается подключиться
    // к адаптеру, пока не преуспеет в этом
    await Start();
};

connection.Reconnecting += (error) =>
{
    return Task.CompletedTask;
};

connection.Reconnected += (message) =>
{
    return Task.CompletedTask;
};
```

## Что рекомендует делать Microsoft

Microsoft [рекомендует](https://learn.microsoft.com/ru-ru/training/modules/aspnet-core-signalr-polling-fix/3-refactor-to-signalr) определить интерфейс с методами, на которые будут подписываться клиенты:

```csharp
namespace BlazingPizza.Server.Hubs;

public interface IOrderStatusHub
{
    /// <summary>
    /// This event name should match <see cref="OrderStatusHubConsts.EventNames.OrderStatusChanged"/>,
    /// which is shared with clients for discoverability.
    /// </summary>
    Task OrderStatusChanged(OrderWithStatus order);
}
```

В реализации интерфейса Microsoft предлагает определить два метода, которые позволят пользователям подписываться и отписываться на получение событий:

```csharp
namespace BlazingPizza.Server.Hubs;

[Authorize]
public class OrderStatusHub : Hub<IOrderStatusHub>
{
    /// <summary>
    /// Adds the current connection to the order's unique group identifier, where 
    /// order status changes will be notified in real-time.
    /// This method name should match <see cref="OrderStatusHubConsts.MethodNames.StartTrackingOrder"/>,
    /// which is shared with clients for discoverability.
    /// </summary>
    public Task StartTrackingOrder(Order order) =>
        Groups.AddToGroupAsync(
            Context.ConnectionId, order.ToOrderTrackingGroupId());

    /// <summary>
    /// Removes the current connection from the order's unique group identifier, 
    /// ending real-time change updates for this order.
    /// This method name should match <see cref="OrderStatusHubConsts.MethodNames.StopTrackingOrder"/>,
    /// which is shared with clients for discoverability.
    /// </summary>
    public Task StopTrackingOrder(Order order) =>
        Groups.RemoveFromGroupAsync(
            Context.ConnectionId, order.ToOrderTrackingGroupId());
}
```

Т.е. когда мы получаем событие в Hub, у нас есть идентификатор клиентской сессии, доступ к которой осуществляется через **Context.ConnectionId**. Также мы можем включать, или исключать соединение из группы, используя методы AddToGroupAsync() и RemoveFromGroupAsync(). Первый параметр вызовов - идентификатор соединения, а второй - имя группы (string).

Соответственно, мы можем отправить некоторое сообщение всем соединениям, которые входят в группу. Например:

```csharp
await Clients.Group(groupname).SendAsync("Notify", $"{username} вошел в чат");
```

## Отправка сообщений конкретному аутентифицированному пользователю по его имени

Мы можем использовать Context.ConnectionId для того, чтобы создать группу подключения для конкретного пользователя:

```csharp
public override Task OnConnectedAsync()
{
    string userId = _userManager.GetUserId(this.Context.User);
    if (null != userId) {

        // При создании соединения, связываем конкретное соединение 
        // с GUID-пользователя, который подключается к SignalR
        await Groups.AddToGroupAsync(Context.ConnectionId, userId);
```

Отправить сообщение такому пользователю можно было бы выбрав группу с его/её именем:

```csharp
await _hubContext.Clients.Group(u).SendAsync("Send", message);
```

Однако, чтобы список групп не разрастался, можно систематически находить пустые группы (в которых нет реальных соединений) и удалять их.

### Управление пользователями в группах - то, что самое, но другими словами от Microsoft

В соответствии с [рекомендациями Microsoft](https://learn.microsoft.com/en-us/aspnet/signalr/overview/guide-to-the-api/working-with-groups) не нужно вручную удалять пользователей из групп. В примерах, Microsoft приводит вот такой код:

```csharp
public class ContosoChatHub : Hub
{
    public Task JoinRoom(string roomName)
    {
        return Groups.Add(Context.ConnectionId, roomName);
    }

    public Task LeaveRoom(string roomName)
    {
        return Groups.Remove(Context.ConnectionId, roomName);
    }
}
```

Вот что написано в [старой документации](https://learn.microsoft.com/en-us/aspnet/signalr/overview/guide-to-the-api/handling-connection-lifetime-events?source=recommendations) по SignalR: "_SignalR connection refers to a logical relationship between a client and a server URL, maintained by the SignalR API and uniquely identified by a connection ID. The data about this relationship is maintained by SignalR and is used to establish a transport connection. The relationship ends and SignalR disposes of the data when the client calls the Stop method or a timeout limit is reached while SignalR is attempting to re-establish a lost transport connection_". Т.е. как только SignalR понимает, что соединение с клиентом завершилось, он автоматически удаляет всю информацию об этом соединении.

## Что было сделано в Garmr. TODO: Переработать! Отвязать от Garmr!

В конструкторе GarmrHub включены зависимости: `UserManager<ApplicationUser> userManager, ILogger<GarmrHub> logger`

Реализованы статические методы, которые могут быть вызваны компонентами web-сервера (например, планировщиком CmdActionTask).

```csharp
GarmrHub.onUpdateRunningTask(actionTask);
```

В реализации каждого глобального статического метода выполняется обязательная проверка на наличие Hub-а:

```csharp
if (null != _hubContext)
{
    // ...некоторый код
}
```

Довольно много смешанного кода (синхронный/асинхронный). Для того, чтобы дождаться выполнения асинхронного вызова, используется явное завершение ожидания `.GetAwaiter().GetResult()`:

```csharp
static public void onUpdateRunningTask(CmdActionTask obj)
{
    // ... какой-то код
    _hubContext.Clients.Group("TechAdministrators").SendAsync("UpdateTask", sb.ToString()).GetAwaiter().GetResult();
}
```

В проекте очень активно используются группы для адресной рассылки сообщений.

Callback-функция OnConnectedAsync() используется для добавления соединения в группу конкретного пользователя, если этот пользователь был успешно аутентифицирован:

```csharp
/// <summary>
/// Callback-метод, вызывается при получении запроса на соединение
/// от браузера. Часть функционала, связанного с библиотекой SignalR
/// </summary>
public override Task OnConnectedAsync()
{
    string userId = _userManager.GetUserId(this.Context.User);
    if (null != userId) {

        // При создании соединения, связываем конкретное соединение 
        // с GUID-пользователя, который подключается к SignalR
        Groups.AddToGroupAsync(Context.ConnectionId, userId);
    }
    
    return base.OnConnectedAsync();
}
```

Таким образом обеспечивается отправка уведомлений, имеющих отношение только к конкретному пользователю со страниц, на которых этот пользователь аутентифицирован.

Регистрация SignalR выполняется также, как и в ASP.NET Core 8:

```csharp
services.AddSignalR();
```

Однако, дополнительно выполняется конфигурирование SignalR с целью настройки режима подключения:

```csharp
services.Configure<SignalRConfiguration>(Configuration.GetSection("SignalRConfiguration"));
```

Настройка выглядит следующим образом:

```json
"SignalRConfiguration": {
"Protocol": "LongPolling" //WebSockets
},
```

Endpoint для SignalR указывается чуть другим способом:

```csharp
app.UseEndpoints(endpoints => {
    endpoints.MapHub<GarmrHub>("/garmr"); // Добавляем Routing для SignalR
    endpoints.MapRazorPages();
});
```

### CinnaPages - заработал следующий код

В **CinnaHub** заработал вот такой код:

```csharp
using Microsoft.AspNetCore.SignalR;

namespace CinnaPages.Hubs
{
    public class CinnaHub : Hub
    {
        private static IHubContext<CinnaHub>? _hubContext;

        public CinnaHub(IHubContext<CinnaHub> hubContext)
        {
            _hubContext = hubContext;
        }

        // Метод используется для отправки сообщения об изменении состояния ХЦК
        static public async Task SendStatusChange(int storageId, int status)
        {
            if (_hubContext != null)
            {
                await _hubContext.Clients.All.SendAsync("onStatusChange", storageId, status);
            }
        }
    }
}
```

Крайне важно было использовать модификаторы **static** для IHubContext<> и для асинхронного метода.

После этого можно из любого места вызывать этот метод:

```csharp
public class EventModel : PageModel
{
    public async Task<ActionResult> OnPostChangeStateAsync([FromBody] StorageStateDTO val)
    {
        try
        {
            await CinnaHub.SendStatusChange(val.storageId, val.state);
```

## Использование групп для ограничения рассылки данных

Общая логика работы может быть такая - клиент подписывается на получение информации в конкретной группе и сервер посылает клиенту сообщение только через группу.

Оформления подписки клиентом может выглядеть следующим образом:

```js
connection.start().then(function () {

    const _thisStorageId = $("#StorageID").text();
    connection.invoke("StartObservation", _thisStorageId).catch(function (err) {
        return console.error(err.toString());
    });           

}).catch(function (err) {
    return console.error(err.toString());
});
```

Соответствующий метод на сервере может выглядеть так:

```csharp
public class CinnaHub : Hub
{
    public async Task StartObservation(string storage)
    {
        if (_hubContext != null)
        {
            await _hubContext.Groups.AddToGroupAsync(this.Context.ConnectionId, storage);
        }
    }
}
```

Для отправки сообщения клиенту, может быть использован вот такой код:

```csharp
public class CinnaHub : Hub
{
    static public async Task SendModuleStatusChange(int storageId, int moduleId, int status)
    {
        if (_hubContext != null)
        {
            await _hubContext.Clients.Groups(storageId.ToString()).SendAsync("onModuleStatusChange", moduleId, status);
        }
    }
}
```

## Создать рабочий поток в приложении ASP.NET Core

В приложении ASP.NET Core 8 можно создать класс-Singleton, который создаст поток исполнения и будет циклически выполнять некоторое действие. Для этого необходимо определить класс, в котором есть метод, запускающий отдельный поток и вызывать этот метод из конструктора:

```csharp
public interface ITaskSingleton
{
    public void Loop();
}

public class TaskSingleton : ITaskSingleton
{
    public void Loop()
    {
        Task TimerTask = Task.Run(async () => {
            try
            {
                for (;;)
                {
                    // ... <-- Здесь выполняем какую-то полезную нагрузку
                    await Task.Delay(10 * 1000);
                }
            }
            catch
            {
                await Task.Delay(300 * 1000);
                // В случае возникновения исключения, мы выйдем из цикла for(;;)
                Loop();
            }
        });
    }
}
```

Затем, необходимо в "Program.cs" зарегистрировать Singleton:

```csharp
builder.Services.AddSingleton<ITaskSingleton, TaskSingleton>();
```

После этого, нужно создать экземпляр singleton-а, и вызвать у него метод Loop:

```csharp
var service = app.Services.GetService<ITaskSingleton>();
service?.Loop();
```

Время жизни singleton-а соответствует времени жизни приложения. Цикл внутри задачи будет выполняться до завершения приложения. Стоит заметить, что Singleton будет создан при первом его запросе посредством GetService(). Вызывать конкретный метод singleton-а не обязательно.

## Клиент SignalR в клиентском приложении на C\# (WPF, Avalonia, и т.д.)

Ключевая [статья](https://learn.microsoft.com/ru-ru/aspnet/core/signalr/dotnet-client?view=aspnetcore-8.0&tabs=visual-studio)

Для подключения клиента SignalR к SignalR-концентратору необходимо установить зависимость:

```csharp
Microsoft.AspNetCore.SignalR.Client
```

Нам следует создать Singleton, в котором создаётся экземпляр HubConnection, например:

```csharp
public class TaskSingleton : ITaskSingleton
{
    HubConnection? connection = null;

    public TaskSingleton()
    {
        connection = new HubConnectionBuilder()
                        .WithUrl("wss://localhost:8080/adapterHub")
                        .Build();

        connection.Closed += async (error) =>
        {
            await Task.Delay(Random.Shared.Next(2000, 5000));
            await connection.StartAsync();
        };
    }
```

В конструкторе мы формируем соединение, указывая IP-адрес и порт компьютера, к которому мы подключаемся, протокол подключения (wss) и Endpoint (/adapterHub). Следует обратить особое внимание на протокол подключения - легитимными вариантами являются ws (WebSockets) и wss (WebSockets Secure). И сервер, и клиент должны использовать один и тот же протокол.

> ВНИМАНИЕ! Достаточно частая ошибка комбинирования имени хоста и Endpoint-а состоит в том, что и в конце имени хоста, и в начале Endpoint-а используется косая черта. В этом случае может получится, например, вот такой адрес: `wss://localhost:8080//adapterHub`. Адрес с двумя следующими подряд косыми чертами не корректный и это приводит к ошибке подключения. На практике проблема возникает, если оператор копирует адрес сервера, к которому подключается из браузера и меняет протокол. Например, копирует `https://localhost:8080/` и заменяет на `wss://localhost:8080/`, не удалив завершающую косую черту. Устранять подобные ошибки достаточно сложно.

Мы можем добавить логирование работы движка SignalR, используя chaining methods:

```csharp
var connection = new HubConnectionBuilder()
    .ConfigureLogging(logging =>
    {
        // Для поиска причин сбоя в подключении по WebSockets добавляем
        // максимальную трассировку в консоль
        logging.SetMinimumLevel(LogLevel.Trace);
        logging.AddConsole();
    })
    .WithUrl(url)
    .Build();
```

Далее, нам следует определить метод, который откроет соединение и подпишется на некоторые сообщения от SignalR-концентратора:

```csharp
public interface ITaskSingleton
{
    public Task Start();
}

public async Task Start()
{
    if (connection != null)
    {
        if (connection.State != HubConnectionState.Connected)
        {
            connection.On<string, string>("ReceiveMessage", (user, message) =>
            {
                Console.WriteLine($"I has got a message ({message}) from {user}");
            });

            await connection.StartAsync();
        }
    }
}
```

Ключевым является вызов `connection.StartAsync()`, который устанавливает соединение с SignalR-концентратором. После того, как соединение будет установлено, можно будет отправлять сообщения, или получить их по подписке:

```csharp
public async Task SendMessage()
{
    if (connection != null)
    {
        try
        {
            await connection.InvokeAsync("SendMessage", "Monitoring", "Here is the monitoring!");
        }
        catch (Exception)
        {
        }
    }
}
```

### Соединение с повторными попытками подключения

Вызов метод StartAsync() может завершиться по тайм-ауту без установки соединения. Проверить, что соединение не удалось установить можно проверкой текущего состояния соединения `connection.State` значению `HubConnectionState.Disconnected`. Для того, чтобы в подобной ситуации установить соединение, следует периодически вызывать метод StartAsync(). Пример реализации:

```csharp
public static async Task<bool> ConnectWithRetryAsync(HubConnection connection, CancellationToken token)
{
    // Keep trying to until we can start or the token is canceled.
    while (true)
    {
        try
        {
            await connection.StartAsync(token);
            Debug.Assert(connection.State == HubConnectionState.Connected);
            return true;
        }
        catch when (token.IsCancellationRequested)
        {
            return false;
        }
        catch
        {
            // Failed to connect, trying again in 5000 ms.
            Debug.Assert(connection.State == HubConnectionState.Disconnected);
            await Task.Delay(5000);
        }
    }
}
```

Этот пример взят из статьи [ASP.NET Core SignalR .NET Client](https://learn.microsoft.com/en-us/aspnet/core/signalr/dotnet-client?view=aspnetcore-8.0&tabs=visual-studio) by Microsoft.

Стоит отметить, что получить CancellationToken можно используя экземпляр класса CancellationTokenSource. Класс CancellationTokenSource - позволяет остановить асинхронную операцию посредством вызова метода Cancel(). Эксземпляр класса CancellationToken используется внутри Task-а для того, чтобы определить, было ли запрошено прерывания задачи (task-а) внешним кодом.

### Настройка коммуникационного порта для SignalR-концентратора

Для SignalR не создаётся какого-то особенного порта, он использует тот же самый порт, который устанавливается для http/https Endpoint-ов web-сервера. Если мы запускаем приложение из под Visual Studio, то этот инструмент выделяет некоторый порт "по умолчанию". Чтобы установить конкретный, фиксированный номер порта, следует создать **профиль запуска**. Для это следует перейти в свойства Solution-а, найти раздел "Debug -> General" и нажать на ссылку "Open debug launch profiles UI". Откроется форма, в которой можно настроить параметры профилей http, https, "IIS Express". Если мы, например, запускаем приложение по https, то следует выбрать профиль https, найти в нём параметр "App URL" и установить нужный нам порт, например: "https://localhost:8080;http://localhost:5086"

При изменении параметров Visual Studio создаст файл "\Properties\launchSettings.json", в котором будет сохранена соответствующая настройка, например:

```json
{
  "profiles": {
    "https": {
      "commandName": "Project",
      "launchBrowser": true,
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      },
      "dotnetRunMessages": true,
      "applicationUrl": "https://localhost:8080;http://localhost:5086"
    }
  }
}
```

ВНИМАНИЕ! В приведённом выше примере отражается только часть файла "\Properties\launchSettings.json".

## Заготовки для тестирования кода

Разметка для отправки сообщения концентратору SignalR:

```html
<div class="row p-1">
    <div class="col-1">User</div>
    <div class="col-5"><input type="text" id="userInput" /></div>
</div>
<div class="row p-1">
    <div class="col-1">Message</div>
    <div class="col-5"><input type="text" class="w-100" id="messageInput" /></div>
</div>
<div class="row p-1">
    <div class="col-6 text-end">
        <input type="button" id="sendButton" value="Send Message" />
    </div>
</div>
```

JavaScript-код для отправки введённого текста через концентратор SignalR:

```js
document.getElementById("sendButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var message = document.getElementById("messageInput").value;
    connection.invoke("SendMessage", user, message).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});
```

## Подтверждение получения сообщения

Используя Developer Console, можно увидеть много интересных вещей:

- В обе стороны ходят сообщения типа 6 (ping)
- В сообщениях есть поле "invocationId", который может быть использован для чего?
- Аргументы вызова функции передаются в массиве

Сообщение от js-клиента серверу:

```js
const obj = {
    user: "Petrov",
    message: "Hello, SignalR!"
};

connection.invoke("SendMessage", obj)
    .then(function () {
        console.log("AcceptedProcessed");
    })
    .catch(function (err) {
    return console.error(err.toString());
});
```

```json
{
	"arguments": [{
		"user": "Petrov",
		"message": "Hello, SignalR!"
	}],
	"invocationId": "2",
	"target": "SendMessage",
	"type": 1
}
```

Ответ сервера клиенту:

```json
{
	"type": 3,
	"invocationId": "2",
	"result": null
}
```

Как мы видим, сервер возвращает клиенту **invocationId**, что позволяет предположить, что SignalR использует механизм подтверждения обработки сообщения, т.е. постарается гарантированно доставить сообщение серверу.

Сообщение сервера клиенту:

```csharp
var answer = new MessageWrapper { user = $"{wrapper.user} -> Server", message = wrapper.message };
await Clients.All.SendAsync("ReceiveMessage", answer);
```

```json
{
	"type": 1,
	"target": "ReceiveMessage",
	"arguments": [{
		"user": "Petrov -> Server",
		"message": "Hello, SignalR!"
	}]
}
```

## Обработка завершения вызова

Клиентская JavaScript-библиотека SignalR позволяет обработать успешную доставку конкретного сообщения используя метод then() из Promise, который возвращает метод `connection.invoke()`:

```js
const obj = {
    user: "Petrov",
    message: "Hello, SignalR!"
}

connection.invoke("SendMessage", obj)
    .then(function () {
        console.log("AcceptedProcessed");
    })
    .catch(function (err) {
        console.error(err.toString());
    });
```

## Изменение размера буфера

По умолчанию, в SignalR используется буфер размером 32КБ. Любые сообщения, размер которых превышает этот буфер, не будут обработаны корректно. Увеличить размер буфера можно следующим образом:

```cs
.AddSignalR(options =>
    {
        // Установка максимального размера сообщения.
        options.MaximumReceiveMessageSize = 128000;
    });
```

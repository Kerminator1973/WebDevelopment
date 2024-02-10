# Использование SignalR в ASP.NET Core 8

Базовая статья находится [здесь](https://learn.microsoft.com/en-us/aspnet/core/tutorials/signalr?view=aspnetcore-8.0&tabs=visual-studio).

SignalR предназначен для двухстороннего обмена (полнодуплексный) информацией между браузером и web-сервером. В качестве транспорта может быть использована технологий WebSockets, или http (LongPolling). Передаваемые сообщения могут быть закодированы различными способами, включая **JSON**, иди **MessagePackProtocol**.

## Установка клиентских библиотек (client-side)

Для того, чтобы добавить клиентские (браузерные) библиотеки SignalR следует указать курсором мыши в "Solution Explorer" на папку "wwwroot" и выбрать в контекстном меню команду "Add -> Client-Side Library". В появившемся диалоге следует выбрать "unpkg" в поле "Provider". В поле "Library" следует указать `@microsoft/signalr@latest`. Также необходимо выбрать папку, в которую будут помещены исходные тексты приложения Target Location.

Полученные из репозитария js-файлы (папка в "dist") необходимо включить на соответствующей странице.

## Создание хаба (server-side)

В приложении ASP.NET Core 8, сгенерированном по шаблону в Visual Studio 2022, поддержка SignalR была встроена изначало. Однако, в [лекции Microsoft](https://learn.microsoft.com/ru-ru/training/modules/aspnet-core-signalr-polling-fix/3-refactor-to-signalr) указывается на то, что в проект должны быть добавлены следующие зависимости:

- Microsoft.AspNetCore.SignalR.Client
- Microsoft.AspNetCore.SignalR.Protocols.MessagePack

Protocol.MassagePack добавляет сжатие передаваемой информации - Microsoft рекомендует добавляеть его в проекты с SignalR.

Hub - это точка привязки (Endpoint), в которую серверное приложение передаёт информацию о запросе клиента. Hub - строготипизированный, т.е. он не может быть использован отдельно от класса, который реализует обработчку таких запросов. В статье [Tutorial: Get started with ASP.NET Core SignalR](https://learn.microsoft.com/en-us/aspnet/core/tutorials/signalr?view=aspnetcore-8.0&tabs=visual-studio) приведён следующий пример реализации:

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
    private IHubContext<CinnaHub> _hubContext;

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

## Инициализация Dependency Injection

В файл "Program.cs" следует внести следующие изменения:

```csharp
builder.Services.AddRazorPages();
builder.Services.AddSignalR();  // <--
app.MapHub<CinnaHub>("/monitoringHub"); // <--
app.Run();
```

Следующая строка позволяет указать URI-путь, при получении которого серверное приложение будет передавать управление экземпляру класса:

```csharp
app.MapHub<CinnaHub>("/monitoringHub"); // <--
```

Другими словами, если от клиента будет получен запрос на подлючение к "/monitoringHub", то этот запрос будет передаваться объекту класса CinnaHub. Отсюда следует, что в приложении может быть реализовано несколько разных Hub-ов SignalR.

Для того, чтобы работал механизм внедрения SignalR в использующие его компоненты web-приложения, достаточно зарегистрировать соответствующий сервис:

```csharp
builder.Services.AddSignalR();
```

## Получение сообщений в клиентской части

В клиентском JavaScript-коде следует добавить следующие команды:

```js
jQuery(function () {
    // Взаимодействие посредством SignalR
    var connection = new signalR.HubConnectionBuilder().withUrl("/monitoringHub").build();

    connection.on("onStatusChange", function (storageId, status) {
        console.log(`Received new status: ${storageId} = ${status}`);
    });

    connection.start().then(function () {
        
    }).catch(function (err) {
        return console.error(err.toString());
    });
});
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

## Конфигурирование SignalR

Мы модем настроить условия работы SignalR (options), при добавлении сервиса, например:

```csharp
services.AddSignalR(options => options.EnableDetailedErrors = true)
    .WithAutomaticReconnect()
    .AddMessagePackProtocol();
```

В приведённом выше примере, мы активируем использование MessagePackProtocol, автоматическую переустановку соединения при потере связи и добавляет детализованную информацию об ошибках в работе механизма.

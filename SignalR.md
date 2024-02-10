# Использование SignalR в ASP.NET Core 8

Базовая статья находится [здесь](https://learn.microsoft.com/en-us/aspnet/core/tutorials/signalr?view=aspnetcore-8.0&tabs=visual-studio).

SignalR предназначен для двухстороннего обмена (полнодуплексный) информацией между браузером и web-сервером. В качестве транспорта может быть использована технологий WebSockets, или http (LongPolling). Передаваемые сообщения могут быть закодированы различными способами, включая **JSON**, иди **MessagePackProtocol**.

## Установка клиентских библиотек (client-side)

Для того, чтобы добавить клиентские (браузерные) библиотеки SignalR следует указать курсором мыши в "Solution Explorer" на папку "wwwroot" и выбрать в контекстном меню команду "Add -> Client-Side Library". В появившемся диалоге следует выбрать "unpkg" в поле "Provider". В поле "Library" следует указать `@microsoft/signalr@latest`. Также необходимо выбрать папку, в которую будут помещены исходные тексты приложения Target Location.

Полученные из репозитария js-файлы (папка в "dist") необходимо включить на соответствующей странице.

## Создание хаба

В статье [Tutorial: Get started with ASP.NET Core SignalR](https://learn.microsoft.com/en-us/aspnet/core/tutorials/signalr?view=aspnetcore-8.0&tabs=visual-studio) приведён следующий пример реализации:

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

Если мы хотим отправлять сообщения SignalR со страницы, следует использовать Dependency Injection:

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
// Add services to the container.
builder.Services.AddRazorPages();

// Добавляем сервис, который теперь можно внедрять, как зависимость на страницы ASP.NET Core
builder.Services.AddSignalR();  // <--

// Подключению к SignalR со стороны клиента будет осуществляться по следующему пути:
app.MapHub<CinnaHub>("/monitoringHub"); // <--

app.Run();
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

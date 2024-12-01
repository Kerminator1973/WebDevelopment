# Запуск процесса из web-приложения

Существует огромное количество задач, в которых необходимо запустить некоторый процесс из web-приложения, получить контроль над стандартным потоком вывода и стандартным потоком ошибкок, перехватить данные, обработать и передать пользователю в браузер. Таким образом, например, можно сделать песочницу для выполнения программного кода, разработанного на мобильном телефоне. Сервер запускает процесс компиляции, затем запускает скомпилированный код, перехватывает вывод и возвращает его пользователю в браузер мобильного телефона.

В web-приложении на ASP.NET Core, сделать это можно следующим образом:

```csharp
static async Task<string> RunCommandAsync(string command, string arguments)
{
    var tcs = new TaskCompletionSource<string>();

    var processStartInfo = new ProcessStartInfo
    {
        FileName = command,
        Arguments = arguments,
        RedirectStandardOutput = true,
        RedirectStandardError = true,
        UseShellExecute = false,
        CreateNoWindow = true
    };

    processStartInfo.EnvironmentVariables["PGPASSWORD"] = "38Gjgeuftd";

    using (var process = new Process { StartInfo = processStartInfo })
    {
        process.Start();
   
        string output = process.StandardOutput.ReadToEnd();
        string error = process.StandardError.ReadToEnd();

        await process.WaitForExitAsync();

        tcs.TrySetResult(output);
    }

    return await tcs.Task;
}
```

В приведённом выше примере создаётся объект завершения потока - TaskCompletionSource, с указанием типа возвращаемого значения `<string>`. Далее заполняется управляюащя структура, в которой указывается имя приложения, параметры и необходимость перенаправления вывода. Затем указываются переменные окружения.

В завершающей части создаётся экземпляр класса Process, который запускается на выполнение.

StandardOutput и StandardError позволяют перехватить стандартный вывод и ошибки.

Вызов WaitForExitAsync() ожидает завершение процесса.

Следующая строка позволяет скопировать результат для его дальнейшей обработки:

```csharp
tcs.TrySetResult(output);
```

Мы можем не ждать получения всех данных, а получать их строка за строкой. Это можно сделать так:

```csharp
static async Task<string> RunCommandAsync(string command, string arguments)
{
    // ...
    using (var process = new Process { StartInfo = processStartInfo })
    {
        process.OutputDataReceived += (sender, e) =>
        {
            if (e.Data != null)
            {
                tcs.TrySetResult(e.Data);
            }
        };

        process.ErrorDataReceived += (sender, e) =>
        {
            if (e.Data != null)
            {
                tcs.TrySetResult(e.Data);
            }
        };

        process.Start();
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();

        await process.WaitForExitAsync();
    }

    return await tcs.Task;
}
```

Вызов helper-а может выглядеть следующим образом:

```csharp
string dateTime = DateTime.Now.ToString("yyyyddMM_Hmmss");
var filePath = Path.Combine(path, $"backup_{ dateTime}.bak");

string arguments = $"-U {username} -h 127.0.0.1 --port {port} {database}";
string result = await RunCommandAsync("c:/Program Files/PostgreSQL/16/bin/pg_dump.exe", arguments);

// Сохраняем результат операции в файл
using (StreamWriter writer = new StreamWriter(filePath))
{
    await writer.WriteLineAsync(result);
}
```

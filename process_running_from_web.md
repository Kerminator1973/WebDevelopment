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

## Запуск процесса в Linux-системах

Для запуска внешних процессов в Linux используется shell. Часто применяется `bash`, размещённый в папке bin-е, но в системе могут быть использованы и альтернативные варианты, такие как: `/bin/sh`, `/bin/busybox`. Для простоты мы можем явно указывать, какой shell следует использовать для запуска нужной нам команды:

```csharp
StartInfo = new ProcessStartInfo
{
	FileName = "/bin/bash",
	Arguments = $"-c \"{escapedArgs}\"",
	RedirectStandardOutput = true,
	UseShellExecute = false,
	CreateNoWindow = true,
}
```

Однако более универсальным ваиантом является использование переменной окружения`$SHELL`, в которой передаётся путь к используемой shell.

Получить значение переменной можно используя функцию **GetEnvironmentVariable**():

```csharp
string shellPath = Environment.GetEnvironmentVariable("SHELL");
Console.WriteLine($"Shell: {shellPath}");
```

Для примера, в качестве аргументов shell может быть команда получения списка подключенных блочных устройств:

```shell
lsblk -f
```

### Полный пример

Ниже приведён полный пример _extension method_, который используется в Linux-приложениях:

```csharp
public static class ShellHelper
{
    public static string Bash(this string cmd)
    {
        var escapedArgs = cmd.Replace("\"", "\\\"");

        string shellPath = Environment.GetEnvironmentVariable("SHELL");

        var process = new Process()
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = shellPath,
                Arguments = $"-c \"{escapedArgs}\"",
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            }
        };
        process.Start();
        string result = process.StandardOutput.ReadToEnd();
        process.WaitForExit();
        return result;
    }
}
```

Вызов команды может выглядеть следующим образом:

```csharp
var output = "upsc battery 2>1".Bash();
```

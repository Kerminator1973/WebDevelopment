# При публикации проекта Blazor использует Node.js

При публикации проекта, Blazor "под капотом" использует Node.js и JavaScript-код для трансляции IL-сборок в wasm-пакеты. При этом собирается не только код проекта, но и весь Runtime. Время сборки и количество ресурсов, которые при этом используются - значительные, на грани критических!

Ниже приведены логи сборки проекта:

```output
c:\Jenkins_Work\workspace\build_SPCD\ServicePartners.Client\ServicePartners.Client.csproj : warning NU1900: Error occurred while getting package vulnerability data: Unable to load the service index for source https://api.nuget.org/v3/index.json.
  Optimizing assemblies for size may change the behavior of the app. Be sure to test after publishing. See: https://aka.ms/dotnet-illink
  Compiling native assets with emcc with -Oz. This may take a while ...
  [1/3] pinvoke.c -> pinvoke.o [took 1,35s]
  [2/3] corebindings.c -> corebindings.o [took 1,35s]
  [3/3] driver.c -> driver.o [took 1,39s]
```

Emcc – это компилятор Emscripten, который компилирует код на C++ в WebAssebly. И он действительно компилирует несколько низкоуровневых файлов (см. выше).

Далее компилятор собирает .NET для Wasm из исходников:

```output
  Linking for initial memory $(EmccInitialHeapSize)=21495808 bytes. Set this msbuild property to change the value.
  Linking with emcc with -O2. This may take a while ...
…
"C:\Jenkins_Work\workspace\build_SPCD\ServicePartners.Client\obj\Any CPU\Release\net8.0\wasm\for-publish\pinvoke.o" "C:\Jenkins_Work\workspace\build_SPCD\ServicePartners.Client\obj\Any CPU\Release\net8.0\wasm\for-publish\driver.o" "C:\Jenkins_Work\workspace\build_SPCD\ServicePartners.Client\obj\Any CPU\Release\net8.0\wasm\for-publish\corebindings.o" "C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Runtime.Mono.browser-wasm\8.0.11\runtimes\browser-wasm\native\libicudata.a" "C:\Program
```

Инструментальные средства из состава .NET используют Node.js и код на JavaScript при публикации проекта:

```output
"C:\Program Files\dotnet\packs\Microsoft.NET.Runtime.Emscripten.3.1.34.Node.win-x64\8.0.11\tools\bin\node.exe" "C:\Program Files\dotnet\packs\Microsoft.NET.Runtime.Emscripten.3.1.34.Sdk.win-x64\8.0.11\tools\emscripten\tools\acorn-optimizer.js" C:\Users\CCNETS~1\AppData\Local\Temp\emscripten_temp_3svfb4qm\dotnet.native.js JSDCE minifyWhitespace --exportES6 -o C:\Users\CCNETS~1\AppData\Local\Temp\emscripten_temp_3svfb4qm\dotnet.native.jso1.js
```

В частности, осуществляется минификация JavaScript-кода из состава **JS Interop**.

```output
  Stripping symbols from dotnet.native.wasm
```

Причина, по которой используется JavaScript следующая (ChatGPT): tooling для трансляции IL в wasm разработан на TypeScript. TypeScript, как и C# - инструменты разработанные в Microsoft. В эко-системе TypeScript содержится огромная коллекция различных библиотек и инструментов, с помощью которых написать инструмент трансляции было проще всего. Т.е. более правильно говорить не о JavaScipt/Node.js, а о TypeScript и console-based Runtime (одним из вариантов которого является Node.js). Заметим, что мы имеем дело с транспайлером TypeScript -> JavaScript, результат которого осуществляет транспиляцию с IL в wasm.

Ещё одна причина использования Node.js - это развитая кросс-платформенная технология, которая работает на основных операционных системах (Windows/Linux/MacOS) "из коробки".

Важно понимать, что JavaScript - это основной механизм interop для wasm с браузером, т.е. избежать использования JavaScript в любом случае невозможно, а трансляция IL в wasm - лишь добавляет ещё один пункт в примерах совместного использования.

Для того, чтобы предотвратить повторную полную сборку проекта, необходимо использовать ключ `--no-build`:

```shell
dotnet publish --no-build
```

Этот ключ нельзя использовать безусловно, т.е. требуется добавить настройку "Полной пересборки" проекта, как опцию сборки в DevOps Pipeline. Также эта настройка может повлиять и на другие особенности DevOps Pipeline, например, придётся решать проблему с автоматической очисткой папки сборки проекта, а также выбора машины для сборки проекта.

Также возможен вариант, в котором скрипт сборки проекта (.csproj) собирает приложение без Runtime, а для сборки Runtime используется другой проект. Однако, этот вариант относится в Advanced-техникам, он сложнее в реализации и не исключает расхождения в совместимости приложения и Runtime.

## Гипотеза о том, почему так получилось

Следует заметить, что TypeScript был разработан в Microsoft, как внутренний инструмент для переноса приложений Office в web. Задача, которую выполняет транспайлер TypeScript - компиляция кода из одного языка программирования в другой. Т.е. развивая экосистему TypeScript, Microsoft разработал огромное количество библиотек для портирования одного языка в другой. Решение использовать эти библиотеки для схожей задачи преобразования из IL в wasm - имеет смысл.

Первоначально транспайлер TypeScript, вероятно был разработан на JavaScript, для которого в качестве Runtime использовался Node.js. Использование JavaScript в данном случае кажется разумным - поскольку трансляция кода осуществляется в JavaScript, почему бы не использовать эту же экосистему и для процесса трансляции. Это кажется некоторым вариантом dogfooding-а ты пользуешься тем же языком, для которого генерируешь исходный код. Использование Node.js в качестве Runtime тоже кажется разумным по следующим причинам:

- кросс-платформенность. Node.js прекрасно работает под Linux, Windows и MacOS. Его легко портировать и на другие операционные системы
- по состоянию на начало разработки TypeScript, других полноценных альтернатив не было. Deno появился существенно позже, а Bun приблизился к зрелости только в 2024 году

Важно понимать, что у Microsoft не очень хорошо получается с кросс-платформенностью. У них крайне сложно получалось создавать среды исполнения приложений для платформ отличных от Windows:

- WPF - только Windows
- .NET Framework - только Windows. .NET Core - вырос из разработки сторонней компании и изначально назывался Mono
- Avalonia - развитие идей WPF для Linux/MacOS/Windows - сторонний open-source продукт
- Компиляторы MSVC (C/C++) - только Windows

Выбор стороннего инструмента для разработки кросс-платформенного компилятора TypeScript - сейчас это кажется просто безальтернативным решением. И в 2025 году мало, что поменялось - Microsoft переписывает транспайлер TypeScript на Go. Для справки - разработчиком golang является Google.

>Go - это аллюзия на Google? Взяли первые две буквы названия компании для названия языка программирования?

Эта гипотеза поднимает серьёзные вопросы к технологичности Blazor, т.к. "под капотом" находится целая куча разных языковых стеков.

## Дальнейшие исследования

Дальнейшие исследования проводились [здесь](./blazor_build.md).

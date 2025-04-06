# Публикация приложения Blazor WebAssembly

Публикация проекта Blazor WebAssembly многогранный процесс, который может драмматрически изменяться в зависимости от режима сборки.

В наиболее простом случае, компилятор публикует IL-сборки, интерпретатор IL-кода (работающий поверх Runtime-а WebAssembly), а также JavaScript Bridge. Результат публикации - статические файлы, которые загружаются в браузер и исполняются в нём. Это довольно медленный режим работы, поскольку IL-сборки интерпретируются. При этом работа с Document Object Model (DOM) осуществляется через JavaScript Bridge.

Сборка проекта может быть оптимизирована в случае использования дополнительных, платформо-зависимых библиотек (SDK), которые устанавливаются с помощью **wasm-tools** (wasm-tools-net8).

Наиболее сложный вариант сборки - Ahead-of-Time Compilation (AoT), который осуществляет трансляцию IL-сборок в wasm-пакеты, учитывая целевую архитектуру: Portable, или конкретную аппаратную платформу + операционная система. Оптимизация единиц сборки в режиме AoT осуществляется с использованием wasm-tools. При этом осуществляется не только сборка проекта, но и необходимой части .NET Runtime. Время сборки и количество ресурсов, которые при этом используются - кратно, или даже на порядок больше, чем в простом варианте сборки.

Пример логов простой сборки проекта:

```shell
Build started at 18:39...
1>------ Build started: Project: BlazorAppBuild, Configuration: Release Any CPU ------
1>BlazorAppBuild -> D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\bin\Release\net8.0\BlazorAppBuild.dll
1>BlazorAppBuild (Blazor output) -> D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\bin\Release\net8.0\wwwroot
2>------ Publish started: Project: BlazorAppBuild, Configuration: Release Any CPU ------
Connecting to D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\bin\Release\net8.0\browser-wasm\publish\...
BlazorAppBuild -> D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\bin\Release\net8.0\BlazorAppBuild.dll
BlazorAppBuild (Blazor output) -> D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\bin\Release\net8.0\wwwroot
Optimizing assemblies for size may change the behavior of the app. Be sure to test after publishing. See: https://aka.ms/dotnet-illink
Optimizing assemblies for size. This process might take a while.
C:\Program Files\dotnet\dotnet.exe "C:\Users\kermi\.nuget\packages\microsoft.net.illink.tasks\8.0.14\tools\net8.0\illink.dll" -a "obj\Release\net8.0\BlazorAppBuild.dll" EntryPoint
--singlewarn
--trim-mode link
--action copy
-reference "C:\Users\kermi\.nuget\packages\microsoft.aspnetcore.authorization\8.0.14\lib\net8.0\Microsoft.AspNetCore.Authorization.dll"
-reference "C:\Users\kermi\.nuget\packages\microsoft.aspnetcore.components\8.0.14\lib\net8.0\Microsoft.AspNetCore.Components.dll"
-reference "C:\Users\kermi\.nuget\packages\microsoft.aspnetcore.components.forms\8.0.14\lib\net8.0\Microsoft.AspNetCore.Components.Forms.dll"
...
-reference "C:\Users\kermi\.nuget\packages\microsoft.netcore.app.runtime.mono.browser-wasm\8.0.14\runtimes\browser-wasm\lib\net8.0\Microsoft.Win32.Registry.dll"
-reference "C:\Users\kermi\.nuget\packages\microsoft.netcore.app.runtime.mono.browser-wasm\8.0.14\runtimes\browser-wasm\lib\net8.0\System.AppContext.dll"
...
-reference "C:\Users\kermi\.nuget\packages\microsoft.netcore.app.runtime.mono.browser-wasm\8.0.14\runtimes\browser-wasm\native\System.Private.CoreLib.dll"
-reference "obj\Release\net8.0\BlazorAppBuild.dll"
--singlewarn- "BlazorAppBuild"
-out "obj\Release\net8.0\linked"
--nowarn "1701;1702;IL2121;1701;1702;2008"
--warn "5"
--warnaserror- --warnaserror ";NU1605;SYSLIB0011"
--feature Microsoft.Extensions.DependencyInjection.VerifyOpenGenericServiceTrimmability true
--feature System.ComponentModel.TypeConverter.EnableUnsafeBinaryFormatterInDesigntimeLicenseContextSerialization false
--feature System.Diagnostics.Debugger.IsSupported false
--feature System.Diagnostics.Tracing.EventSource.IsSupported false
--feature System.Globalization.Invariant false
--feature System.Globalization.Hybrid false
--feature System.Net.Http.EnableActivityPropagation false
--feature System.Reflection.Metadata.MetadataUpdater.IsSupported false
--feature System.Resources.ResourceManager.AllowCustomResourceTypes false
--feature System.Resources.UseSystemResourceKeys true
--feature System.Runtime.InteropServices.BuiltInComInterop.IsSupported false
--feature System.Runtime.InteropServices.EnableConsumingManagedCodeFromNativeHosting false
--feature System.Runtime.InteropServices.EnableCppCLIHostActivation false
--feature System.Runtime.InteropServices.Marshalling.EnableGeneratedComInterfaceComImportInterop false
--feature System.Runtime.Serialization.EnableUnsafeBinaryFormatterSerialization false
--feature System.StartupHookProvider.IsSupported false
--feature System.Text.Encoding.EnableUnsafeUTF7Encoding false
--feature System.Text.Json.JsonSerializer.IsReflectionEnabledByDefault true
--feature System.Threading.Thread.EnableAutoreleasePool false
-b
--skip-unresolved true  --notrimwarn

C:\Program Files\dotnet\dotnet.exe "C:\Program Files\dotnet\sdk\9.0.201\Sdks\Microsoft.NET.Sdk.StaticWebAssets\targets\..\tools\net9.0\Microsoft.NET.Sdk.StaticWebAssets.Tool.dll" brotli
-s
"C:\Users\kermi\.nuget\packages\microsoft.aspnetcore.components.webassembly\8.0.14\build\net8.0\blazor.webassembly.js"
-o
"D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\compressed\publish\hck129xfjg-mv535bwyet.br"
-s
"D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\webcil\publish\BlazorAppBuild.wasm"
-o
"D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\compressed\publish\or1x09t4c6-0f2lpmxi98.br"
...
-s
"C:\Users\kermi\.nuget\packages\microsoft.netcore.app.runtime.mono.browser-wasm\8.0.14\runtimes\browser-wasm\native\icudt_no_CJK.dat"
-o
"D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\compressed\publish\13rqhotoo8-lfu7j35m59.br"
-s
"obj\Release\net8.0\blazor.publish.boot.json"
-o
"D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\compressed\publish\vmn1tn7tio-ozukmepk7m.br"

Publishing without optimizations. Although it's optional for Blazor, we strongly recommend using `wasm-tools` workload! You can install it by running `dotnet workload install wasm-tools` from the command line.
BlazorAppBuild -> D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\browser-wasm\PubTmp\Out\
Web App was published successfully file:///D:/Sources/Playground/BlazorAppBuild/BlazorAppBuild/bin/Release/net8.0/browser-wasm/publish/

========== Build: 1 succeeded, 0 failed, 0 up-to-date, 0 skipped ==========
========== Build completed at 18:40 and took 17,452 seconds ==========
========== Publish: 1 succeeded, 0 failed, 0 skipped ==========
========== Publish completed at 18:40 and took 17,452 seconds ==========
```

При сборке используется очень много ссылок на .NET-компоненты, также используется инструмент для сжатии статических файлов архиватором, с использованием высокоэффективного алгоритма **brotli**.

Сборка заняла 17,5 секунд и Node.js нигде не использовался.

Компилятор указывает на то, что прорект собирался без оптимизации кода и рекомендует установить wasm-tools:

```shell
dotnet workload install wasm-tools
```

Инсталляция осуществляется около часа и устанавливает огромное количество разных Runtime и AOT-ов для Android, iOS, Aspire и MacCataliyst под разные аппаратные платформы.

После завершения установки ничего особенно не изменилось, но при попытке публикации приложения в режиме AOT, Visual Studio 2022 потребовал доустановить wasm-tools-net8. Была дополнительно выполнена команда:

```shell
dotnet workload install wasm-tools-net8
```

Затем компилятор потребовал выполнить команду:

```shell
dotnet workload restore
```

После перезапуска Visual Studio, сборка проекта в режиме AoT началась:

```shell
Build started at 19:35...
1>------ Build started: Project: BlazorAppBuild, Configuration: Release Any CPU ------
2>------ Publish started: Project: BlazorAppBuild, Configuration: Release Any CPU ------
Connecting to D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\bin\Release\net8.0\browser-wasm\publish\...
Determining projects to restore...
Restored D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\BlazorAppBuild.csproj (in 635 ms).
C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\Roslyn\csc.exe /noconfig /unsafe- /checked- /nowarn:1701,1702,IL2121,1701,1702,2008 /fullpaths /nostdlib+ /platform:AnyCPU /errorreport:prompt /warn:8 /define:TRACE;RELEASE;NET;NET8_0;NETCOREAPP;NET5_0_OR_GREATER;NET6_0_OR_GREATER;NET7_0_OR_GREATER;NET8_0_OR_GREATER;NETCOREAPP1_0_OR_GREATER;NETCOREAPP1_1_OR_GREATER;NETCOREAPP2_0_OR_GREATER;NETCOREAPP2_1_OR_GREATER;NETCOREAPP2_2_OR_GREATER;NETCOREAPP3_0_OR_GREATER;NETCOREAPP3_1_OR_GREATER /errorendlocation /preferreduilang:en-US /highentropyva+ /nullable:enable /reference:C:\Users\kermi\.nuget\packages\microsoft.aspnetcore.authorization\8.0.14\lib\net8.0\Microsoft.AspNetCore.Authorization.dll /reference:C:\Users\kermi\.nuget\packages\microsoft.aspnetcore.components\8.0.14\lib\net8.0\Microsoft.AspNetCore.Components.dll /reference:C:\Users\kermi\.nuget\packages\microsoft.aspnetcore.components.forms\8.0.14\lib\net8.0\Microsoft.AspNetCore.Components.Forms.dll /reference:C:\Users\kermi\.nuget\packages\microsoft.aspnetcore.components.web\8.0.14\lib\net8.0\Microsoft.AspNetCore.Components.Web.dll /reference:C:\Users\kermi\.nuget\packages\microsoft.aspnetcore.components.webassembly\8.0.14\lib\net8.0\Microsoft.AspNetCore.Components.WebAssembly.
...
analyzer:"C:\Program Files\dotnet\sdk\9.0.201\Sdks\Microsoft.NET.Sdk.Razor\targets\..\source-generators\Microsoft.CodeAnalysis.Razor.Compiler.dll" /analyzer:"C:\Program Files\dotnet\sdk\9.0.201\Sdks\Microsoft.NET.Sdk.Razor\targets\..\source-generators\Microsoft.Extensions.ObjectPool.dll" /analyzer:"C:\Program Files\dotnet\sdk\9.0.201\Sdks\Microsoft.NET.Sdk.Razor\targets\..\source-generators\System.Collections.Immutable.dll" /additionalfile:App.razor /additionalfile:Pages\Counter.razor /additionalfile:Pages\Home.razor /additionalfile:Pages\Weather.razor /additionalfile:_Imports.razor /additionalfile:Layout\MainLayout.razor /additionalfile:Layout\NavMenu.razor Program.cs obj\Release\net8.0\BlazorAppBuild.GlobalUsings.g.cs "obj\Release\net8.0\.NETCoreApp,Version=v8.0.AssemblyAttributes.cs" obj\Release\net8.0\BlazorAppBuild.AssemblyInfo.cs /warnaserror+:NU1605,SYSLIB0011
BlazorAppBuild -> D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\bin\Release\net8.0\BlazorAppBuild.dll
BlazorAppBuild (Blazor output) -> D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\bin\Release\net8.0\wwwroot
Optimizing assemblies for size may change the behavior of the app. Be sure to test after publishing. See: https://aka.ms/dotnet-illink
Optimizing assemblies for size. This process might take a while.
C:\Program Files\dotnet\dotnet.exe "C:\Users\kermi\.nuget\packages\microsoft.net.illink.tasks\8.0.14\tools\net8.0\illink.dll" -a "obj\Release\net8.0\BlazorAppBuild.dll" EntryPoint
--singlewarn
--trim-mode link
--action copy
-reference "C:\Users\kermi\.nuget\packages\microsoft.aspnetcore.authorization\8.0.14\lib\net8.0\Microsoft.AspNetCore.Authorization.dll"
-reference "C:\Users\kermi\.nuget\packages\microsoft.aspnetcore.components\8.0.14\lib\net8.0\Microsoft.AspNetCore.Components.dll"
-reference "C:\Users\kermi\.nuget\packages\microsoft.aspnetcore.components.forms\8.0.14\lib\net8.0\Microsoft.AspNetCore.Components.Forms.dll"
...
-reference "C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Runtime.Mono.browser-wasm\8.0.14\runtimes\browser-wasm\lib\net8.0\mscorlib.dll"
-reference "C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Runtime.Mono.browser-wasm\8.0.14\runtimes\browser-wasm\lib\net8.0\netstandard.dll"
-reference "C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Runtime.Mono.browser-wasm\8.0.14\runtimes\browser-wasm\native\System.Private.CoreLib.dll"
-reference "obj\Release\net8.0\BlazorAppBuild.dll"
--singlewarn- "BlazorAppBuild"
-out "obj\Release\net8.0\linked"
--nowarn "1701;1702;IL2121;1701;1702;2008"
--warn "5"
--warnaserror- --warnaserror ";NU1605;SYSLIB0011"
--feature Microsoft.Extensions.DependencyInjection.VerifyOpenGenericServiceTrimmability true
--feature System.ComponentModel.TypeConverter.EnableUnsafeBinaryFormatterInDesigntimeLicenseContextSerialization false
--feature System.Diagnostics.Debugger.IsSupported false
--feature System.Diagnostics.Tracing.EventSource.IsSupported false
--feature System.Globalization.Invariant false
--feature System.Globalization.Hybrid false
--feature System.Net.Http.EnableActivityPropagation false
--feature System.Reflection.Metadata.MetadataUpdater.IsSupported false
--feature System.Resources.ResourceManager.AllowCustomResourceTypes false
--feature System.Resources.UseSystemResourceKeys true
--feature System.Runtime.InteropServices.BuiltInComInterop.IsSupported false
--feature System.Runtime.InteropServices.EnableConsumingManagedCodeFromNativeHosting false
--feature System.Runtime.InteropServices.EnableCppCLIHostActivation false
--feature System.Runtime.InteropServices.Marshalling.EnableGeneratedComInterfaceComImportInterop false
--feature System.Runtime.Serialization.EnableUnsafeBinaryFormatterSerialization false
--feature System.StartupHookProvider.IsSupported false
--feature System.Text.Encoding.EnableUnsafeUTF7Encoding false
--feature System.Text.Json.JsonSerializer.IsReflectionEnabledByDefault true
--feature System.Threading.Thread.EnableAutoreleasePool false
-b
--skip-unresolved true  --substitutions "C:\Program Files\dotnet\packs\Microsoft.NET.Runtime.WebAssembly.Sdk\8.0.14\Sdk\ILLink.Substitutions.WasmIntrinsics.xml" --notrimwarn

Optimizing assemblies for size may change the behavior of the app. Be sure to test after publishing. See: https://aka.ms/dotnet-illink
C:\Program Files\dotnet\dotnet.exe "C:\Program Files\dotnet\sdk\9.0.201\Sdks\Microsoft.NET.Sdk.StaticWebAssets\targets\..\tools\net9.0\Microsoft.NET.Sdk.StaticWebAssets.Tool.dll" brotli

AOT'ing 32 assemblies
C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\Roslyn\csc.exe /reference:C:\Users\kermi\.nuget\packages\microsoft.aspnetcore.authorization\8.0.14\lib\net8.0\Microsoft.AspNetCore.Authorization.dll /reference:C:\Users\kermi\.nuget\packages\microsoft.aspnetcore.components\8.0.14\lib\net8.0\Microsoft.AspNetCore.Components.dll /reference:C:\Users\kermi\.nuget\packages\microsoft.aspnetcore.components.forms\8.0.14\lib\net8.0\Microsoft.AspNetCore.Components.Forms.dll /reference:C:\Users\kermi\.nuget\packages\microsoft.aspnetcore.components.web\8.0.14\lib\net8.0\Microsoft.AspNetCore.Components.Web.dll /reference:C:\Users\kermi\.nuget\packages\microsoft.aspnetcore.components.webassembly\8.0.14\lib\net8.0\Microsoft.AspNetCore.Components.WebAssembly.dll /reference:C:\Users\kermi\.nuget\packages\microsoft.aspnetcore.metadata\8.0.14\lib\net8.0\Microsoft.AspNetCore.Metadata.dll /reference:"C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\8.0.14\ref\net8.0\Microsoft.CSharp.dll" /reference:C:\Users\kermi\.nuget\packages\microsoft.extensions.configuration.abstractions\8.0.0\lib\net8.0\Microsoft.Extensions.Configuration.Abstractions.dll /reference:C:\Users\kermi\.nuget\packages\microsoft.extensions.configuration.binder\8.0.2\lib\net8.0\Microsoft.Extensions.
...
 /reference:"C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\8.0.14\ref\net8.0\System.Xml.XPath.dll" /reference:"C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\8.0.14\ref\net8.0\System.Xml.XPath.XDocument.dll" /reference:"C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\8.0.14\ref\net8.0\WindowsBase.dll" /out:D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\\aot-instances.dll /target:library /deterministic+ D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\\aot-instances.cs
[1/32] Microsoft.Extensions.Configuration.Json.dll -> Microsoft.Extensions.Configuration.Json.dll.bc
[2/32] Microsoft.Extensions.Configuration.dll -> Microsoft.Extensions.Configuration.dll.bc
[3/32] Microsoft.Extensions.Configuration.Abstractions.dll -> Microsoft.Extensions.Configuration.Abstractions.dll.bc
[4/32] Microsoft.Extensions.DependencyInjection.Abstractions.dll -> Microsoft.Extensions.DependencyInjection.Abstractions.dll.bc
[5/32] Microsoft.AspNetCore.Components.Web.dll -> Microsoft.AspNetCore.Components.Web.dll.bc
[6/32] Microsoft.AspNetCore.Components.WebAssembly.dll -> Microsoft.AspNetCore.Components.WebAssembly.dll.bc
[7/32] Microsoft.Extensions.DependencyInjection.dll -> Microsoft.Extensions.DependencyInjection.dll.bc
[8/32] Microsoft.AspNetCore.Components.dll -> Microsoft.AspNetCore.Components.dll.bc
[9/32] Microsoft.Extensions.Primitives.dll -> Microsoft.Extensions.Primitives.dll.bc
[10/32] System.Collections.dll -> System.Collections.dll.bc
[11/32] Microsoft.Extensions.Logging.dll -> Microsoft.Extensions.Logging.dll.bc
[12/32] Microsoft.Extensions.Options.dll -> Microsoft.Extensions.Options.dll.bc
[13/32] System.Collections.Concurrent.dll -> System.Collections.Concurrent.dll.bc
[14/32] BlazorAppBuild.dll -> BlazorAppBuild.dll.bc
[15/32] System.ComponentModel.dll -> System.ComponentModel.dll.bc
[16/32] System.Console.dll -> System.Console.dll.bc
[17/32] Microsoft.Extensions.Logging.Abstractions.dll -> Microsoft.Extensions.Logging.Abstractions.dll.bc
[18/32] System.Diagnostics.DiagnosticSource.dll -> System.Diagnostics.DiagnosticSource.dll.bc
[19/32] System.Memory.dll -> System.Memory.dll.bc
[20/32] System.Net.Primitives.dll -> System.Net.Primitives.dll.bc
[21/32] System.Net.Http.Json.dll -> System.Net.Http.Json.dll.bc
[22/32] Microsoft.JSInterop.dll -> Microsoft.JSInterop.dll.bc
[23/32] System.Linq.dll -> System.Linq.dll.bc
[24/32] System.Runtime.dll -> System.Runtime.dll.bc
[25/32] System.Text.RegularExpressions.dll -> System.Text.RegularExpressions.dll.bc
[26/32] System.Text.Encodings.Web.dll -> System.Text.Encodings.Web.dll.bc
[27/32] System.Runtime.InteropServices.JavaScript.dll -> System.Runtime.InteropServices.JavaScript.dll.bc
[28/32] System.Private.Uri.dll -> System.Private.Uri.dll.bc
[29/32] System.Net.Http.dll -> System.Net.Http.dll.bc
[30/32] System.Text.Json.dll -> System.Text.Json.dll.bc
[31/32] System.Private.CoreLib.dll -> System.Private.CoreLib.dll.bc
[32/32] aot-instances.dll -> aot-instances.dll.bc
"C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Runtime.AOT.win-x64.Cross.browser-wasm\8.0.14\Sdk\..\tools\mono-aot-cross.exe" --print-icall-table > "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\runtime-icall-table.h"
Compiling native assets with emcc with -Oz. This may take a while ...
[1/3] pinvoke.c -> pinvoke.o [took 0,66s]
[2/3] corebindings.c -> corebindings.o [took 0,68s]
[3/3] driver.c -> driver.o [took 0,76s]
Compiling assembly bitcode files with -O2 ...
[1/32] Microsoft.Extensions.DependencyInjection.dll.bc -> Microsoft.Extensions.DependencyInjection.dll.o [took 3,36s]
[2/32] Microsoft.Extensions.Configuration.dll.bc -> Microsoft.Extensions.Configuration.dll.o [took 3,36s]
[3/32] Microsoft.Extensions.Configuration.Abstractions.dll.bc -> Microsoft.Extensions.Configuration.Abstractions.dll.o [took 3,36s]
[4/32] Microsoft.Extensions.Configuration.Json.dll.bc -> Microsoft.Extensions.Configuration.Json.dll.o [took 3,36s]
[5/32] Microsoft.AspNetCore.Components.Web.dll.bc -> Microsoft.AspNetCore.Components.Web.dll.o [took 3,36s]
[6/32] Microsoft.AspNetCore.Components.WebAssembly.dll.bc -> Microsoft.AspNetCore.Components.WebAssembly.dll.o [took 3,36s]
[7/32] Microsoft.Extensions.DependencyInjection.Abstractions.dll.bc -> Microsoft.Extensions.DependencyInjection.Abstractions.dll.o [took 3,36s]
[8/32] Microsoft.Extensions.Logging.dll.bc -> Microsoft.Extensions.Logging.dll.o [took 1,27s]
[9/32] Microsoft.Extensions.Options.dll.bc -> Microsoft.Extensions.Options.dll.o [took 2,00s]
[10/32] System.Collections.dll.bc -> System.Collections.dll.o [took 0,84s]
[11/32] Microsoft.Extensions.Logging.Abstractions.dll.bc -> Microsoft.Extensions.Logging.Abstractions.dll.o [took 2,11s]
[12/32] Microsoft.JSInterop.dll.bc -> Microsoft.JSInterop.dll.o [took 2,11s]
[13/32] BlazorAppBuild.dll.bc -> BlazorAppBuild.dll.o [took 2,65s]
[14/32] Microsoft.Extensions.Primitives.dll.bc -> Microsoft.Extensions.Primitives.dll.o [took 2,65s]
[15/32] System.Collections.Concurrent.dll.bc -> System.Collections.Concurrent.dll.o [took 2,65s]
[16/32] System.ComponentModel.dll.bc -> System.ComponentModel.dll.o [took 0,68s]
[17/32] Microsoft.AspNetCore.Components.dll.bc -> Microsoft.AspNetCore.Components.dll.o [took 6,06s]
[18/32] System.Console.dll.bc -> System.Console.dll.o [took 0,96s]
[19/32] System.Diagnostics.DiagnosticSource.dll.bc -> System.Diagnostics.DiagnosticSource.dll.o [took 1,32s]
[21/32] System.Net.Primitives.dll.bc -> System.Net.Primitives.dll.o [took 1,53s]
[20/32] System.Memory.dll.bc -> System.Memory.dll.o [took 1,55s]
[22/32] System.Runtime.dll.bc -> System.Runtime.dll.o [took 1,67s]
[24/32] System.Linq.dll.bc -> System.Linq.dll.o [took 2,99s]
[23/32] System.Net.Http.Json.dll.bc -> System.Net.Http.Json.dll.o [took 2,45s]
[25/32] System.Runtime.InteropServices.JavaScript.dll.bc -> System.Runtime.InteropServices.JavaScript.dll.o [took 2,04s]
[26/32] System.Private.Uri.dll.bc -> System.Private.Uri.dll.o [took 2,41s]
[27/32] System.Text.Encodings.Web.dll.bc -> System.Text.Encodings.Web.dll.o [took 1,11s]
[28/32] System.Text.RegularExpressions.dll.bc -> System.Text.RegularExpressions.dll.o [took 0,86s]
[29/32] System.Net.Http.dll.bc -> System.Net.Http.dll.o [took 4,33s]
[30/32] System.Text.Json.dll.bc -> System.Text.Json.dll.o [took 9,08s]
[31/32] System.Private.CoreLib.dll.bc -> System.Private.CoreLib.dll.o [took 24,74s]
[32/32] aot-instances.dll.bc -> aot-instances.dll.o [took 33,15s]
llvm-size.exe -d --format=sysv "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\Microsoft.AspNetCore.Components.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\Microsoft.AspNetCore.Components.Web.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\Microsoft.AspNetCore.Components.WebAssembly.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\Microsoft.Extensions.Configuration.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\Microsoft.Extensions.Configuration.Abstractions.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\Microsoft.Extensions.Configuration.Json.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\Microsoft.Extensions.DependencyInjection.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\Microsoft.Extensions.DependencyInjection.Abstractions.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\Microsoft.Extensions.Logging.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\Microsoft.Extensions.Logging.Abstractions.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\Microsoft.Extensions.Options.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\Microsoft.Extensions.Primitives.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\Microsoft.JSInterop.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\BlazorAppBuild.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\System.Collections.Concurrent.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\System.Collections.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\System.ComponentModel.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\System.Console.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\System.Diagnostics.DiagnosticSource.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\System.Linq.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\System.Memory.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\System.Net.Http.Json.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\System.Net.Http.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\System.Net.Primitives.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\System.Private.Uri.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\System.Runtime.InteropServices.JavaScript.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\System.Runtime.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\System.Text.Encodings.Web.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\System.Text.Json.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\System.Text.RegularExpressions.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\System.Private.CoreLib.dll.o" "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\aot-instances.dll.o"
Linking for initial memory $(EmccInitialHeapSize)=16777216 bytes. Set this msbuild property to change the value.
Linking with emcc with -O2. This may take a while ...
emcc "@C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Runtime.Mono.browser-wasm\8.0.14\runtimes\browser-wasm\native\src\emcc-default.rsp" -msimd128 "@C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Runtime.Mono.browser-wasm\8.0.14\runtimes\browser-wasm\native\src\emcc-link.rsp" "@D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\emcc-link.rsp"
 "C:\Program Files\dotnet\packs\Microsoft.NET.Runtime.Emscripten.3.1.34.Node.win-x64\8.0.14\tools\bin\node.exe" "C:\Program Files\dotnet\packs\Microsoft.NET.Runtime.Emscripten.3.1.34.Sdk.win-x64\8.0.14\tools\emscripten\src\compiler.js" C:\Users\kermi\AppData\Local\Temp\tmpconlbthe.json --symbols-only
 "C:\Program Files\dotnet\packs\Microsoft.NET.Runtime.Emscripten.3.1.34.Sdk.win-x64\8.0.14\tools\bin\wasm-ld.exe" @C:\Users\kermi\AppData\Local\Temp\emscripten_lf7fl95b.rsp.utf-8
 "C:\Program Files\dotnet\packs\Microsoft.NET.Runtime.Emscripten.3.1.34.Node.win-x64\8.0.14\tools\bin\node.exe" "C:\Program Files\dotnet\packs\Microsoft.NET.Runtime.Emscripten.3.1.34.Sdk.win-x64\8.0.14\tools\emscripten\src\compiler.js" C:\Users\kermi\AppData\Local\Temp\tmpho_wioqw.json
 "C:\Program Files\dotnet\packs\Microsoft.NET.Runtime.Emscripten.3.1.34.Sdk.win-x64\8.0.14\tools\bin\wasm-opt" --strip-dwarf --post-emscripten -O2 --low-memory-unused --zero-filled-memory --pass-arg=directize-initial-contents-immutable --strip-debug --strip-producers D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\dotnet.native.wasm -o D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\dotnet.native.wasm -g --mvp-features --enable-exception-handling --enable-mutable-globals --enable-sign-ext --enable-simd
 "C:\Program Files\dotnet\packs\Microsoft.NET.Runtime.Emscripten.3.1.34.Node.win-x64\8.0.14\tools\bin\node.exe" "C:\Program Files\dotnet\packs\Microsoft.NET.Runtime.Emscripten.3.1.34.Sdk.win-x64\8.0.14\tools\emscripten\tools\acorn-optimizer.js" C:\Users\kermi\AppData\Local\Temp\emscripten_temp_7s_e4rol\dotnet.native.js JSDCE minifyWhitespace --exportES6 -o C:\Users\kermi\AppData\Local\Temp\emscripten_temp_7s_e4rol\dotnet.native.jso1.js
Stripping symbols from dotnet.native.wasm ...
wasm-opt.exe --enable-simd --enable-exception-handling  --strip-dwarf "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\dotnet.native.wasm" -o "D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\wasm\for-publish\dotnet.native.wasm"
C:\Program Files\dotnet\dotnet.exe "C:\Program Files\dotnet\sdk\9.0.201\Sdks\Microsoft.NET.Sdk.StaticWebAssets\targets\..\tools\net9.0\Microsoft.NET.Sdk.StaticWebAssets.Tool.dll" brotli
-s
"D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\webcil\publish\System.Private.CoreLib.wasm"
-o
"D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\compressed\publish\4ha6zyzcjk-71x7e0thjr.br"
...
-s
"obj\Release\net8.0\blazor.publish.boot.json"
-o
"D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\compressed\publish\vmn1tn7tio-k0sbm9g4bd.br"

BlazorAppBuild -> D:\Sources\Playground\BlazorAppBuild\BlazorAppBuild\obj\Release\net8.0\browser-wasm\PubTmp\Out\
Web App was published successfully file:///D:/Sources/Playground/BlazorAppBuild/BlazorAppBuild/bin/Release/net8.0/browser-wasm/publish/

========== Build: 1 succeeded, 0 failed, 0 up-to-date, 0 skipped ==========
========== Build completed at 19:37 and took 01:51,505 minutes ==========
========== Publish: 1 succeeded, 0 failed, 0 skipped ==========
========== Publish completed at 19:37 and took 01:51,505 minutes ==========
```

Вариант AoT значительно более тяжёлый, чем обычный и выполняет следующие дополнительные задачи:

- компилирует Си-код, вероятно, связанный с wasm в объектные модули wasm
- компилирует библиотеки .NET в объектные модули wasm (.dll -> .bc -> .o). Компиляция осуществляется с оптимизацией. Вероятно: bc = byte code, а 0 = object code
- использует Node.js для оптимизации JS Interop - моста между .NET/wasm и "песочницей" DOM

Компиляция занимает почти 2 минуты, вместо 17.5 секунд.

```output
c:\Jenkins_Work\workspace\build_SPCD\ServicePartners.Client\ServicePartners.Client.csproj : warning NU1900: Error occurred while getting package vulnerability data: Unable to load the service index for source https://api.nuget.org/v3/index.json.
  Optimizing assemblies for size may change the behavior of the app. Be sure to test after publishing. See: https://aka.ms/dotnet-illink
  Compiling native assets with emcc with -Oz. This may take a while ...
  [1/3] pinvoke.c -> pinvoke.o [took 1,35s]
  [2/3] corebindings.c -> corebindings.o [took 1,35s]
  [3/3] driver.c -> driver.o [took 1,39s]
```

В процесс сборки используется **emcc**. Emcc – это компилятор Emscripten, который компилирует код на C++ в WebAssebly. И он действительно компилирует несколько низкоуровневых файлов (см. выше).

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

Основная причина использования Node.js - развитые средства оптимизация JavaScript-кода, который используется, как минимум, в Blazor Bridge.

## Оптимизация DevOps операций

Для того, чтобы предотвратить повторную полную сборку проекта, необходимо использовать ключ `--no-build`:

```shell
dotnet publish --no-build
```

Этот ключ нельзя использовать безусловно, т.е. требуется добавить настройку "Полной пересборки" проекта, как опцию сборки в DevOps Pipeline. Также эта настройка может повлиять и на другие особенности DevOps Pipeline, например, придётся решать проблему с автоматической очисткой папки сборки проекта, а также выбора машины для сборки проекта.

Также возможен вариант, в котором скрипт сборки проекта (.csproj) собирает приложение без Runtime, а для сборки Runtime используется другой проект. Однако, этот вариант относится в Advanced-техникам, он сложнее в реализации и не исключает расхождения в совместимости приложения и Runtime.

Следует заметить, что оптимизация сборки может повлиять на стабильной работы приложения и даже привести к некорректной работе приложения.

## В чем принципиальное различие обычной сборки и AoT

Общий размер с проекта без глубокой оптимизации (\browser-wasm\publish): 15 МБ.

Тот же проект с оптимизацией, включающей компиляции всех используемых библиотек в wasm - 29 МБ.

Т.е. с точки зрения объёма файлов публикации и времени компиляции, режим AoT в разы хуже, чем простой вариант сборки.

Важно заметить, что поскольку загружаемые статические данные кэшируются браузером, время загрузки приложения будет большим только при первом запуске.

Производительность wasm-кода должна быть также кратно выше. Можно говорить о том, что производительность скомпилированного wasm-кода близка к нативному коду процессора, который является целевой платформой.

При этом использование моста blazor.js нивелирует разницу в производительности. Однако существует два класса задач, в который выигрыш при использовании wasm-кода значительный:

- ресурсоёмкие алгоритмы, такие как научные вычисления и криптография
- сложный рендеринг контента сайта

К сожалению, на данный момент у меня нет цифр, которые можно было бы использовать для сравнения производительности кода в режимах IL-интерпретации и выполнения wasm-кода.

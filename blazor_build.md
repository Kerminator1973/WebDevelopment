# Публикация приложения Blazor WebAssembly

При публикации приложения осуществляется не только сборка самого приложения, но так же и сборка Runtime. Для сборки Runtime существует только один вариант - "browser-wasm".

Пример сборки проекта:

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

При сборке используется очень много ссылок на .NET-компоненты, также используется инструмент для сжатии статических файлов архиватором, с использование высокоэффективного brotli-алгоритма.

Сборка заняла 17,5 секунд и Node.js нигде не использовался.

Компилятор указывает на то, что прорект собирался без оптимизации кода и рекомендует установить wasm-tools:

```shell
dotnet workload install wasm-tools
```

Установка осуществляется около получаса и устанавливает омноеное коичество разных Runtime, включая Runtime и AOT-ы для Android, iOS, Aspire и MacCataliyst под разные аппаратные платформы.

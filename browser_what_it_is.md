# Что такое браузер

Современный браузер реализуют операционную среду, которая содержит:

- компонент рендеринга, отвечающий за формирование картинки в окне операционной системы. Google Chrome и Microsoft Edge используют движок [Skia](https://skia.org/), Firefox использует библиотеку Cairo и, частично Skia, Safari применяет Core Graphics framework. Кстати, Skia используется и в библиотеке Avalonia, Android, Flutter, и т.д.
- компонент вычисления свойств объектов на основе каскадных таблиц символов
- слой работы с файловой системой, ориентированный на максимальную степень кэширования данных
- модули взаимодействия с USB-устройствами (WebUSB API и Web Serial API)
- модули для рендеренги 2D и 3D графики: WebGL (базируется на спецификации OpenGL ES 2.0), WebGPU (базируется на спецификациях Vulkan, Metal и Direct3D 12), WebGL 2 (OpenGL ES 3.0), Canvas API (отрисовка 2D графики JavaScript-кодом с использованием WebGL), OffscreenCanvas (отрисовка без подключения к DOM, повышенная производительность)
- WebGPU, позволяющий использовать GPGPU для выполнения задач, требующих высокомощного аппаратного обеспечения
- инструментальные средства для исполнения JavaScript-кода (open-source движок V8), включая JIT-компилятор, отладчик и мощную управляющую консоль. Отдельно - богатый Runtime, реализующий системные библиотеки, используемые в JavaScript-приложениях
- инструментальные средства для исполнения WebAssembly-кода с поддержкой SIMD инструкций
- системы сбора метрик и аналитика работы web-приложения
- встроенная база данных "key/value" (localStorage)
- мощная система логирования. Например, получить доступ к информации о работе подключенных USB-устройств можно используя URL `chrome://device-log/`
- система управления расширениями (добавление встроенных приложений)
- встроенного клиента инфраструктуры управления публичными ключами (PKI)
- реализацию современных криптографических алгоритмов
- шифруемые базы данных для хранения данных пользователей
- реализацию различных сетевых протоколов, включая HTTP/2, HTTP/3, WebSockets
- реализуцию видео-кодеков и/или интеграционных слоёв для аппаратного кодирования/декодирования видео
- подсистему захвата аудио/видео
- систему внешнего управления браузером (webdriver), для разработки систем автоматизированного тестирования
- и [многое другое](https://chromium.googlesource.com/?format=HTML)

Ниже приведён пример скрипта, который позволяет использовать GPGPU для высокопроизводительных вычислений:

```js
async function initWebGPU() {
  if (!navigator.gpu) {
    console.error('WebGPU is not supported in this browser.');
    return;
  }

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();

  // Create a compute pipeline
  const computePipeline = device.createComputePipeline({
    compute: {
      module: device.createShaderModule({
        code: `
          @compute @workgroup_size(1)
          fn main(@builtin(global_invocation_id) id : vec3<u32>) {
            // Simple compute task
            let value = id.x + id.y + id.z;
            // Store the result in a buffer
            // (This is a placeholder; actual buffer handling is more complex)
          }
        `,
      }),
    },
  });

  // Create a command encoder and encode the compute pass
  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(computePipeline);
  passEncoder.dispatchWorkgroups(1); // Dispatch a single workgroup
  passEncoder.end();

  // Submit the command buffer to the GPU
  const commandBuffer = commandEncoder.finish();
  device.queue.submit([commandBuffer]);
}

initWebGPU();
```

# React в 2024 году

Для генерации шаблона приложения рекомендуется использовать [Vite](https://vitejs.dev/guide/) (произносится как /veet/) - генератор и система сборки React-приложения. Основные преимущества использования инструмента:

- сервер разработки предоставляет огромное количество расширений, посредством использования native ES-модулей. Например - экстремально быстрый Hot Module Replacement (HMR)
- в качестве bundler-а используется Rollup, который обладает мощными инструментами оптимизации статических assets

Vite поддерживает генерацию не только React-приложений и содержит множество других шаблонов, включая: Vue, Svelte, Preact, и т.д.

## Scaffolding - создание шаблонного приложения

При использовании npm команда выглядит так:

```shell
npm create vite@latest
```

После ответа на вопросы и переход в папку с созданным приложением следует выполнить команды:

```shell
npm install
npm run dev
```

Следует заметить, что скорость импорта зависимостей (`npm install`) и запуска сервера (`npm run dev`) феноменальные - работает действительно быстро. Шаблонное приложение содержит кнопку с счётчиком нажатий.

## Что подж капотом? Наиболее важные идеи

Не смотря на то, что типовое приложение на React содержит HTML-подобный код, в действительности этот код транслируется в JavaScript, который создаёт дерево компонентов, используемое для rendering-а DOM:

```js
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}
```

Существуют альтернативы JSX (механизм трансляции HTML-подобного кода в JavaScript): [htm](https://github.com/developit/htm), [esx](https://github.com/esxjs/esx).

Синтаксис htm является JSX-подобным в plain JavaScript, что позволяет не использовать транспайлер. Это означает, что можно разрабатывать React/Preact приложения прямо в браузере, а компилировать код с целью оптимизации только для production. Выглядит код, приблизительно так:

```js
render ({ logs = [], ...props }, { show}) {
    return html`
        <div class="logs" ...${props}>
            <button onClick=${() => this.toggle()}v</button>
        </div>
    `;
}
```

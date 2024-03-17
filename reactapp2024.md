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

## Что под капотом? Наиболее важные идеи

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

### Stateful компоненты - основы Lifecycle

Ниже по тексту следуют устаревшие примеры (legacy), которые, тем не менее, важны с точки зрения понимания, как React работает под капотом.

Данными для stateful-компонента, чаще всего, являются properties/props (входные параметры) и state (состояние). [Основное различие](https://legacy.reactjs.org/docs/faq-state.html) между ними состоит в том, что props всего устанавливаются родительскими компонентами, а состояние компонента может быть изменено сам компонентом, в том числе, при обработке callback-вызова, вызываемого дочерним компонентом.

Для изменения внутреннего состояния в компоненте React используется вызов метода базового класса setState(). Пример вызова setState():

```js
incrementCount() {
  this.setState((state) => {
    // Important: read `state` instead of `this.state` when updating.
    return {count: state.count + 1}
  });
}

handleSomething() {
  // Let's say `this.state.count` starts at 0.
  this.incrementCount();
  this.incrementCount();
  this.incrementCount();

  // If you read `this.state.count` now, it would still be 0.
  // But when React re-renders the component, it will be 3.
}
```

В классе react.Component реализованы методы **componentDidMount**() и **componentDidUpdate**(). Первый из них вызывается, когда объект успешно создан и включен в DOM. Второй вызывается каждый раз, когда компонент изменяется, например, когда в компонент передают новые свойства (props). Функция componentDidMount() является идеальным местом для загрузки инициализационных данных с сервера, в начале работы. Функция componentDidUpdate() может принять решение о том, что из-за изменившихся условий (ввели что-то в полях ввода), следует повторить загрузку данных с сервера. Таким образом, и функция componentDidMount(), и функция componentDidUpdate() могут запускать загрузку внешних данных, например, вызывая что-то типа `this.loadData()`.

Важно заметить, что для избежания "лишних" загрузок, componentDidUpdate() может выполнять проверку того, props действительно изменились:

```js
componentDidUpdate( prevProps ) {
  if (this.props.query !== prevProps.query) {
    this.loadData();
  }
}
```

Функция render() вызывается со стороны React каждый раз, когда state, или props изменяется и именно в этом методе осуществляется генерация html. Очень часто, в render() используется условния рендеринга (_conditional rendering_), т.е. принимается во внимание состояние объекта, или его свойства. Например:

```js
render() {
  if (this.state.loading) {
    return 'Loading...';
  }

  return // ... какой-то JSX-код, участвующий в формировании DOM
}
```

### Актуальный синтаксис React - функциональные компоненты

Вот как определяется и изменяется состояние компонента:

```js
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  )
}
```

Функция useState() возвращает переменную-состояние `count`, котору можно использовать в рендеренге, а также функцию setCount(), которая используется для изменения состояния.

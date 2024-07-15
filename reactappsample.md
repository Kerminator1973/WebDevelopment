# Пример создания простейшего приложения на React

Создание React-приложение начинается с установки генератора кода шаблона:

```cmd
npm install -g create-react-app
```

**Update 2024**: create-react-app уже не поддерживается и не развивается. В 2024 году для генерации boilerplate-кода по шаблону приложения используется Vite (команда `npm create vite@latest`).

Далее следует перейти в папку, в которой должна быть создана подпапка с приложением и запустить скрипт создания шаблона приложения:

```cmd
create-react-app [имя приложения]
```

После загрузки зависимостей можно запустить приложение, используя **npm**, или **yarn**. Например: `yarn start`

В качестве альтернативы (и это даже скорее рекомендация), сгенерировать проект используя Vite: `npm start vite@latest`

Сборка приложения для развертывания осуществляется командой: `yarn build`.

В папке «src» находятся шаблонные исходные тексты приложения, из которых ключевым является файл «App.js» - это реализация компонента App, главного компонента приложения.

Мы можем создать несколько новых компонентов и использовать их в этом файле. Допустим у нас есть два компонента, один из которых позволяет ввести имя и фамилию человека, а второй компонент позволяет вывести список людей. Назовём первый файл "Person.js" и разместим его в папке "components":

```javascript
import React, { useState } from 'react';

function AddPersonForm(props) {
    const [person, setPerson] = useState("");

    function handleChange(e) {
        setPerson(e.target.value);
    }

    function handleSubmit(e) {
        props.handleSubmit(person);
        setPerson('');
        e.preventDefault();
    }

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Add new contact"
                onChange={handleChange}
                value={person} />
            <button type="submit">Add</button>
        </form>
    );
}

export default AddPersonForm;
```

Этот компонент создаёт HTML-разметку в которой содержится строка редактирования и кнопка "Submit". При нажатии на кнопку подавляется стандартный обработчик, чтобы не произошло принудительной перезагрузки HTML-документа (см. **e.preventDefault()**).

JavaScript-код начинается с использования Hook-а **useState**(), который создаёт состояние: переменную доступную на чтение (person) и функцию для изменения состояния (setPerson). В HTML-верстке используются атрибут **onChange**, который определяет функцию обработки изменений в строке редактирования. Эта функций (handleChange) сохраняет изменённое состояние используя метод setPerson().

При нажатии на кнопку "Submit", вызывается функция handleSubmit(), которая, в свою очередь, вызовет callback-функцию родительского компонента (используя контейнер props) и передаст через неё информацию о пользовательском вводе.

Заканчивается файл экспортом React-класса, что позволяет использовать его в директивах **import**.

Второй файл назовём "PeopleList.js" и поместим в ту же папку:

```javascript
import React from 'react';

const PeopleList = props => {
    const arr = props.data;
    const listItems = arr.map((val, index) => {
        return (
            <li key={index}>{val}</li>
        )
    });
    return <ul>{listItems}</ul>
}

export default PeopleList;
```

Второй файл реализован как функциональный компонент. Он получает массив данных и формирует из него неосортированный список (ul).

Для синхронизации работы этих двух независимых компонентов создадим третий компонент с именем "ContactManager.js":

```javascript
import React, { useState } from 'react';
import AddPersonForm from '../components/Person';
import PeopleList from '../components/PeopleList';

function ContactManager(props) {
    const [contacts, setContacts] = useState(props.data);

    function addPerson(name) {
        setContacts([...contacts, name]);
    }

    return (
        <div>
            <AddPersonForm handleSubmit={addPerson} />
            <PeopleList data={contacts} />
        </div>
    )
}

export default ContactManager;
```

Теперь добавим синхронизационный компонент в "App.js"

```javascript
import React from 'react';
import './App.css';
import ContactManager from './components/ContactManager';

function App() {

  const contacts = ["Vladimir", "Sergei", "Dmitriy"];

  return (
    <div className="App">
      <header className="App-header">
        <ContactManager data={contacts} />
      </header>
    </div>
  );
}

export default App;
```

Приложение отобразит список из трёх предварительно указанных элементов и позволит добавить в список дополнительные элементы.

Ключевым является тот факт, что данные, определяющие состояние компонентов передаются от родительских компонентов к дочерним, только в одном направлении (через атрибуты JSX-тэгов, которые копируются в контейнер свойств **props**). В случае, если в дочернем компоненте происходит какое-то важное событие, оно может уведомить об этом родительский компонент через **callback-функцию** (которая передаётся через свойство контейнера props).

## State Management - Исключительная важность Redux

У компонентной модели React есть один неочевидный недостаток - путь от компонента верхнего уровня к компонентам внизу иерархии может быть очень долгим. И столько же избыточным (*redundant code*) могут быть callback-вызовы, информирующие компоненты верхнего уровня о ключевых событиях, происходящих в самом низу. Чтобы избежать захламления и усложнения кода используется глобальное состояние, чаще всего реализуемого посредством [Redux](https://redux.js.org/).

Суть Redux состоит в том, что в web-приложении есть только одно место (*single source of truth*), в котором хранится его глобальное состояние (**Store**). Любой компонент может сформировать некоторое действие (**Action**), которое попадёт на обработку в **Reducer** - специальный тип объектов, осуществляющих изменение глобального состояния. Любой компонент может подписаться на уведомление об изменении глобального состояния. В определённом смысле, Redux реализует шаблон проектирования **Publish/Subscribe**, который позволяет связать между собой компоненты, удалённые друг от друга в иерархии очень далеко.

Последовательность изменения состояния в Redux:

1.	Переход в состояние осуществляется посредством вызова dispatch(action)
2.	Вызывается reducer(currentState, action) и это приводит к созданию подмножества «текущее состояния для конкретного action» (newState)
3.	Вызываются функции-слушатели, которые подписаны на изменения состояния и они осуществляют изменения в пользовательском интерфейсе (UI Changes)

Redux является синхронной библиотекой, которая работает как **Singleton**. Для добавления асинхронности совместно с Redux используют библиотеки: [redux-thunk](https://github.com/reduxjs/redux-thunk)/[Saga](https://redux-saga.js.org/)/[Epic](https://www.npmjs.com/package/redux-epic).

Redux довольно много небезосновательно критикуют. Многие разработчики столкнулись в проблемой критичного роста сложности сопровождения Redux-приложений. Выделяется, как минимум, две причины:

- Redux-приложение выглядит как имеющее некоторую архитектуру "из коробки". Кажется, что Redux явно указывает место в коде, в котором должна быть реализована логика (store), т.е. как-бы, существует разделение ответсвенности между компонентами. В действительности, для React/Redux необходима изначально, тщательно проработанная архитектура
- Возникают скрыто-связанные зависимости компонентов (см. [канал](https://www.youtube.com/c/JavascriptNinja) JavaScript.Ninja), что приводит к сложно прогнозируемым развалам приложения при рефакторинге кода

Проблема скрыто-связанных зависимостей схожа с тем, что происходит при не аккуратном использовании шаблона проектирования Publish/Subscribe - существуют не явные подписчики (и связанная с ними логика), которые ожидают того, что кто-то другой сделает за них некоторую работу, результаты которой они будут использовать в своих целях. Часто, такой работой является загрузка некоторой информации с сервера. Соответственно, если компонент, инициировавший запрос перестанет это делать, или будет получать данные другим способом (например, они будут включены в разметку), то зависимые компоненты перестанут работать корректно. Чтобы минимизировать возникновение подобных ситуаций опытные разработчики разделяют store на две разные сущности: состояния и **cache**. К cache относят данные редко загружаемые с сервера (чаще - один раз). Для работы с cache используют специализированные библиотеки: [React Query](https://react-query.tanstack.com/), [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) и [SWR](https://swr.vercel.app/ru).


### Установка Redux и React-Redux

Установка библиотеки: `npm install --save redux`.

На уровне главного объекта приложения следует определить Store - главное хранилище состояния:

```javascript
const store = Redux.createStore(rootReducer);
```

**React-Redux** – это библиотека, которая отвечает за интеграцию React с Redux. Эта библиотека предоставляет компонент Provider и соответствующие функции для связывания.
Handles – это функции-слушатели, передающие состояние приложения в некоторый компонент.

Установить package можно так: `npm install --save react-redux`

Пример типового кода позволяющего включить Redux в React-приложение:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import rootReducer from './reduceers';

const store = createStore(rootReducer);

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('root');
);
```

Приведённый выше код осуществляет подготовку использования Redux в приложении. Библиотека React-Redux добавляет компонент **Provider**, который позволяет встраивать доступ к store в props. Достаточно обернуть главный компонент приложения (App) в компонент Provider.

### Обработка действия в Reducer

Со store следует связать Reducer - функцию обработки действия по изменению состояния. Простейший пример:

```javascript
function contactsApp( state, action ) {
	if (action.type === 'ADD_CONTACT') {
		return [ ...state, action.name ]
	} else {
		return state
	}
}
```
Обычной практикой является обработка в Reducer-е нескольких, связанных действий:

```javascript
function rootReducer(state={}, action) {
	switch(action.type) {
	case "LOGOUT_USER":
		return {...state, login: false}
	case "LOGIN_USER":
		return {...state, login: true}
	default:
		return state;
	}
}
```

Широко применяется комбинирование Reducer-ов, каждый из которых обрабатывает только одну сущность. Примеры разных сущностей: информация об товарах (список), текущих приложениях (список), информацию о пользователе (словарь), и т.д. Пример объединения Reducer-ов:

```javascript
import {combineReducers} from 'redux';
import currentUser from './currentUser';
import messages from './messages';

const rootReducer = combineReducers({
	currentUser,
	messages,
});

export default rootReducer;
```

Крайне важно, чтобы rootReducer был **pure function**.

### Создание действия

Действие (Action) - это объект, в котором должно быть определено поле с именем "type". Например:

```json
{
	"type": "LOGOUT_USER"
}
```

Активировать действие можно используя функцию dispatch(), например:

```javascript
const store = Redux.createStore(rootReducer);
...
store.dispatch({
	type: "LOGIN_USER"
});
```

### Подписка на события

Подписаться на изменение состояния можно в любом компоненте. В иллюстративных материалах это делается через объект store:

```javascript
const store = Redux.createStore(rootReducer);
const changeCallback = () => {
	console.log("State has changed", store.getState());
}
const unsubscribe = store.listen(changeCallback);
```

Функция unsubscribe() позволяет отменить подписку - это крайне важно, т.к. без этого может возникнуть утечка памяти.

Например, если пользователь прошёл аутентификацию, изменяется текущее состояние и listener отвечающий за навигационную панель, выполняет rendering компонента, который формирует в NavBar ссылки на функции, доступные только после аутентификации пользователя.

На практике, связывание с глобальным состояниям осуществляется через **props**, для чего используется функция **connect**(). Ниже приведён код компонента, который использует Redux для получения состояния из Redux в виде **props**:

```javascript
import React from 'react';
import {connect} from 'react-redux';

const BoldName = ({name}) => (
	<strong>{name}</strong>
);

const mapStateToProps = state => (
	{ name: state.name }
);

export default connect(mapStateToProps, null)(BoldName);
```

Wrapper-функция connect() связывает компонент BoldName с Redux, а точкой формирования состояния компонента является mapStateToProps.

В случае, если при нажатии на какую либо ссылку внутри компонента нужно поменять состояние в Redux, для этого следует использовать второй параметр вызова connect():

```javascript
import React from 'react';
import {connect} from 'react-redux';

const DelName = ({delName}) => (
	<button type="button" 
		onClick={delName}>DELETE</button>
);

const mapDispatchToProps = (
	dispatch, ownProps
) => (
	{ 
		delName: () => (dispatch({
			type: "DEL_NAME"
		}))
	}
);

export default connect(null, mapDispatchToProps)(DelName);
```

Следует обратить внимание на тот факт, что при использовании Hooks, код может выглядеть принципиально другим образом.

### Критика использования Hooks

Критичная статья за авторством Nir Yosef под названием [The Ugly Side of React Hooks](https://medium.com/swlh/the-ugly-side-of-hooks-584f0f8136b6) указывает на целый ряд недостатоков Hooks.

Разработчики Hooks указывают на то, что компоненты, реализованные как классы являются слишком избыточными (verbose). В статье указывается, что это действительно так, но при этом классы соответствуют практикам разработки приложений ООП, тогда как функциональные компоненты вместе с Hooks рождают свою собственную парадигму, в которой содержится очень conventions, которые не очевидны и их нужно знать. Это существенно повышает порог вхождения и делает код менее надёжным. Одним из примеров таких "странных сущностей" является **useRef**, который является аналогом this в функциональном компоненте. У Hooks вообще очень станные имена: **useEffect**, **useMemo**, **useImperativeHandle**.

В статье критикуется и Redux, как очень плохой шаблон проектирования. Автор указывает, что одной из основных проблем React явялется отсутсвтвие "из коробки" решения для управления состояниями.

При этом, автор статьи указывает на то, что в Hooks есть и удачные решения, например, шаблон, при котором подписка на изменения состояния тесно связана с отменой подписки, что позволяет избежать сложно уловимых ошибок утечки ресурсов:

```javascript
useEffect(() => {
    subscribeToA();
    return () => {
      unsubscribeFromA();
    };
 }, []);
```

Вместе с тем, в компонентах-классах этот шаблон также можно использовать:

```javascript
class Foo extends React.Component {
   someEffect = effect((value1, value2) => {
     subscribeToA(value1, value2);
     return () => {
        unsubscribeFromA();
     };
   })
   render(){ 
    this.someEffect(this.props.value1, this.state.value2);
    return <Text>Hello world</Text>   
   }
}
```

Ещё одна проблема, на которую указывают разработчики Hooks состоит в том, что по их мнению, классы плохо поддаются минификации. Этот довод, тем не менее, не подтверждён цифрами.

Нир Иосеф указывает, что функциональные классы с Hooks, которые автор называет Funclasses, связаны с **The Hidden Side Effects** - сторонными негативными эффектами, связанными с неочевидными особенностями реализации Hooks. Чаще всего такими эффектами являются избыточные вызовы компонентов и падение производительности приложения.

В качестве выхода, рассматривается возможность использования [Context API](https://ru.reactjs.org/docs/context.html).

### Дополнительно

Redux – популярная библиотека state management, была разработана Дэном (Денисом) Абрамовым и Andrew Clark.

Ключевой является [cтатья](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0) Дениса Абрамова с методическими рекомендациями по использованию Redux. В 2019 году появилась приписка к статье, в которой Дэн Абрамов указывает, что React Hooks заменяет Redux и разделение компонентов на два типа уже не является принципиальным.

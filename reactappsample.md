# Пример создания простейшего приложения на React

Создание React-приложение начинается с установки генератора кода шаблона:

```cmd
npm install -g create-react-app
```

Далее следует перейти в папку, в которой должна быть создана подпапка с приложением и запустить скрипт создания шаблона приложения:

```cmd
create-react-app [имя приложения]
```

После загрузки зависимостей можно запустить приложение, используя **npm**, или **yarn**. Например: `yarn start`

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

Второй файл реализован как функциональный компонентю Он получает массив данных и формирует из него неосортированный список (ul).

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

## Исключительная важность Redux

У компонентной модели React есть один неочевидный недостаток - путь от компонента верхнего уровня к компонентам внизу иерархии может быть очень долгим. И столько же избыточным могут быть callback-вызовы, информирующие компоненты верхнего уровня о ключевых событиях, происходящих в самом низу. Чтобы избежать захламления и усложнения кода используется глобальное состояние, чаще всего реализуемоей посредством [Redux](https://redux.js.org/).

Суть Redux состоит в том, что в web-приложении есть только одно место, в котором хранится его глобальное состояние (**Store**). Любой компонент может сформировать некоторое действие (**Action**), которое попадёт на обработку в **Reducer** - специальный тип объектов, осуществляющих изменение глобального состояния. Любой компонент может подписаться на уведомление об изменении глобального состояния. В определённом смысле, Redux реализует шаблон проектирование Publish/Subscribe, который позволяет связать между собой компонены, удалённые друг от друга в иерархии очень далеко. Применение Redux значительно упрощает взаимодействие между компонентами в приложении.

Для асинхронного взаимодействия часто используется [Redux-Thunk](https://github.com/reduxjs/redux-thunk).


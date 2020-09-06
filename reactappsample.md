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
        console.log('person: ' + person)
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

Второй файл назовём "PeopleList.js" и поместим в ту же папку:

```
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

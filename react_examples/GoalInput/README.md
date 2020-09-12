# React Native Exercise
Репозитарий содержит учебное приложение, разработанное в рамках курса "React Native – the Practical Guide by Maximilian Schwarzmüller" на [Udemy](https://www.udemy.com/course/react-native-the-practical-guide/learn/lecture/15419946?start=0#overview).

# Установка expo
Приложение разрабатывается посредством инстументальных средств [expo](https://expo.io/). Установка: `npm install expo-cli --global`

Под Windows 10 заработала связка из [Node.js 12.9](https://nodejs.org/dist/v12.9.0/) и expo cli 3.5: `npm install -g expo-cli@3.5.0`

Можно использовать более актуальные версии, но может потребоваться исправление [скрипта](https://github.com/expo/expo-cli/issues/1074).

Загрузить используемые packages можно командой, запускаемой из папки с проектом: `npm install`

Запуск приложения: `npm start`

Для работы требуется Android Emulator, входящий в состав Android Studio. Инструкция по установке эмулятора есть на expo.io, в секции [Up and Running](https://docs.expo.io/versions/latest/workflow/android-studio-emulator/).

# Особенности приложения
В приложении используется spread-оператор:

```javascript
const addGoalHandler = () => {
    setCourseGoals(currentGoals => [...currentGoals, enteredGoal]);
};
```

Приведённый выше пример кода содержит стрелочную функцию (arrow function) в расширенном формате. В полном виде этот код мог бы выглядеть так:

```javascript
setCourseGoals((currentGoals) => {return [...currentGoals, enteredGoal];})
```

Тем не менее, JavaScript допускает [сокращение](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Functions/Arrow_functions).

Обработка реакция пользователя подразумевает работу с состояниями, которые для функциональных компонентов создаются с использованием Hooks. Например обработка изменения текста в строке редактирования будет выглядеть так:

```javascript
export default function App() {
  const [enteredGoal, setEnteredGoal] = useState('');

const goalInputHandler = (enteredText) => {
    setEnteredGoal(enteredText);
};
return (
    <View style={styles.screen}> …
        <TextInput placeholder="Course Goal" style={styles.input} 
          onChangeText={goalInputHandler} />
```

В приведённом выше примере **enteredGoal** – имя переменной, а **setEnteredGoal** – имя метода, который можно использовать для изменения этой переменной. Параметр useState() – это начальное значение переменной. Соответственно, свойство **onChangeText** позволяет указать функцию, которая будет вызываться при изменении содержимого строки редактирования. В этой функции (goalInputHandler) мы можем использовать setEnteredGoal() для изменения состояния компонента, которое определяется, в том числе, переменной enteredGoal.

Обработка нажатия кнопки может выглядеть так:

```javascript
const addGoalHandler = () => {
    console.log(enteredGoal);
};
…
<Button title="ADD" onPress={addGoalHandler}></Button>
```

В приведённом выше примере, интересным является только использование функции **console.log**(), которая позволяет вывести диагностическое сообщение в консоль **expo**.

# Разделение приложения на компоненты
Разделение приложения на компоненты, по очевидным причинам, является необходимым. Рекомендация – создать отдельный подкаталог «components» для собственных компонентов.

Ключевым знанием является:
1. Состояния (**states**) могут быть у каждого компонента
2. Передать значения в компонент можно через **props**
3. Передать значения из дочернего компонента в родительский можно через **callback-функции**, переданные через **props**

Пример родительской формы:

```javascript
import React, { useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';

import GoalItem from './components/GoalItem';
import GoalInput from './components/GoalInput';

export default function App() {
  
  const [courseGoals, setCourseGoals] = useState([]);
  
  const addGoalHandler = goalTitle => {
    setCourseGoals(currentGoals => [...currentGoals, 
      { id: Math.random().toString(),
        value: goalTitle}]);
  };
  
  return (
    <View style={styles.screen}>
      <GoalInput onAddGoal={addGoalHandler} />
      <FlatList … />
    </View>
  );
}
```

Пример кода компонента, который получает данные от родительского кода и передаёт данные обратно посредством callback:

```javascript
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

const GoalInput = props => {
    const [enteredGoal, setEnteredGoal] = useState('');
    
    const goalInputHandler = (enteredText) => {
        setEnteredGoal(enteredText);
    };
    
    return (
        <View style={styles.inputContainer}>
            <TextInput 
                placeholder="Course Goal" 
                style={styles.input} 
                onChangeText={goalInputHandler} 
                value={enteredGoal} />
            <Button title="ADD" 
                onPress={() => props.onAddGoal(enteredGoal)} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center'
    },
    input: {
        width: '80%', 
        borderBottomColor: 'black', 
        borderWidth: 1, 
        padding: 10
    }
});

export default GoalInput;
```

import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Button } from 'react-native';

// Импортируем разработанные нами компоненты
import GoalItem from './components/GoalItem';
import GoalInput from './components/GoalInput';


export default function App() {
  
  // Определяем состояние главной формы (Hooks)
  const [courseGoals, setCourseGoals] = useState([]);
  // Применяется подход называемый destructuring, или
  // "леструктурирующее присваивание". Первой элемент
  // выходного массива - переменная, а второй элемент -
  // метод для её изменения (с использованием Hooks)
  const [isAddMode, setIsAddMode] = useState(false)

  // Определяем функцию обработки команды "Добавить новый элемент".
  // Фактически, эта команда будет поступать из дочернего компонента,
  // в который callback-функция передаётся через props
  const addGoalHandler = goalTitle => {
     // Используем spread-оператор
    setCourseGoals(currentGoals => [...currentGoals, 
      { id: Math.random().toString(),
        value: goalTitle}]);

    setIsAddMode(false);
  };

  // Определяем функцию удаления элемента из списка FlatList по
  // указанному идентификатору. Для удаления элемента используется
  // функция filter(). Для изменения состояния используется setCourseGoals()
  const removeGoalHandler = goalId => {
    setCourseGoals(currentGoals => {
      return currentGoals.filter((goal) => goal.id != goalId);
    });
  }

  // Callback-метод, который вызывается из дочернего компонента
  // для отмены отображения модального окна
  const cancelGoalAdditionHandler = () => {
    setIsAddMode(false);
  }

  // Форма использует два дочерних компонента:
  // GoalInput - используется для ввода текста
  // GoalItem - элемент списка FlatList
  return (
    <View style={styles.screen}>
      <Button title="Add New Goal" onPress={() => setIsAddMode(true)} />
      <GoalInput visible={isAddMode} onAddGoal={addGoalHandler} 
        onCancel={cancelGoalAdditionHandler} />
      <FlatList 
        keyExtractor={(item, index) => item.id}
        data={courseGoals} 
        renderItem={itemData => ( 
          <GoalItem 
            id={itemData.item.id}
            title={itemData.item.value}
            onDelete={removeGoalHandler} 
          />
        )}
      />
    </View>
  );
}

// Таблица стилей элементов формы
const styles = StyleSheet.create({
  screen: {
    padding: 50
  }
});

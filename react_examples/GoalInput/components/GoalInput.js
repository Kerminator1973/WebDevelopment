import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Modal } from 'react-native';

const GoalInput = props => {

    // У этого компонента есть своё собственное состояние
    const [enteredGoal, setEnteredGoal] = useState('');

    // Определяем функцию обработки изменения содержимого в строке редактирования
    const goalInputHandler = (enteredText) => {
        setEnteredGoal(enteredText);
    };

    const addGoalHandler = () => {
        // Вызываем callback-метод для передачи информации о введённом 
        // значении родительскому компоненту
        props.onAddGoal(enteredGoal);
        
        // Сбрасываем состояние строки редактирования
        setEnteredGoal('');
    };

    // При нажатии на кнопку "ADD" мы вызовем callback-функцию, которую
    // нам передал родительский компонент через props. Значением свойство onPress
    // является функция. Соответственно, мы может либо вернуть анонимную функцию:
    //      () => props.onAddGoal(enteredGoal)
    // либо использовать bind():
    //      props.onAddGoal.bind(this, enteredGoal)
    // Оба варианта являются равнозначными
    return (
        <Modal visible={props.visible} animationType="slide">
            <View style={styles.inputContainer}>
                <TextInput 
                    placeholder="Course Goal" 
                    style={styles.input} 
                    onChangeText={goalInputHandler} 
                    value={enteredGoal} />
                <View style={styles.buttonContainer}>
                    <View style={styles.button}> 
                        <Button title="CANCEL" color="red" onPress={props.onCancel} />
                    </View>
                    <View style={styles.button}> 
                        <Button title="ADD" onPress={addGoalHandler} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// Компонент использует свои собственные таблицы стилей
const styles = StyleSheet.create({
    inputContainer: {
        flex: 1,    // Этот трюк, позволяет выравнить modal по центру экрана
        flexDirection: 'column',    // column - значение по умолчанию
        justifyContent: 'center', 
        alignItems: 'center'
    },
    input: {
        width: '80%', 
        borderBottomColor: 'black', 
        borderWidth: 1, 
        padding: 10,
        marginBottom: 10
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%'
    },
    button: {   // Применение этого стиля обеспечивает равную ширину кнопок
        width: '40%'
    }
});

export default GoalInput;

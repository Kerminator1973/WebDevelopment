import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Возвращаем отображаемый элемент. Компонент параметризован
// посредством свойства props.title в котором передаётся
// отображаемый текст, а также свойства id, в котором передаётся
// уникальный идентификатор элемента (он формируется посредством
// генератора случайных чисел - см. Math.random() в "App.js").
// Элемента Touchable используется для обработки нажатия на область экрана
const GoalItem = props => {
    return  (
        <TouchableOpacity onPress={props.onDelete.bind(this, props.id)}> 
            <View style={styles.listItem}>
                <Text>{props.title}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    listItem: {
      padding: 10,
      marginVertical: 10,   // Отсутствует в CSS
      backgroundColor: '#ccc',
      borderColor: 'black',
      borderWidth: 1
    }  
});

export default GoalItem;

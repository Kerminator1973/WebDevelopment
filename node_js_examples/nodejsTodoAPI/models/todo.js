// Файл содержит описание схемы данных для хранения в MongoDB

var mongoose = require('mongoose');

// Определяем схему для создания модели в базе данных
var todoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Name cannot be blank!'
    },
    completed: {
        type: Boolean,
        default: false
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});

// Компилируем схему в модель
var Todo = mongoose.model('Todo', todoSchema);

// Экспортируем модель, чтобы её можно было подключать через require()
module.exports = Todo;

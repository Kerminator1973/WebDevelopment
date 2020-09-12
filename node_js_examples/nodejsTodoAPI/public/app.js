$(document).ready(function() {

    // Мы уже находимся на томже сайте, что и REST API,
    // что позволяет использовать относительный, а не
    // полный путь
    $.getJSON("/api/todos")
    .then(addTodos);

    $("#todoInput").keypress(function(event) {
        if(event.which === 13) {
            createTodo();
        }
    });

    // Обрабатываем trigger - переключение режима todo 
    // "выполнено/невыполнено"
    $('.list').on('click', 'li', function() {
        updateTodo($(this));
    });

    // Обработка событий добавляется только к тем элементам,
    // которые уже существуют на момент вызова функции on().
    // Поскольку мы добавляем элементы списка динамически и,
    // соответственно, span тоже добавляются динамически, то
    // привязываться к ним мы не можем. Вместо этого, мы 
    // привязываемся к элементу разметки, который изначально
    // присутствует в HTML-документе "<ul class='list'>...</ul>",
    // но добавляем фильтр "span", явно указывая, что вызывать
    // обработчик нужно только в том случае, если щелчок
    // был выполнен внутри "span"
    $('.list').on('click', 'span', function(e) {

        // Поскольку родительский элемент тоже обрабатывает событие
        // "click", мы явным образом блокируем дальнейшую обработку
        // события, чтобы родительский элемент не обработал её
        e.stopPropagation();

        removeTodo($(this).parent());        
    });
});

function addTodos(todos) {
    todos.forEach(function(todo) {
        addTodo(todo);
    });
}

function addTodo(todo) {

    // Результатом выполнения следующей строки является DOM-элемент,
    // что позволяет нам применять к нему разные вспомогательные
    // функции, такие как addClass()
    var newTodo = $('<li class="task">' + todo.name + '<span>X<span>' + '</li>');

    // Привязываем к добавляемому элементу идентификатор записи из базы данных.
    // Эти данные не будут отражаться в DOM-модели, но их можно будет получать
    // и использовать в javascript-коде
    newTodo.data('id', todo._id);
    newTodo.data('completed', todo.completed);

    if(todo.completed) {
        newTodo.addClass("done");
    }

    // Включаем новый элемент в DOM-элемент (список)
    $('.list').append(newTodo);
}

function createTodo() {

    // Отправляем Post-запрос в REST API для добавления
    // значения, введённого пользователем в строке 
    // редактирования
    var usrInput = $("#todoInput").val();
    $.post('/api/todos', {
        name: usrInput
    })
    .then(function(newTodo) {
        $("#todoInput").val("");
        addTodo(newTodo);
    })
    .catch(function(err) {
        console.log(err);
    });
}

function removeTodo(todo) {
    var deleteUrl = '/api/todos/' + todo.data('id');

    $.ajax({
        method: 'DELETE',
        url: deleteUrl
    })
    .then(function(data) {
        todo.remove();
    })
    .catch(function(err) {
        console.log(err);
    });
}

function updateTodo(todo) {
    var updateUrl = '/api/todos/' + todo.data('id');
    var isDone = !todo.data('completed');
    var updateData = {completed: isDone}

    $.ajax({
        method: 'PUT',
        url: updateUrl,
        data: updateData
    })
    .then(function(updatedTodo) {
        todo.toggleClass("done");
        todo.data('completed', isDone);
    })
    .catch(function(err) {
        console.log(err);
    });
}

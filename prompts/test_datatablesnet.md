# Промпт для тестирования шаблона

Проанализируй документ по ссылке: https://github.com/Kerminator1973/WebDevelopment/blob/master/prompts/datatablesnet.md
Сгенерируй код web-интерфейса с таблицей, в которой отображаются колонки: ФИО пользователя, контактный телефон, название организации, номер банковского счёта для зачисления средств

## Результат

Giga.Chat отказался анализировать документ по ссылке.

Alice.yandex.ru сгенерировала HTML-документ в который включала описание стилей css (нежелательно) и JavaScript-код (также нежелательно). JavaScript явно не знает специфику DataTables.NET и предполагает прямую манипуляцию с DOM для заполнения таблицы, что является ошибочным.

Cloude Sonet 4.5 сгенерировал следующий код (index.html):

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Управление пользователями</title>
    
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="libs/bootstrap-5.1.3/css/bootstrap.min.css">
    <!-- DataTables CSS -->
    <link rel="stylesheet" href="libs/datatables-2.3/css/dataTables.bootstrap5.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="container mt-4">
        <h1 class="mb-4">Управление пользователями</h1>
        
        <!-- Панель управления -->
        <div class="mb-3">
            <button type="button" class="btn btn-success" id="btnAdd">Добавить</button>
            <button type="button" class="btn btn-primary" id="btnEdit" disabled>Изменить</button>
            <button type="button" class="btn btn-danger" id="btnDelete" disabled>Удалить</button>
        </div>

        <!-- Таблица -->
        <table id="usersTable" class="table table-striped table-bordered" style="width:100%">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>ФИО пользователя</th>
                    <th>Контактный телефон</th>
                    <th>Название организации</th>
                    <th>Номер банковского счёта</th>
                </tr>
            </thead>
            <tbody>
                <!-- Данные загружаются через AJAX -->
            </tbody>
        </table>
    </div>

    <!-- Модальное окно для добавления/редактирования -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editModalLabel">Добавить пользователя</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
                </div>
                <div class="modal-body">
                    <form id="userForm">
                        <input type="hidden" id="userId">
                        
                        <div class="mb-3">
                            <label for="fullName" class="form-label">ФИО пользователя</label>
                            <input type="text" class="form-control" id="fullName" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="phone" class="form-label">Контактный телефон</label>
                            <input type="tel" class="form-control" id="phone" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="organization" class="form-label">Название организации</label>
                            <input type="text" class="form-control" id="organization" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="bankAccount" class="form-label">Номер банковского счёта</label>
                            <input type="text" class="form-control" id="bankAccount" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отменить</button>
                    <button type="button" class="btn btn-primary" id="btnSave">Сохранить</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Модальное окно для подтверждения удаления -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="deleteModalLabel">Подтверждение удаления</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
                </div>
                <div class="modal-body">
                    Вы действительно хотите удалить выбранную запись?
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отменить</button>
                    <button type="button" class="btn btn-danger" id="btnConfirmDelete">Подтвердить</button>
                </div>
            </div>
        </div>
    </div>

    <!-- jQuery -->
    <script src="libs/jquery-3.7.1/jquery.min.js"></script>
    <!-- Bootstrap JS -->
    <script src="libs/bootstrap-5.1.3/js/bootstrap.bundle.min.js"></script>
    <!-- DataTables JS -->
    <script src="libs/datatables-2.3/js/dataTables.min.js"></script>
    <script src="libs/datatables-2.3/js/dataTables.bootstrap5.min.js"></script>
    <!-- Custom JS -->
    <script src="js/app.js"></script>
</body>
</html>
```

Каскадные стили определены в файле "css/styles.css":

```css
/* Дополнительные стили для таблицы */
#usersTable {
    font-size: 14px;
}

#usersTable thead th {
    background-color: #f8f9fa;
    font-weight: 600;
}

/* Выделение выбранной строки */
#usersTable tbody tr.selected {
    background-color: #cfe2ff !important;
}

#usersTable tbody tr:hover {
    cursor: pointer;
}

/* Стили для кнопок */
.btn {
    min-width: 100px;
}

/* Стили для модальных окон */
.modal-header {
    background-color: #f8f9fa;
}

/* Отступы для контейнера */
.container {
    max-width: 1200px;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
    .btn {
        min-width: auto;
        margin-bottom: 5px;
    }
}

/* Стили для центрирования содержимого ячеек */
.dt-body-center {
    text-align: center;
}

/* Стили для поля поиска DataTables */
.dataTables_filter {
    margin-bottom: 15px;
}

/* Стили для информации о пагинации */
.dataTables_info {
    padding-top: 15px;
}
```

JavaScript определён в файле "js/app.js":

```js
// Глобальные переменные
let table;
let selectedRow = null;
let currentMode = 'add'; // 'add' или 'edit'

// API endpoints (замените на ваши реальные URL)
const API_BASE_URL = '/api/users';

// Инициализация при загрузке документа
$(document).ready(function() {
    initializeDataTable();
    setupEventHandlers();
});

/**
 * Инициализация DataTables с настройками
 */
function initializeDataTable() {
    const datatableSettings = {
        "ajax": {
            "url": API_BASE_URL,
            "type": "GET",
            "dataSrc": "",
            "error": function(xhr, error, thrown) {
                console.error('Ошибка загрузки данных:', error);
                alert('Не удалось загрузить данные. Проверьте подключение к API.');
            }
        },
        "columns": [
            {
                "data": "id",
                "className": "dt-body-center",
                "searchable": false
            },
            {
                "data": "fullName"
            },
            {
                "data": "phone"
            },
            {
                "data": "organization"
            },
            {
                "data": "bankAccount"
            }
        ],
        "order": [[0, 'asc']], // Сортировка по первому полю (ID)
        "pageLength": 14, // 14 строк на странице
        "language": {
            "url": "//cdn.datatables.net/plug-ins/2.0.0/i18n/ru.json",
            "search": "Поиск:",
            "lengthMenu": "Показать _MENU_ записей",
            "info": "Показано с _START_ по _END_ из _TOTAL_ записей",
            "infoEmpty": "Записи отсутствуют",
            "infoFiltered": "(отфильтровано из _MAX_ записей)",
            "paginate": {
                "first": "Первая",
                "last": "Последняя",
                "next": "Следующая",
                "previous": "Предыдущая"
            },
            "zeroRecords": "Записи не найдены"
        },
        "select": {
            "style": "single"
        }
    };

    table = $('#usersTable').DataTable(datatableSettings);

    // Обработка выбора строки
    $('#usersTable tbody').on('click', 'tr', function() {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            selectedRow = null;
            updateButtonStates();
        } else {
            $('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            selectedRow = table.row(this).data();
            updateButtonStates();
        }
    });
}

/**
 * Настройка обработчиков событий для кнопок
 */
function setupEventHandlers() {
    // Кнопка "Добавить"
    $('#btnAdd').on('click', function() {
        currentMode = 'add';
        $('#editModalLabel').text('Добавить пользователя');
        clearForm();
        $('#editModal').modal('show');
    });

    // Кнопка "Изменить"
    $('#btnEdit').on('click', function() {
        if (selectedRow) {
            currentMode = 'edit';
            $('#editModalLabel').text('Изменить пользователя');
            populateForm(selectedRow);
            $('#editModal').modal('show');
        }
    });

    // Кнопка "Удалить"
    $('#btnDelete').on('click', function() {
        if (selectedRow) {
            $('#deleteModal').modal('show');
        }
    });

    // Кнопка "Сохранить" в модальном окне редактирования
    $('#btnSave').on('click', function() {
        if ($('#userForm')[0].checkValidity()) {
            saveUser();
        } else {
            $('#userForm')[0].reportValidity();
        }
    });

    // Кнопка "Подтвердить" в модальном окне удаления
    $('#btnConfirmDelete').on('click', function() {
        deleteUser();
    });
}

/**
 * Обновление состояния кнопок в зависимости от выбранной строки
 */
function updateButtonStates() {
    const hasSelection = selectedRow !== null;
    $('#btnEdit').prop('disabled', !hasSelection);
    $('#btnDelete').prop('disabled', !hasSelection);
}

/**
 * Очистка формы
 */
function clearForm() {
    $('#userId').val('');
    $('#fullName').val('');
    $('#phone').val('');
    $('#organization').val('');
    $('#bankAccount').val('');
}

/**
 * Заполнение формы данными из выбранной строки
 */
function populateForm(data) {
    $('#userId').val(data.id);
    $('#fullName').val(data.fullName);
    $('#phone').val(data.phone);
    $('#organization').val(data.organization);
    $('#bankAccount').val(data.bankAccount);
}

/**
 * Сохранение пользователя (создание или обновление)
 */
function saveUser() {
    const userData = {
        fullName: $('#fullName').val(),
        phone: $('#phone').val(),
        organization: $('#organization').val(),
        bankAccount: $('#bankAccount').val()
    };

    let url = API_BASE_URL;
    let method = 'POST';

    if (currentMode === 'edit') {
        userData.id = $('#userId').val();
        url = `${API_BASE_URL}/${userData.id}`;
        method = 'PUT';
    }

    $.ajax({
        url: url,
        type: method,
        contentType: 'application/json',
        data: JSON.stringify(userData),
        success: function(response) {
            $('#editModal').modal('hide');
            table.ajax.reload();
            selectedRow = null;
            updateButtonStates();
            alert(currentMode === 'add' ? 'Пользователь успешно добавлен' : 'Пользователь успешно обновлён');
        },
        error: function(xhr, error, thrown) {
            console.error('Ошибка сохранения:', error);
            alert('Не удалось сохранить данные. Попробуйте ещё раз.');
        }
    });
}

/**
 * Удаление пользователя
 */
function deleteUser() {
    if (!selectedRow) return;

    $.ajax({
        url: `${API_BASE_URL}/${selectedRow.id}`,
        type: 'DELETE',
        success: function(response) {
            $('#deleteModal').modal('hide');
            table.ajax.reload();
            selectedRow = null;
            updateButtonStates();
            alert('Пользователь успешно удалён');
        },
        error: function(xhr, error, thrown) {
            console.error('Ошибка удаления:', error);
            alert('Не удалось удалить пользователя. Попробуйте ещё раз.');
        }
    });
}
```

Cloude Sonet 4.5 даже подготовил тестовые данные:

```json
[
    {
        "id": 1,
        "fullName": "Иванов Иван Иванович",
        "phone": "+7 (999) 123-45-67",
        "organization": "ООО \"Рога и копыта\"",
        "bankAccount": "40817810099910004312"
    },
    {
        "id": 2,
        "fullName": "Петрова Мария Сергеевна",
        "phone": "+7 (999) 987-65-43",
        "organization": "ИП Петрова М.С.",
        "bankAccount": "40817810155550008765"
    }
]
```

Качество решения - высокое. Почти также, как обычно пишу я. LLM сожгла приблизительно 13 тыс. токенов, т.е. около 25 рублей.

let gAuditEventTable = undefined;
let gAuditEventTypes = new Map();   // Список типов событий
let gStorageIds = new Map();

document.addEventListener('DOMContentLoaded', function (event) {

    // Заполняем вспомогательные НСИ
    initAuditEventMaps();

    // Инициализируем таблицу средствами DataTables.NET
    let datatable_settings = getDatatableSettings();

    datatable_settings["columns"] = [
        {
            "data": "id",
            "searchable": false // Не ищем по номеру идентификатора
        },
        { "data": "type" },
        { "data": "user" },
        { "data": "date", className: "dt-body-center" },
        { "data": "addr", className: "dt-body-center" },
        { "data": "msg" }
    ];

    // Определяем, показывать ли нулевое поле с идентификатором записи
    datatable_settings["columnDefs"] = GetAuditEventsColumnDefs();

    // Сортируем таблицу по первой колонке, в порядке убывания
    datatable_settings["order"] = [[0, "desc"]];

    // Ищем в верстке страницы признак, который позволяет определить режим работы
    // DataTables.net: server-side, или client-side.
    //
    // В режиме server-side отображаемые данные запрашиваются с сервера каждый раз,
    // при изменении параметров фильтрации, или при выборе страницы Pagenator-а.
    // 
    // В режиме client-side, при выборе страницы Pagenator-а отображаемые данные 
    // извлекаются из кэша браузера; подгрузка кэша осуществляется только при
    // явном указании пользователя - при нажатии кнопки "Применить"
    const bServerSide = $('#serverSideDTNET').length;
    if (bServerSide) {

        // Настраиваем блок для отображения количества записей в выборке
        datatable_settings["info"] = true;
        datatable_settings["language"]["info"] = "Записей в выборке: _MAX_";

        // Server-Side DataTables.net - при любом действии в пользовательском интерфейсе
        // отправляет запрос на сервер
        datatable_settings["processing"] = true;
        datatable_settings["serverSide"] = true;

        appendServerSideHandlers();
    }
    else
    {
        // Поскольку для формирования отчётов все отбранные данные должны
        // находится в кэше браузера, кнопки генерации отчётов добавляем только
        // в режиме client-side rendering
        datatable_settings["layout"] = {
            topStart: {
                buttons: ['copy', 'csv', 'excel', 'print']
            }
        };

    }
    
    datatable_settings["ajax"] = {
        "url": "/AuditEvents?handler=Part",
        "data": bServerSide ? getServerSideAjax() : getClientSideAjax()
    };

    // Расширяем таблицу, привязывая к ней JS-код и стили из DataTables.NET
    gAuditEventTable = $('#auditEventsTable')
        .on('init.dt', function () {    // Вызывается после того, как будет загружен список сообщений
            gAuditEventTable.columns.adjust().draw();   // Пересчитываем ширину колонок
        })
        .DataTable(datatable_settings);
});

/**
 * Возвращает функцию формирования http-запроса для загрузки данных с сервера
 */
function getClientSideAjax() {
    return (d) => {

        // Указываем, что загружаться должны все данные запроса по шаблону
        d.Partial = 0;

        // Client-side режим используется на форме "AuditEventsReport", в которой нет
        // полей для ввода фильтров сортировки. Вместо полей ввода, список фильтров
        // хранятся в скрытом div-элементе. Необходимо преобразовать строку параметров
        // в поля объекта DataTables.NET (d)
        const text = document.getElementById('filterParams').textContent;
        const params = new URLSearchParams(text);
        for (const [key, value] of params.entries()) {
            d[key] = value;
        }
    }
}

/**
 * Возвращает функцию, которая собирает параметры фильтрации данных, при потребности
 * загрузки очередной отображаемой страницы с сервера
 */
function getServerSideAjax() {
    return (d) => {
        // Указываем, что загружаться должны не все данные запроса, а только часть (Page)
        d.Partial = 1;

        // Добавляем параметры фильтрации в запрос
        appendParamsToRequest(d);
    }
}

/**
 * Функция добавляет в http-запрос данные из полей, имеющих какое-либо значение
 */
function appendParamsToRequest(d) {

    // Тип события
    const _val = parseInt($('#selectEventTypeId').val(), 10);
    if (!isNaN(_val) && _val > 0) {
        d.FilterEventType = _val;
    }

    // Фильтрация по имени хранилища
    const _st = parseInt($('#selectStorageId').val(), 10);
    if (!isNaN(_st) && _st > 0) {
        d.FilterStorage = _st;
    }

    // Фильтрация по имени пользователя
    const _username = $('#userNameId').val();
    if (_username.length > 0) {
        d.UserName = _username;
    }

    // Фильтрация по номеру модуля
    const _moduleId = $('#moduleNumberId').val();
    if (_moduleId.length > 0) {
        d.FilterModuleId = _moduleId;
    }

    // Фильтрация по номеру сейфа. Номер сейфа сквозной
    const _safeId = $('#safeNumberId').val();
    if (_safeId.length > 0) {
        d.FilterSafeId = _safeId;
    }

    // Фильтрация по началу временного периода
    const _begin = $('#beginPeriodId').val();
    if (_begin.length > 0) {
        d.BeginPeriodDate = _begin;
    }

    const _beginTime = $('#beginPeriodTimeId').val();
    if (_beginTime.length > 0) {
        d.BeginPeriodTime = _beginTime;
    }

    // Фильтрация по завершению временного периода
    const _end = $('#endPeriodId').val();
    if (_end.length > 0) {
        d.EndPeriodDate = _end;
    }

    const _endTime = $('#endPeriodTimeId').val();
    if (_endTime.length > 0) {
        d.EndPeriodTime = _endTime;
    }
}

/**
 * Функция добавляет обработчики событий на странице, специфических для Server-Side режима
 */
function appendServerSideHandlers() {

    // Обработка нажатия кнопки "Выполнить фильтрацию"
    $('#ApplyFilter').on("click", function () {
        if (gAuditEventTable !== undefined && gAuditEventTable !== null) {
            gAuditEventTable.ajax.reload(function () {
                // После перезагрузки части таблицы, пересчитываем ширину колонок
                gAuditEventTable.columns.adjust().draw();
            });
        }
    });

    // Обработка нажатия кнопки "Сбросить фильтр"
    $('#ResetFilter').on("click", function () {

        $('#selectEventTypeId').prop('selectedIndex', 0);
        $('#selectStorageId').prop('selectedIndex', 0);
        $('#userNameId').val("");
        $('#moduleNumberId').val("");
        $('#safeNumberId').val("");
        $('#beginPeriodId').val("");
        $('#beginPeriodTimeId').val("");
        $('#endPeriodId').val("");
        $('#endPeriodTimeId').val("");

        $('#ApplyFilter').trigger("click");
    });

    $('#ShowReport').on("click", function () {

        // Включаем все указанные пользователем параметры фильтрации в запрос
        // на формирование отчёта
        let d = {};
        appendParamsToRequest(d);

        let link = "/AuditEventsReport?";
        for (const key in d) {
            link += `${key}=${d[key]}&`
        }

        window.open(link, "_blank");
    });

    // Добавляем элементы DatePicker для ускоренного ввода диапазона дат
    let _datepicker = $("#beginPeriodId").datepicker({
        changeMonth: true,
        changeYear: true,
        yearRange: "-110:+1"
    });
    _datepicker.datepicker("option", "showAnim", "slide");
    _datepicker.regional = getDatepickerSettings();
    _datepicker.datepicker("option", _datepicker.regional.ru);

    // Кастомизируем поле ввода даты завершения временного периода
    _datepicker = $("#endPeriodId").datepicker({
        changeMonth: true,
        changeYear: true,
        yearRange: "-110:+1"
    });
    _datepicker.datepicker("option", "showAnim", "slide");
    _datepicker.regional = getDatepickerSettings();
    _datepicker.datepicker("option", _datepicker.regional.ru);
}

/**
 * Функция настройки компонента DatePicker
 */
function getDatepickerSettings() {
    return {
        "ru": {
            closeText: "Закрыть",
            prevText: "&#x3C;Пред",
            nextText: "След&#x3E;",
            currentText: "Сегодня",
            monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
                "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
            monthNamesShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн",
                "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
            dayNames: ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
            dayNamesShort: ["вск", "пнд", "втр", "срд", "чтв", "птн", "сбт"],
            dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
            weekHeader: "Нед",
            dateFormat: "dd.mm.yy",
            firstDay: 1,
            isRTL: false,
            showMonthAfterYear: false,
            yearSuffix: ""
        }
    };
}

/**
 * Функция возвращает JSON-объект, который описывает алгоритм rendering-а content-а в таблице
 */
function GetAuditEventsColumnDefs() {
    return [{
        "targets": 0,
        "visible": true,
    }, {
        "targets": 1,   // Модифицируем тип события
        "render": function (data, type, row, meta) {
            if (type === 'display') {

                const _t = gAuditEventTypes.get(data);
                if (_t !== null && _t !== undefined) {
                    data = _t;
                }
            }
            return data;
        },
    }, {
        "targets": 4,
        "render": function (data, type, row, meta) {    // Модифицируем название объекта
            if (type === 'display') {

                let arr = data.split('.');
                if (arr.length > 0) {
                    const _t = gStorageIds.get(arr[0]);
                    if (_t !== null && _t !== undefined) {
                        arr[0] = _t;
                    }

                    data = arr.join('.');
                }
            }
            return data;
        },
    }];
}

/**
 * Функция заполняет вспомогательные справочники данными, извлекая их из HTML-верстки
 */
function initAuditEventMaps() {

    // Формируем справочник типов событий, используя данные элемента SELECT
    const eventTypes = document.getElementById('selectEventTypeId');
    for (let et of eventTypes) {
        gAuditEventTypes.set(et.value, et.text);
    }

    // Формируем справочник хранилищ, зарегистрированных в системе
    const storages = document.getElementById('selectStorageId');
    for (let st of storages) {
        gStorageIds.set(st.value, st.text);
    }
}

// Определяем функции, которые используются в Unit-тестах
window.getClientSideAjax = getClientSideAjax;

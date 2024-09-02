require('./auditEvents'); // Load the JavaScript file

// Функция проверяет, что некоторый объект является пустым
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

describe('getClientSideAjax', () => {
    let container;
   
    beforeEach(() => {
        // Set up a DOM element before each test
        container = document.createElement('div');
        container.id = 'filterParams';
        container.innerHTML = 'selectEventTypeId=7&userNameId=Petrov';
        document.body.appendChild(container);
    });

    afterEach(() => {
        // Clean up after each test
        document.body.removeChild(container);
    });

    test('should parse from a string to an object', () => {
        
        // Получаем функцию, которая формирует список параметров фильтрации
        // для DataTables.NET
        const fn = window.getClientSideAjax();

        let d = {};
        fn(d);

        // Проверяем, что ожидаемые параметры присутствуют в выборке
        expect(d.selectEventTypeId).toBe('7');
        expect(d.userNameId).toBe('Petrov');
    });
});

describe('appendParamsToRequest', () => {
   
    test('Extract entered values to an object', () => {

        // Инициализируем HTML-документ тестируемыми элементами верстки
        document.body.innerHTML = `
            <select id="selectEventTypeId">
                <option value="0">Любое событие</option>
                <option value="1">Авторизация</option>
                <option value="2" selected>Создание ХЦК</option>
            </select>
            <select id="selectStorageId">
                <option value="0">Любое ХЦК</option>
                <option value="1" selected>Московское</option>
                <option value="2">Санкт-Петербург</option>
            </select>
            <input type="text" id="moduleNumberId" value="7">
            <input type="text" id="safeNumberId" value="205">
            <input type="text" id="userNameId" value="Ivanov">
            <input type="text" id="beginPeriodId" value="28.6.2024">
            <input type="text" id="beginPeriodTimeId" value="18:05">
            <input type="text" id="endPeriodId" value="29.6.2024">
            <input type="text" id="endPeriodTimeId" value="9:00">`;
        
        // Получаем функцию, которая формирует список параметров фильтрации
        // для DataTables.NET
        let d = {};
        window.appendParamsToRequest(d);

        // Проверяем, что ожидаемые параметры присутствуют в выборке
        expect(d.FilterEventType).toBe(2);
        expect(d.FilterStorage).toBe(1);
        expect(d.UserName).toBe('Ivanov');
        expect(d.FilterModuleId).toBe('7');
        expect(d.FilterSafeId).toBe('205');
        expect(d.BeginPeriodDate).toBe('28.6.2024');
        expect(d.BeginPeriodTime).toBe('18:05');
        expect(d.EndPeriodDate).toBe('29.6.2024');
        expect(d.EndPeriodTime).toBe('9:00');
    });

    test('Check empty inputs', () => {

        // В данном тесте никакие из полей не установлены, т.е.
        // результирующий документ должен быть пустым
        document.body.innerHTML = `
            <select id="selectEventTypeId">
                <option value="0" selected>Любое событие</option>
                <option value="1">Авторизация</option>
                <option value="2">Создание ХЦК</option>
            </select>
            <select id="selectStorageId">
                <option value="0" selected>Любое ХЦК</option>
                <option value="1">Московское</option>
                <option value="2">Санкт-Петербург</option>
            </select>
            <input type="text" id="moduleNumberId">
            <input type="text" id="safeNumberId">
            <input type="text" id="userNameId">
            <input type="text" id="beginPeriodId">
            <input type="text" id="beginPeriodTimeId">
            <input type="text" id="endPeriodId">
            <input type="text" id="endPeriodTimeId">`;
        
        let d = {};
        window.appendParamsToRequest(d);

        // Проверяем, что ни одно из полей не было добавлено в выходной объект
        expect(isEmpty(d)).toBe(true);
    });
});

describe('initAuditEventMaps', () => {

    test('Check the extraction algorithm', () => {

        // В данном тесте выполняется проверка извлечения пар ключ/значение
        // из DOM-элементов select/option
        document.body.innerHTML = `
            <select id="selectEventTypeId">
                <option value="0" selected>Любое событие</option>
                <option value="1">Авторизация</option>
            </select>
            <select id="selectStorageId">
                <option value="0" selected>Любое ХЦК</option>
                <option value="1">Московское</option>
                <option value="2">Санкт-Петербург</option>
            </select>`;

        const tuple = window.initAuditEventMaps();

        expect(tuple[0].size).toBe(2);
        expect(tuple[0].get('0')).toBe("Любое событие");
        expect(tuple[0].get('1')).toBe("Авторизация");

        expect(tuple[1].size).toBe(3);
        expect(tuple[1].get('0')).toBe("Любое ХЦК");
        expect(tuple[1].get('1')).toBe("Московское");
        expect(tuple[1].get('2')).toBe("Санкт-Петербург");
    });
});

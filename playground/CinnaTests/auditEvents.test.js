require('./auditEvents'); // Load the JavaScript file

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
    let container;
   
    beforeEach(() => {
        // Initialize the document with your HTML
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
    });

    test('Extract entered values to an object', () => {
        
        // Получаем функцию, которая формирует список параметров фильтрации
        // для DataTables.NET
        let d = {};
        window.appendParamsToRequest(d);

        // Проверяем, что ожидаемые параметры присутствуют в выборке
        expect(d.UserName).toBe('Ivanov');
        expect(d.FilterModuleId).toBe('7');
    });
});

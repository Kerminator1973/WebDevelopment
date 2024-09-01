require('./auditEvents'); // Load the JavaScript file

describe('parseHttpParams', () => {
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
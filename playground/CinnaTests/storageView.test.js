require('./storageView'); // Load the JavaScript file

test('greet function', () => {
    expect(window.greet('World')).toBe('Hello, World!');
});

test('add function', () => {
    expect(window.add(2, 3)).toBe(5);
});

describe('addElement', () => {
    let container;

    beforeEach(() => {
        // Set up a DOM element before each test
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
    });

    afterEach(() => {
        // Clean up after each test
        document.body.removeChild(container);
    });

    test('should add a new div to the container', () => {
        window.addElement('test-container', 'Hello, World!');

        // Check if the new div was added
        const newDiv = container.querySelector('div');
        expect(newDiv).not.toBeNull();
        expect(newDiv.textContent).toBe('Hello, World!');
    });

    test('should not add a div if the container does not exist', () => {
        window.addElement('non-existent-container', 'This should not be added');

        // Check that no new divs were added
        const divs = container.querySelectorAll('div');
        expect(divs.length).toBe(0);
    });
});
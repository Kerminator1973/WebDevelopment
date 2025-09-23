const readline = require('readline');

// При пользовательском вводе в потоке ввода, 
// будет генерироваться событие keypress
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

// Определяем обработчик события 'keypress'
process.stdin.on('keypress', (str, key) => {
	
	// Если пользователь нажал Ctrl+C завершаем текущий процесс
    if (key.ctrl && key.name === 'c') {
        console.log('Exiting...');
        process.exit();
    }
    
    if (key.name === 'a') {
        console.log('A pressed! Do Something...');
    }
	
	// Здесь можно обрабатывать что-угодно
});

// Определяем функцию, которая будет выполнять некоторое действие
// и перезапускать через секунду
function run() {
	
	// Выводим текущую дату одним числом
	console.log('Running function...', Date.now());
	
	setTimeout(run, 1000);
}

console.log('Кнопки: "a" - что-то вывести на экран. Ctrl+C to завершить работу');

// Запускаем основной цикл, который выполняет функцию каждую секунду
run();
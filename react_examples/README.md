# Мои упражнения в React

Приведённые в репозитарии примеры были разработаны в рамках курса "The Advanced Web Developer Bootcamp by Colt Steele" на https://www.udemy.com/

Оригинальные примеры доступны по ссылке: https://github.com/rithmschool/udemy_course_exercises/tree/master/react

Установка React: `npm install -g create-react-app`

Создание шаблонного проекта: `create-react-app helloworld`

Загрузка всех packages проекта: `npm install`

Запуск проекта: `npm start`

Компиляция проекта в статический файлы для production: `npm run build`

# Ключевые уроки вынесенные из курса

Компонентная модель, реализованная в React и Angular, позволяет компактно хранить логически связанные разметку, css и код. Это фундаментально отличает приложения React и Angular от jQuery, в котором код логически не связанных блоков, размещается в одном файле. Следствием компонентной модели является значительно более чистый код, более высокая надёжность приложения и простота сопровождения.

Также сильной стороной React является VirtualDOM. Общепризнанный факт - JavaScript может быть весьма производительным, и именно DOM - фактор, который наиболее негативно влияет на производительность web-приложений. Применение VirtualDOM позволяет устранить это "узкое горлышко", в том числе, за счёт кэширования и Reconciliation (англ. - сверка, согласование).

JSX также считается сильной стороной React, хотя мой личное мнение - сильно похоже на альтернативные решения, например, на razor-синтаксис ASP.NET.

Вычисление свойств обеспечивает более высокую надёжность, чем их хранение в состоянии. Tim - отвечающий за React-раздел курса, очень чётко обозначил это в своих лекциях. В промышленных приложениях активно используются функции filter(), map(), find() и includes(). Здесь же: использование чистых функций (pure functions) предоставляет отличную возможность обеспечить высокую надёжность кода и его тестируемость.

Применение транспайлеров (в частности, Babel) позволяет использовать актуальные версии ECMAScript, включая замечательный синтаксический сахар, даже в старых браузерах.

## JSX

Если рассматривать работу React без JSX, то оказывается, что принцип работы библиотеки достаточно прост - описывается иерархия компонентов React, создаваемых посредством функции react.createElement(). Однако, получаемый код весьма тяжело читается:

```js
import react from 'react';
import ReactDOM from 'react-dom';

const h = react.createElement;	// Добавляем alias, чтобы уменьшить количество кода

class Hello extends react.Component {
	render() {
		return h('h1', null, [			// Добавляем элемент в VirtualDOM
			'Hello ',
			this.props.name || 'World'	// Значение по умолчанию - 'World'
		]);
	}
}

ReactDOM.render(
	h(Hello, {name: 'React'}),					// Создаём компонент Hello
	document.getElementByTagName('body')[0]		// и размещаем его внутри элемента body
);
```

Даже учитывая, что мы заменили react.createElement() на h(), кода всё равно получалось бы очень много. Именно по этой причине разработчики React придумали и реализовали JSX - супер-множество JavaScript, которое делает JavaScript-код похожим на HTML:

```js
import react from 'react';
import ReactDOM from 'react-dom';

class Hello extends react.Component {
	render() {
		return <h1>Hello {this.props.name || 'World'}</h1>
	}
}

ReactDOM.render(
	<Hello name="React"/>,
	document.getElementByTagName('body')[0]
);
```

Рекомендуется ознакомиться с официальной документацией по [JSX](https://react.dev/learn/writing-markup-with-jsx#).

# Ключевые навыки, без которых невозможно разрабатывать React-приложения

Arrow functions и destructuring:
https://medium.com/better-programming/use-these-javascript-features-to-make-your-code-more-readable-ec3930827226

Destructuring (ещё статья: http://exploringjs.com/es6/ch_destructuring.html):
```javascript
const animal = {
	type: {
		mammal: {
			bear: {
				age: 12
			},
			deer: {
				age: 4
			}
		}
	}
}

const {bear, deer} = animal.type.mammal
console.log(bear)	// {age: 12}
console.log(deer)	// {age: 4}
```

Rest operator также известный, как Spread syntax (https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Operators/Spread_syntax). Часто используется в React при вызове this.setState({}) для того, чтобы заменить какое-то конкретное значение в dictionary/словаре, например:

```javascript
const values = {a: 5, b: 7, c: 19};
this.setState({...values, b: 8});	// Результат: {a: 5, b: 8, c: 19}
```

this - основа основ JavaScript.

Promises, Props, DefaultProps, props.children, Refs, PropTypes (https://ru.reactjs.org/docs/typechecking-with-proptypes.html).

Отличие функциональных компонентов (functional components, stateless) от компонентов-классов (class components, stateful).

# Наиболее важная концепция React

Несомненно - это State. Важно знать, что изменение состояния (и перерисовка) осуществляются исключительно посредством setState({...}). В каждом вызове setState() должны быть указаны все атрибуты состояния.

# Рекомендуемые инструментальные средства

В Chrome Web Store доступен специализированный Plug-in «React Developer Tools», разработанный Facebook.

При активации plug-in, в Developer Console (F12) появляется дополнительная закладка «React», в которой можно видеть всю иерархию React-компонентов в динамике, включая Props и State.

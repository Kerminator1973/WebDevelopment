import React, { Component } from 'react';
import './App.css';
import Card from './Card';

const CardState = {
	HIDING: 0,
	SHOWING: 1,
	MATCHING: 2
};

class App extends Component {

  	constructor(props) {
    	super(props);

		// Определяем шестнадцать карт
		let cards = [
			{id: 0, cardState: CardState.HIDING, backgroundColor: "Yellow"},
			{id: 1, cardState: CardState.HIDING, backgroundColor: "Yellow"},
			{id: 2, cardState: CardState.HIDING, backgroundColor: "Lime"},
			{id: 3, cardState: CardState.HIDING, backgroundColor: "Lime"},
			{id: 4, cardState: CardState.HIDING, backgroundColor: "Fuchsia"},
			{id: 5, cardState: CardState.HIDING, backgroundColor: "Fuchsia"},
			{id: 6, cardState: CardState.HIDING, backgroundColor: "Indigo"},
			{id: 7, cardState: CardState.HIDING, backgroundColor: "Indigo"},
			{id: 8, cardState: CardState.HIDING, backgroundColor: "MediumSeaGreen"},
			{id: 9, cardState: CardState.HIDING, backgroundColor: "MediumSeaGreen"},
			{id: 10, cardState: CardState.HIDING, backgroundColor: "RoyalBlue"},
			{id: 11, cardState: CardState.HIDING, backgroundColor: "RoyalBlue"},
			{id: 12, cardState: CardState.HIDING, backgroundColor: "Beige"},
			{id: 13, cardState: CardState.HIDING, backgroundColor: "Beige"},
			{id: 14, cardState: CardState.HIDING, backgroundColor: "Tomato"},
			{id: 15, cardState: CardState.HIDING, backgroundColor: "Tomato"}
		];
		this.state = {cards: this.shuffle(cards), noClick: false};

		// Определяем обработчики событий от дочерних элементов
		this.handleClick = this.handleClick.bind(this);
		this.handleNewGame = this.handleNewGame.bind(this);
  	}

	// Метод инициализации новой игры
	handleNewGame() {

		// Изначально все карты перевёрнуты
		let cards = this.cards.map(c => ({
			...c,
			cardState: CardState.HIDING
		}));

		// Перемешиваем карты
		cards = this.shuffle(cards);

		// Устанавливаем состояние проинициализированным массивом карт
		this.setState({cards});
	}

	// Обработка нажатия на карту
	handleClick(id)
	{
		// Определяем функцию которая будет изменять состояние у
		// указанных карт, используя их идентификатор
		const mapCardState = (cards, idsToChange, newCardState) => {
			return cards.map(c => {
				if(idsToChange.includes(c.id)) {
					return {
						...c,
						cardState: newCardState
					};
				}
				return c;
			});
		}

		// Если карта уже открыта, то не делаем ничего
		const foundCard = this.state.cards.find(c => c.id === id);
		if (this.state.noClick || foundCard.cardState !== CardState.HIDING)
			return;

		let noClick = false;

		// Получаем полный набор карт, в котором у элемента с указанным id
		// устанавливается тип SHOWING
		let cards = mapCardState(this.state.cards, [id], CardState.SHOWING);

		// Посредством фильтра выделяем карты, находящиеся в состоянии SHOWING
		const showingCards = cards.filter((c) => c.cardState === CardState.SHOWING);

		// Используя массив отобранных карт с состоянием SHOWING, формируем новый 
		// массив, в котором будут хранится только идентификаторы этих карт
		const ids = showingCards.map(c => c.id);

		if (showingCards.length === 2 &&
			showingCards[0].backgroundColor === showingCards[1].backgroundColor) {

			// Если отобрано две карты и их цвета совпадают, то изменяем
			// их состояния на MATCHING
			cards = mapCardState(cards, ids, CardState.MATCHING);

		} else if (showingCards.length === 2) {

			// Если карт две, но цвета у них разные, то блокируем возможность
			// переворачивания карт и через 1,3 секунды вернём их состояние в 
			// прежнее (серым цветом/рубашкой вверх)
			let hidingCards = mapCardState(cards, ids, CardState.HIDING);

			noClick = true;

			// Выполняем rendering и после того, как он успешно закончится,
			// устанавливаем timeout для возврата не совпавших карт "рубашками" вверх
			this.setState({cards, noClick}, () => {
				setTimeout(() => {
					this.setState({cards: hidingCards, noClick: false});
				}, 1300);
			});

			return;
		}

		this.setState({cards, noClick});

/*		
		// Код, осуществляющий переворот карт при нажатии кнопки
		this.setState(prevState => {
			let cards = prevState.cards.map(c => (
				c.id === id ? {
					...c,
					cardState: c.cardState === CardState.HIDING ? CardState.MATCHING :
						CardState.HIDING
				} : c
			));
			return {cards};
		});
*/
	}

	// Метод перемешивает в произвольном порядке  массив из шестнадцати карт
	shuffle(cards)
	{
		// Выполняем 100 итераций обмена двух цветов местами
		for(let i = 0; i < 100; i++) {
			const index1 = Math.floor(Math.random() * cards.length);
			const index2 = Math.floor(Math.random() * cards.length);
			if(index1 !== index2) {
				let temp = cards[index1];
				cards[index1] = cards[index2];
				cards[index2] = temp;
			}
		}

		return cards;
	}
  
  	render() {

	    return (
		    <div className="App">
		    {this.state.cards.map((card) => {
				return (<Card key={card.id} 
					showing={card.cardState !== CardState.HIDING} 
					backgroundColor={card.backgroundColor}
					onClick={() => this.handleClick(card.id)}>
					</Card>
					)
			})}
		    </div>
	    );
  	}
}

export default App;

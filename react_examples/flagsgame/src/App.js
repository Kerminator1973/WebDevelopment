import React, { Component } from 'react';
import './App.css';


class App extends Component {

  constructor(props) {
    super(props);
		this.state = {
      countries: [],
      selected: []
    };
  }

  componentDidMount()
  {
    const allCountries = "https://restcountries.eu/rest/v2/all";

    fetch(allCountries)
      .then(data => data.json())
	    .then(data => data.map(d => {
        // Из всех полученных данных нас интересует только
        // название страны и её флаг
        return {name: d.name, flag: d.flag}}))
      .then(countries => {

        // Формируем четыре варианта выбора
        console.log("Countries count: " + countries.length);
        if(countries.length >= 4) {

          const selected = this.chooseCountries(countries, 4);
          this.setState({countries: countries, selected: selected})
        }
        else
        {
          this.setState({countries: [], selected: []})
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  chooseCountries(countries, count) {

    var result = [];
    for(var i = 0; i < count; i++) {

      // Генерируем случайно значение и обеспечиваем его уникальность
      // в результатах вывода на экран
      let randIndex = 0;
      for(let n = 0; n < 10; n++)
      {
        randIndex = Math.floor(Math.random() * countries.length);

        if(!result.includes(randIndex))
          break;
      }
      
      result.push(randIndex);
    }

    return result;
  }

  render() {

    return (
      <div className="App">
      <ul>
      {this.state.selected.map((selIndex, i) => {
        return (<li key={i}>{
          this.state.countries[selIndex].name
        }</li>)})
      }
      </ul>
      </div>
    );
  }
}

export default App;

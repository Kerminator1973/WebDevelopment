import React, { Component } from 'react';
import './App.css';
import Box from './Box';

class App extends Component {

  	constructor(props) {
    	super(props);

    	// Создаём 22 прямоугольника, которые будут размещены на экране
    	this.state = {
    		boxes: this.fillcolors(22)
    	}

		this.intervalId = setInterval(() => {
			const boxes = this.state.boxes.slice();
			const randIndex = Math.floor(Math.random() * this.state.boxes.length);
			boxes[randIndex] = this.generate_rnd_color();
			this.setState({boxes});
		}, 300);
  	}

	componentWillUnmount() {
		// Перед тем, как компонент будет удалён, аккуратно завершаем
		// setInterval(). В конкретном приложении это не важно, но принципиально
		// это следует делать
		clearInterval(this.intervalId);
	}

	fillcolors(n) {
        var arr = Array.apply(null, Array(n));
        return arr.map(function (x, i) { return this.generate_rnd_color() }, this);
    }

    generate_rnd_color() {
    	return '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1,6);
    }
  
  	render() {

	    return (
		      <div className="App">
		      {this.state.boxes.map((value, index) => {
		      		return <Box key={index} bkcolor={value} btext={value}></Box>
		      })}
		      </div>
	    );
  	}
}

App.defaultProps = {
  allColors: ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond",
              "Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate",
              "Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod",
              "DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange",
              "DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey",
              "DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue",
              "FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod",
              "Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki",
              "Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan",
              "LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon",
              "LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow",
              "Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid",
              "MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise",
              "MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy",
              "OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen",
              "PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue",
              "Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen",
              "SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen",
              "SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke",
              "Yellow","YellowGreen"]
};

export default App;

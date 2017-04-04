import Exponent from 'exponent';
import React from 'react';
import {
  Dimensions,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import kenken from './kenken';

const SIZE = 6;

class Cell extends React.Component {
  constructor(props) {
    super(props);

    this.handleChangeText = this.handleChangeText.bind(this);
    this.state = { text: '' };
  }

  cageBorder(delta) {
    return (
      this.props.cageForIndex[this.props.index] !==
      this.props.cageForIndex[this.props.index + delta]);
  }

  handleChangeText(newText) {
    Keyboard.dismiss();
    let text = newText.replace(/[7890]/g, '')
    this.props.report(text);
    this.setState({text: text});
  }

  render() {
    // Figure out if this cell should display the description
    let descriptionText = this.props.descriptions[this.props.index];
    let description = (descriptionText !== null) && (
      <Text style={styles.description}>
        {descriptionText}
      </Text>
    );

    // Figure out the borders
    let custom = {};
    let border = '#000';
    if (this.props.index < SIZE || this.cageBorder(-SIZE)) {
      custom.borderTopColor = border;
    }
    if (this.props.index >= SIZE * SIZE - SIZE || this.cageBorder(SIZE)) {
      custom.borderBottomColor = border;
    }
    if (this.props.index % SIZE === 0 || this.cageBorder(-1)) {
      custom.borderLeftColor = border;
    }
    if (this.props.index % SIZE === SIZE - 1 || this.cageBorder(1)) {
      custom.borderRightColor = border;
    }

    return (
      <View style={[styles.cell, custom]}>
        <View style={{flex: 1}}>
          {description}
        </View>
        <View style={{flex: 2}}>
          <TextInput
            style={{flex: 1, fontSize: 32, textAlign: 'center'}}
            keyboardType='number-pad'
            maxLength={4}
            onChangeText={this.handleChangeText}
            value={this.state.text}
            />
        </View>
        <View style={{flex: 1}} />
      </View>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {playing: true};
    this.newGame = this.newGame.bind(this);
  }

  newGame() {
    this.setState({playing: false});
    setTimeout(() => {
      this.setState({playing: true});
    }, 3000);
  }

  render() {
    if (!this.state.playing) {
      return (
        <View style={styles.container}>
          <Text style={{textAlign: 'center', fontSize: 200}}>
            😍
          </Text>
        </View>
      );
    }
    return <Game number={this.state.number} newGame={this.newGame}/>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);

    let k = kenken(SIZE);
    this.puzzle = k.puzzle;
    this.solution = k.solution;
    this.answer = Array(SIZE * SIZE).fill(null);
  }

  report(index, value) {
    this.answer[index] = value;
    console.log('sol:', this.solution);
    console.log('ans:', this.answer);
    if (this.solution.join(',') === this.answer.join(',')) {
      console.log('new game');
      this.props.newGame();
    }
  }

  renderRow(i) {
    let cells = [];
    for (let j = 0; j < SIZE; j++) {
      let index = SIZE * i + j;
      cells.push(
        <Cell
          key={'cell' + index}
          index={index}
          cageForIndex={this.puzzle.cageForIndex}
          descriptions={this.puzzle.descriptions}
          report={t => this.report(index, t)}
          />
      );
    }
    return (
      <View style={styles.row} key={'row' + i}>
        {cells}
      </View>
    );
  }

  render() {
    let {height, width} = Dimensions.get('window');
    let dim = Math.min(height, width);
    while (dim % 6 !== 2) {
      dim--;
    }

    let rows = [];
    for (let i = 0; i < SIZE; i++) {
      rows.push(this.renderRow(i));
    }
    return (
      <View style={styles.container}>
        <View style={{flex: 1}} />
        <View style={[styles.board, {height: dim, width: dim}]}>
          {rows}
        </View>
        <View style={{flex: 1}} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    backgroundColor: '#fff',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: '#000',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#fafafa',
  },
  description: {
    marginLeft: 2,
  },
});

Exponent.registerRootComponent(App);

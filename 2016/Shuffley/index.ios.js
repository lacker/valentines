'use strict';
import React, {
  Animated,
  AppRegistry,
  Component,
  PanResponder,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Dimensions from 'Dimensions';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';


// The main Redux reducer for this application
function reduce(state = {}, action) {
  if (action.type == 'ACTIVATE') {
    return {
      ...state,
      activeIndex: action.index
    };
  }

  if (action.type == 'SET_WORD') {
    let word = action.word;
    let colors = randomSubset(TILE_COLORS, word.length);
    let tiles = [];
    for (let i = 0; i < word.length; ++i) {
      tiles.push({letter: word[i], color: colors[i]});
    }
    let location = randomShuffle(range(word.length));
    return {
      ...state,
      word,
      tiles,
      activeIndex: 0,
      location,
      keyboard: false,
    };
  }

  if (action.type == 'SET_LOCATION') {
    return {
      ...state,
      location: action.location
    };
  }

  if (action.type == 'OPEN_KEYBOARD') {
    return {
      ...state,
      keyboard: true,
    }
  }

  return state;
}

let store = createStore(reduce);

function bigDimension() {
  let width = Dimensions.get('window').width;
  let height = Dimensions.get('window').height;
  return width < height ? height : width;
}

function smallDimension() {
  let width = Dimensions.get('window').width;
  let height = Dimensions.get('window').height;
  return width > height ? height : width;
}

const TILE_BORDER_WIDTH = 1;
const TILE_MARGIN = 1;

class Tile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pan: new Animated.ValueXY(),
      tempTop: null,
      tempLeft: null,
    };

    let panStart = {};

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e) => {
        this.props.activate();
        panStart.top = this.props.top;
        panStart.left = this.props.left;
        return true;
      },
      onPanResponderMove: (e, gesture) => {
        this.state.pan.setValue({
          x: gesture.dx + panStart.left,
          y: gesture.dy + panStart.top,
        });

        let accountedDelta = this.props.left - panStart.left;
        let newDelta = gesture.dx - accountedDelta;
        if (newDelta < -0.5 * this.props.size) {
          this.props.shift(-1);
        } else if (newDelta > 0.5 * this.props.size) {
          this.props.shift(1);
        }
      },
      onPanResponderRelease: (e, gesture) => {
        Animated.spring(
          this.state.pan,
          {toValue: {x: this.props.left, y: this.props.top}}
        ).start();
      },
    });
  }

  componentWillMount() {
    this.state.pan.setValue({x: this.props.left, y: this.props.top});
  }

  componentWillReceiveProps(newProps) {
    if (this.props.left != newProps.left &&
        this.state.pan.x != newProps.left) {
      Animated.spring(
        this.state.pan,
        {toValue: {x: newProps.left, y: newProps.top}}
      ).start();
    }
  }

  render() {
    return (
      <Animated.View
        {...this.panResponder.panHandlers}
        style={this.state.pan.getLayout()}>
        <View style={[styles.tile, {
            height: this.props.size,
            width: this.props.size,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: this.props.backgroundColor,
          }]}>
          <Text style={[styles.tileText, {
              width: this.props.size - 2 * TILE_BORDER_WIDTH,
              fontSize: this.props.size / 2,
            }]}>
            {this.props.letter}
          </Text>
        </View>
      </Animated.View>
    );
  }
}
Tile = connect(state => state)(Tile);


const TILE_COLORS = ['#FFABAB',
                     '#FFDAAB',
                     '#FFFDD8',
                     '#DDFFAB',
                     '#B8F2D0',
                     '#ABE4FF',
                     '#D9ABFF']

function range(n) {
  let answer = [];
  for (let i = 0; i < n; i++) {
    answer.push(i);
  }
  return answer;
}

// Removes one thing from the list at random.
function randomDrop(list) {
  let out = [];
  let drop = Math.floor(Math.random() * list.length);
  for (let i = 0; i < list.length; i++) {
    if (drop != i) {
      out.push(list[i]);
    }
  }
  return out;
}

// Selects a subset of size number from the list.
function randomSubset(list, number) {
  let answer = list;
  while (answer.length > number) {
    answer = randomDrop(answer);
  }
  return answer;
}

function randomShuffle(inputList) {
  let list = Array.from(inputList);
  for (let i = list.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
  }

  return list;
}

const WORDS = [
  'JUPITER', 'MARS', 'MOON', 'EARTH', 'SATURN',
  'MERCURY', 'VENUS', 'NEPTUNE', 'URANUS', 'SUN'];

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

class KeyboardView extends Component {
  render() {
    return <TextInput/>;
  }
}

// A "controller-view" since most game controller logic is in here.
class Game extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.setWord(randomWord());

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e) => {
        console.log('starting pan');
        return true;
      },
      onPanResponderRelease: (e, gesture) => {
        console.log('pan dy = ' + gesture.dy);

        if (gesture.dy > 100) {
          // Swipe down means next word
          this.killWord();
        } else if (gesture.dy < -100) {
          // Swipe up means open keyboard
          this.openKeyboard();
        }
      },
    });
  }

  openKeyboard() {
    this.props.dispatch({
      type: 'OPEN_KEYBOARD',
    });
  }

  setWord(word) {
    this.props.dispatch({
      type: 'SET_WORD',
      word
    })
  }

  // Drops the current word, if possible
  killWord() {
    if (WORDS.length < 2) {
      return;
    }
    let index = WORDS.indexOf(this.props.word);
    WORDS.splice(index, 1);
    this.setWord(randomWord());
  }

  // Adds a new word to the list and also makes it active.
  // If this word is already in this list, just make it active.
  addWord(word) {
    let index = WORDS.indexOf(word);
    if (index < 0) {
      WORDS.push(word);
    }
    this.setWord(word);
  }

  // Picks another word from our list.
  nextWord() {
    let word;
    while (true) {
      word = WORDS[Math.floor(Math.random() * WORDS.length)];
      if (word != this.props.word || WORDS.length < 2) {
        break;
      }
    }
    this.setWord(word);
  }

  activate(activeIndex) {
    this.props.dispatch({
      type: 'ACTIVATE',
      activeIndex
    });
  }

  // Shifts the active tile by a delta. 1 = right, -1 = left;
  shift(delta) {
    let activeLocation = this.props.location[this.props.activeIndex];
    let newActiveLocation = activeLocation + delta;

    if (newActiveLocation < 0 ||
        newActiveLocation >= this.props.word.length) {
      // This isn't a valid shift
      return;
    }

    let newLocation = this.props.location.map((loc) => {
      if (loc == activeLocation) {
        return newActiveLocation;
      }
      if (loc == newActiveLocation) {
        return activeLocation;
      }
      return loc;
    });

    this.props.dispatch({
      type: 'SET_LOCATION',
      location: newLocation,
    });

    // Check to see if the word is correct
    let display = '';
    for (let index of this.props.location) {
      display += this.props.word[index];
    }
    if (display == this.props.word) {
      // We solved the puzzle
      this.nextWord();
    }
  }

  render() {
    if (this.props.keyboard) {
      return <KeyboardView />;
    }

    if (!this.props.word) {
      return null;
    }

    let size = Math.floor(bigDimension() / this.props.word.length) - 2 * (
      TILE_BORDER_WIDTH + TILE_MARGIN);
    let parts = [];
    for (let i = 0; i < this.props.tiles.length; i++) {
      let tile = this.props.tiles[i];
      let top = (smallDimension() - size) / 2;
      let left = bigDimension() * (this.props.location[i] /
        this.props.word.length);
      let component = (
        <Tile letter={tile.letter}
          key={i}
          backgroundColor={tile.color}
          top={top}
          left={left}
          activate={() => {this.activate(i)}}
          shift={(delta) => {this.shift(delta)}}
          size={size}/>
      );
      if (i == this.props.activeIndex) {
        parts.push(component);
      } else {
        parts.unshift(component);
      }
    }
    return (
      <View style={styles.container}
        {...this.panResponder.panHandlers}>
        {parts}
      </View>
    );
  }
}
Game = connect(state => state)(Game);

class Shuffley extends Component {
  render() {
    return (
      <Provider store={store}>
        <Game />
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tileText: {
    textAlign: 'center',
  },
  tile: {
    position: 'absolute',
    margin: TILE_MARGIN,
    borderWidth: TILE_BORDER_WIDTH,
    borderColor: '#000000',
  }
});

AppRegistry.registerComponent('Shuffley', () => Shuffley);

'use strict';
import {
  Component,
  PanResponder,
  StyleSheet
} from 'react-native';
import { connect } from 'react-redux';
import Dimensions from 'Dimensions';
import 'KeyboardView';
import 'Tile';

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



const WORDS = [
  'JUPITER', 'MARS', 'MOON', 'EARTH', 'SATURN',
  'MERCURY', 'VENUS', 'NEPTUNE', 'URANUS', 'SUN'];

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

// A "controller-view" since most game controller logic is in here.
export default class Game extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.setWord(randomWord());

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e) => {
        console.log('starting Game pan');
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

  // Tries ticks up one each time and at some threshold we actually continue
  checkForSuccess(tries) {
    if (!tries) {
      tries = 0;
    }
    console.log('checkForSuccess', tries);
    // Check to see if the word is correct
    let display = '';
    for (let index of this.props.location) {
      display += this.props.word[index];
    }
    if (display == this.props.word) {
      if (tries >= 20) {
        this.nextWord();
      } else {
        setTimeout(() => this.checkForSuccess(tries + 1), 50);
      }
    }
  }

  // Picks another word from our list.
  nextWord() {
    console.log('nextWord');
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
          checkForSuccess={() => {this.checkForSuccess()}}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

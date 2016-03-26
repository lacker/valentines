'use strict';
import React, {
  AppRegistry,
  Component
} from 'react-native';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import Game from './Game';

// TODO: start off rotated. Blocked on a bug at:
// https://github.com/facebook/react-native/issues/6647

const WORDS = [
  'JUPITER', 'MARS', 'MOON', 'EARTH', 'SATURN',
  'MERCURY', 'VENUS', 'NEPTUNE', 'URANUS', 'SUN'];

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
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

// When it's long enough, never shuffles so that the output equals the input.
function randomShuffle(inputList) {
  if (inputList.length < 2) {
    return inputList;
  }
  let list = Array.from(inputList);
  for (let i = list.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
  }

  if (list.toString() == inputList.toString()) {
    // Try again
    return randomShuffle(inputList);
  }
  return list;
}

const TILE_COLORS = ['#FFABAB',
                     '#FFDAAB',
                     '#FFFDD8',
                     '#DDFFAB',
                     '#B8F2D0',
                     '#ABE4FF',
                     '#D9ABFF'];

function range(n) {
  let answer = [];
  for (let i = 0; i < n; i++) {
    answer.push(i);
  }
  return answer;
}

// Reducer-helper. Returns a new state.
function setWord(state, word) {
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
    smiley: false
  };
}

// The main Redux reducer for this application
function reduce(state = {}, action) {
  console.log(state, action);

  if (action.type == 'SMILE') {
    return {
      ...state,
      smiley: true
    }
  }

  if (action.type == 'UNSMILE') {
    return {
      ...state,
      smiley: false
    }
  }

  if (action.type == 'ACTIVATE') {
    return {
      ...state,
      activeIndex: action.activeIndex
    };
  }

  if (action.type == 'SET_WORD') {
    return setWord(state, action.word);
  }

  // Drops the current word, if possible
  if (action.type == 'KILL_WORD') {
    if (WORDS.length < 2) {
      return state;
    }
    let index = WORDS.indexOf(state.word);
    WORDS.splice(index, 1);
    return setWord(state, randomWord());
  }

  if (action.type == 'ADD_WORD') {
    let word = action.word;
    if (word.length < 3) {
      return state;
    }
    let index = WORDS.indexOf(word);
    if (index < 0) {
      WORDS.push(word);
    }
    return setWord(state, word);
  }

  if (action.type == 'NEXT_WORD') {
    // Picks another word from our list.
    let word;
    while (true) {
      word = WORDS[Math.floor(Math.random() * WORDS.length)];
      if (word != state.word || WORDS.length < 2) {
        break;
      }
    }
    return setWord(state, word);
  }

  if (action.type == 'SET_LOCATION') {
    return {
      ...state,
      location: action.location
    };
  }

  if (action.type == 'OPEN_KEYBOARD') {
    console.log('opening keyboard');
    return {
      ...state,
      keyboard: true,
    }
  }

  return state;
}

let store = createStore(reduce);
store.dispatch({
  type: 'NEXT_WORD'
});

class Shuffley extends Component {
  render() {
    return (
      <Provider store={store}>
        <Game />
      </Provider>
    );
  }
}

AppRegistry.registerComponent('Shuffley', () => Shuffley);

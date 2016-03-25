'use strict';
import {
  AppRegistry
} from 'react-native';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import 'Game';

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

// The main Redux reducer for this application
function reduce(state = {}, action) {
  if (action.type == 'ACTIVATE') {
    return {
      ...state,
      activeIndex: action.activeIndex
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
    console.log('opening keyboard');
    return {
      ...state,
      keyboard: true,
    }
  }

  return state;
}

let store = createStore(reduce);

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

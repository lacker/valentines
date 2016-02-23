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
  render() {
    return (
      <View style={[styles.tile, {
        height: this.props.size,
        width: this.props.size,
        top: (smallDimension() - this.props.size) / 2,
        left: bigDimension() * (this.props.index / this.props.numLetters),
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
    );
  }
}

const tileColors = ['#FFABAB',
                    '#FFDAAB',
                    '#FFFDD8',
                    '#DDFFAB',
                    '#B8F2D0',
                    '#ABE4FF',
                    '#D9ABFF']

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

class Shuffley extends Component {
  render() {
    let words = ['JUPITER', 'MARS', 'MOON', 'EARTH', 'SATURN',
                 'MERCURY', 'VENUS', 'NEPTUNE'];
    let word = words[Math.floor(Math.random() * words.length)];

    let size = Math.floor(bigDimension() / word.length) - 2 * (
      TILE_BORDER_WIDTH + TILE_MARGIN);
    let parts = [];
    let key = 0;
    let colors = randomSubset(tileColors, word.length);
    for (let i = 0; i < word.length; ++i) {
      let letter = word[i];
      parts.push(<Tile
                 letter={letter}
                 key={key}
                 backgroundColor={colors[i]}
                 index={i}
                 numLetters={word.length}
                 size={size}/>);
      key++;
    }
    return (
      <View style={styles.container}>
        {parts}
      </View>
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

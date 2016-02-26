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
  constructor(props) {
    super(props);

    this.state = {
      pan: new Animated.ValueXY(),
    };

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => {
        this.props.activate();
        return true;
      },
      onPanResponderMove: Animated.event([null, {
        dx: this.state.pan.x,
        dy: this.state.pan.y,
      }]),
      onPanResponderRelease: (e, gesture) => {
        console.log('onPanResponderRelease');
      },
    });
  }

  render() {
    return (
      <Animated.View
          {...this.panResponder.panHandlers}
          style={this.state.pan.getLayout()}>
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
      </Animated.View>
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
  constructor(props) {
    super(props);

    let words = ['JUPITER', 'MARS', 'MOON', 'EARTH', 'SATURN',
                 'MERCURY', 'VENUS', 'NEPTUNE'];
    let word = words[Math.floor(Math.random() * words.length)];

    let colors = randomSubset(tileColors, word.length);

    let tiles = [];
    for (let i = 0; i < word.length; ++i) {
      tiles.push({letter: word[i], color: colors[i], index: i});
    }

    this.state = {word, tiles, activeIndex: 0};
  }

  activate(index) {
    this.setState({activeIndex: index});
  }

  render() {
    let size = Math.floor(bigDimension() / this.state.word.length) - 2 * (
      TILE_BORDER_WIDTH + TILE_MARGIN);
    let parts = [];
    let key = 0;
    for (let tile of this.state.tiles) {
      let component = (
          <Tile letter={tile.letter}
                key={tile.index}
                backgroundColor={tile.color}
                index={tile.index}
                numLetters={this.state.word.length}
                activate={() => {this.activate(tile.index)}}
                size={size}/>
      );
      if (tile.index == this.state.activeIndex) {
        parts.push(component);
      } else {
        parts.unshift(component);
      }
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

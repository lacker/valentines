'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View
} from 'react-native';

import Dimensions from 'Dimensions';

class Tile extends Component {
  render() {
    return (
      <View style={[styles.tile, {
        height: this.props.size,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: this.props.backgroundColor,
      }]}>
        <Text style={[styles.tileText, {
          width: this.props.size,
          fontSize: this.props.size / 2,
        }]}>
          {this.props.letter}
        </Text>
      </View>
    );
  }
}

const tileBorderWidth = 1;
const tileMargin = 1;

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
    let width = Dimensions.get('window').width;
    let height = Dimensions.get('window').height;
    let bigger = width < height ? height : width;
    let size = Math.floor(bigger / word.length) - 2 * (
      tileBorderWidth + tileMargin);
    let parts = [];
    let key = 0;
    let colors = randomSubset(tileColors, word.length);
    for (let i = 0; i < word.length; ++i) {
      let letter = word[i];
      parts.push(<Tile
                 letter={letter}
                 key={key}
                 backgroundColor={colors[i]}
                 size={size}/>);
      key++;
    }
    return (
      <View style={styles.container}>
        <View style={{alignSelf: 'flex-start'}} />
          <View style={styles.rack}>
            {parts}
          </View>
        <View style={{alignSelf: 'flex-end'}} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  rack: {
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  tileText: {
    textAlign: 'center',
  },
  tile: {
    margin: tileMargin,
    borderWidth: tileBorderWidth,
    borderColor: '#000000',
  }
});

AppRegistry.registerComponent('Shuffley', () => Shuffley);

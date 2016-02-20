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
    for (let letter of word) {
      parts.push(<Tile letter={letter} key={key} size={size}/>);
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
    backgroundColor: '#FFFF00',
    textAlign: 'center',
  },
  tile: {
    margin: tileMargin,
    borderWidth: tileBorderWidth,
    borderColor: '#000000',
    backgroundColor: '#FF0000',
  }
});

AppRegistry.registerComponent('Shuffley', () => Shuffley);

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
      <View>
        <Text style={[styles.tile, {
          width: this.props.size,
          height: this.props.size,
          }]}>
          {this.props.letter}
        </Text>
      </View>
    );
  }
}

class Shuffley extends Component {
  render() {
    let word = 'JUPITER';
    let width = Dimensions.get('window').width;
    let size = Math.floor(width / word.length);
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
    backgroundColor: '#FF0000',
    flexDirection: 'row',
  },
  tile: {
    backgroundColor: '#FFFF00',
    fontSize: 32,
    textAlign: 'center',
    margin: 10,
  },
});

AppRegistry.registerComponent('Shuffley', () => Shuffley);

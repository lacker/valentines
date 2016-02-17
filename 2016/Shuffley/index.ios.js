'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View
} from 'react-native';

class Tile extends Component {
  render() {
    return (
      <Text style={styles.tile}>
        {this.props.letter}
      </Text>
    );
  }
}

class Shuffley extends Component {
  render() {
    let word = 'JUPITER';
    let parts = [];
    let key = 0;
    for (let letter of word) {
      parts.push(<Tile letter={letter} key={key}/>);
      key++;
    }
    return (
      <View style={styles.container}>
        <View style={styles.rack}>
          {parts}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FF00',
  },
  rack: {
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

'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View
} from 'react-native';

class Shuffley extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.mainText}>
        JUPITER
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  mainText: {
    fontSize: 128,
    textAlign: 'center',
    margin: 10,
  },
});

AppRegistry.registerComponent('Shuffley', () => Shuffley);

'use strict';
import React, {
  Component,
  Text,
  TextInput,
  View
} from 'react-native';

export default class KeyboardView extends Component {
  constructor(props) {
    super(props);

    this.state = {text: ''};
  }

  render() {
    // TODO: all caps
    // TODO: show a message
    // TODO: add the word on "enter"

    return (
      <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'space-around'
        }}>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <TextInput
            style={{
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              width: 200
            }}
            autoFocus
            onChangeText={(text) => this.setState({text})}
            value={this.state.text} />
        </View>
        <View style={{
            flex: 1,
            justifyContent: 'center',
          }}>
          <Text
            style={{textAlign: 'center'}}>
            Enter a word that would be fun to unscramble!
          </Text>
        </View>
        <View style={{flex: 2}} />
      </View>
    );
  }
}

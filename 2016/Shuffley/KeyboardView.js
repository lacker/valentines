'use strict';
import React, {
  Component,
  Text,
  TextInput,
  View
} from 'react-native';
import { connect } from 'react-redux';

class KeyboardView extends Component {
  constructor(props) {
    super(props);

    this.state = {text: ''};
  }

  onEndEditing() {
    this.props.dispatch({
      type: 'ADD_WORD',
      word: this.state.text,
    });
  }

  render() {
    return (
      <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'space-around'
        }}>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <TextInput
            style={{
              height: 60,
              width: 200,
              textAlign: 'center',
              fontSize: 48,
            }}
            autoCapitalize={'characters'}
            autoFocus
            onChangeText={(text) => this.setState({text})}
            onEndEditing={() => this.onEndEditing()}
            value={this.state.text} />
        </View>
        <View style={{
            flex: 1,
            justifyContent: 'center',
          }}>
          <Text
            style={{textAlign: 'center', fontSize: 24}}>
            Enter a word that would be fun to unscramble!
          </Text>
        </View>
        <View style={{flex: 2}} />
      </View>
    );
  }
}
export default connect(state => state)(KeyboardView);

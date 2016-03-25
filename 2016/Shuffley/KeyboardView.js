'use strict';
import {
  Component,
  TextInput
} from 'react-native';

class KeyboardView extends Component {
  constructor(props) {
    super(props);

    this.state = {text: ''};
  }

  render() {
    // TODO: all caps
    // TODO: show the keyboard
    // TODO: show a message
    // TODO: add the word on "enter"

    return (
      <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1}} onChangeText={(text) => this.setState({text})}
        value={this.state.text} />
    );
  }
}

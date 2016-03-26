'use strict';
import React, {
  Component,
  PanResponder,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { connect } from 'react-redux';
import Dimensions from 'Dimensions';
import KeyboardView from './KeyboardView';
import Tile from './Tile';
import {
  TILE_BORDER_WIDTH,
  TILE_MARGIN
} from './constants';

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

// A "controller-view" since most game controller logic is in here.
class Game extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e) => {
        console.log('starting Game pan');
        return true;
      },
      onPanResponderRelease: (e, gesture) => {
        console.log('pan dy = ' + gesture.dy);

        if (gesture.dy > 100) {
          // Swipe down means next word
          this.props.dispatch({
            type: 'KILL_WORD',
          });
        } else if (gesture.dy < -100) {
          // Swipe up means open keyboard
          this.openKeyboard();
        }
      },
    });
  }

  openKeyboard() {
    this.props.dispatch({
      type: 'OPEN_KEYBOARD',
    });
  }

  // Tries ticks up one each time and at some threshold we actually continue
  checkForSuccess(tries) {
    if (!tries) {
      tries = 0;
    }
    console.log('checkForSuccess', tries);
    // Check to see if the word is correct
    let display = '';
    for (let index of this.props.location) {
      display += this.props.word[index];
    }
    if (display == this.props.word) {
      if (tries >= 20) {
        this.props.dispatch({
          type: 'NEXT_WORD'
        });
      } else {
        this.props.dispatch({
          type: 'SMILE'
        });
        setTimeout(() => this.checkForSuccess(tries + 1), 50);
      }
    } else {
      this.props.dispatch({
        type: 'UNSMILE'
      });
    }
  }

  activate(activeIndex) {
    this.props.dispatch({
      type: 'ACTIVATE',
      activeIndex
    });
  }

  // Shifts the active tile by a delta. 1 = right, -1 = left;
  shift(delta) {
    let activeLocation = this.props.location[this.props.activeIndex];
    let newActiveLocation = activeLocation + delta;

    if (newActiveLocation < 0 ||
        newActiveLocation >= this.props.word.length) {
      // This isn't a valid shift
      return;
    }

    let newLocation = this.props.location.map((loc) => {
      if (loc == activeLocation) {
        return newActiveLocation;
      }
      if (loc == newActiveLocation) {
        return activeLocation;
      }
      return loc;
    });

    this.props.dispatch({
      type: 'SET_LOCATION',
      location: newLocation,
    });
  }

  render() {
    if (this.props.keyboard) {
      return <KeyboardView />;
    }

    if (!this.props.word) {
      return null;
    }

    let size = Math.floor(bigDimension() / this.props.word.length) - 2 * (
      TILE_BORDER_WIDTH + TILE_MARGIN);
    let parts = [];
    for (let i = 0; i < this.props.tiles.length; i++) {
      let tile = this.props.tiles[i];
      let top = (smallDimension() - size) / 2;
      let left = bigDimension() * (this.props.location[i] /
        this.props.word.length);
      let component = (
        <Tile letter={tile.letter}
          key={this.props.word + i}
          backgroundColor={tile.color}
          top={top}
          left={left}
          activate={() => {this.activate(i)}}
          checkForSuccess={() => {this.checkForSuccess()}}
          shift={(delta) => {this.shift(delta)}}
          size={size}/>
      );
      if (i == this.props.activeIndex) {
        parts.push(component);
      } else {
        parts.unshift(component);
      }
    }
    if (this.props.smiley) {
      parts.push(<Text
        style={{
          fontSize: Math.floor((smallDimension() - size) / 64) * 16,
          textAlign: 'center',
        }}
        key={'smiley'}>
        😄
      </Text>)
    }
    return (
      <View style={styles.container}
        {...this.panResponder.panHandlers}>
        {parts}
      </View>
    );
  }
}
export default connect(state => state)(Game);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

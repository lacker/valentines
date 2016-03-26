'use strict';
import React, {
  Animated,
  Component,
  PanResponder,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { connect } from 'react-redux';
import {
  TILE_BORDER_WIDTH,
  TILE_MARGIN
} from './constants';


class Tile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pan: new Animated.ValueXY(),
      tempTop: null,
      tempLeft: null,
    };

    let panStart = {};

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e) => {
        console.log('starting Tile pan');
        this.props.activate();
        panStart.top = this.props.top;
        panStart.left = this.props.left;
        return true;
      },
      onPanResponderMove: (e, gesture) => {
        this.state.pan.setValue({
          x: gesture.dx + panStart.left,
          y: gesture.dy + panStart.top,
        });

        let accountedDelta = this.props.left - panStart.left;
        let newDelta = gesture.dx - accountedDelta;
        if (newDelta < -0.5 * this.props.size) {
          this.props.shift(-1);
        } else if (newDelta > 0.5 * this.props.size) {
          this.props.shift(1);
        }
      },
      onPanResponderRelease: (e, gesture) => {
        Animated.spring(
          this.state.pan,
          {toValue: {x: this.props.left, y: this.props.top}}
        ).start();
        this.props.checkForSuccess();
      },
    });
  }

  componentWillMount() {
    this.state.pan.setValue({x: this.props.left, y: this.props.top});
  }

  componentWillReceiveProps(newProps) {
    if (this.props.left != newProps.left &&
        this.state.pan.x != newProps.left) {
      Animated.spring(
        this.state.pan,
        {toValue: {x: newProps.left, y: newProps.top}}
      ).start();
    }
  }

  render() {
    return (
      <Animated.View
        {...this.panResponder.panHandlers}
        style={this.state.pan.getLayout()}>
        <View style={[styles.tile, {
            height: this.props.size,
            width: this.props.size,
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
export default connect(state => state)(Tile);

const styles = StyleSheet.create({
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

import 'babel-polyfill';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import Counter from '../components/Counter';

import {
  incrementCount,
  decrementCount,
} from '../actions/counterActions';

export default connect(
  state => ({
    count: state.get('count'),
  }),
  dispatch => ({
    onIncrement: () => (
      dispatch(incrementCount())
    ),
    onDecrement: () => (
      dispatch(decrementCount())
    ),
  }),
)(Counter);

import { createStore } from 'redux'
import { combineReducers } from 'redux'
import members from './reducers/members';

export default createStore(combineReducers({
    members
}));
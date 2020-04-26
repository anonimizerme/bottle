import { createStore } from 'redux'
import { combineReducers } from 'redux'
import client from './reducers/client';
import room from './reducers/room';

let store;

export default (clientId) => {
    if (!store) {
        const reducer = combineReducers({
            client,
            room,
        });

        const initialState = {
            client: {
                clientId
            }
        };

        store = createStore(reducer, initialState,window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
    }

    return store;
}
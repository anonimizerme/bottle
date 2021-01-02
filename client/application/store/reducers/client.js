import assert from 'assert';

import localstorage from '../../components/helpers/localstorage';
import events from '../../../../common/events/events';

const defaultState = {
    clientId: undefined,
    firstName: undefined,
    lastName: undefined
};

const SET_CLIENT_INFO = 'set_client_info';

export const setClientInfo = (registeredEvent) => {
    assert.ok(registeredEvent instanceof events.RegisteredEvent);

    localstorage.setClientId(registeredEvent.id);

    return {
        type: SET_CLIENT_INFO,
        event: {
            clientId: registeredEvent.id,
            firstName: registeredEvent.firstName,
            lastName: registeredEvent.lastName
        }
    }
};

function client(state = defaultState, {type, event}) {
    switch (type) {
        case SET_CLIENT_INFO:
            state.clientId = event.clientId;
            state.firstName = event.firstName;
            state.lastName = event.lastName;

        default:
            return state
    }
}

export default client
import assert from 'assert';

import localstorage from '../../store/components/helpers/localstorage';
import events from '../../../../common/events/events';

const defaultState = {
    clientId: undefined
};

const SET_CLIENT_ID = 'set_client_id';

export const setClientId = (registeredEvent) => {
    assert.ok(registeredEvent instanceof events.RegisteredEvent);

    localstorage.setClientId(registeredEvent.id);

    return {
        type: SET_CLIENT_ID,
        event: {
            clientId: registeredEvent.id
        }
    }
};

function client(state = defaultState, {type, event}) {
    switch (type) {
        case SET_CLIENT_ID:
            state.clientId = event.clientId;

        default:
            return state
    }
}

export default client
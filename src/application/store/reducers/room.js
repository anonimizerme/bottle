import assert from 'assert';
import events from '../../../events/events';

const SET_ROOM = 'set_room';

export const setRoom = (roomEvent) => {
    assert.ok(roomEvent instanceof events.RoomEvent);

    return {
        type: SET_ROOM,
        event: roomEvent
    }
};

const defaultState = {};

function room(state = defaultState, {type, event}) {
    switch (type) {
        case SET_ROOM:
            return {
                ...state,
                id: event.id,
                members: event.members,
                host: event.host
            };
        default:
            return state
    }
}

export default room
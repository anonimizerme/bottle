import assert from 'assert';
import events from '../../../../common/events/events';

const SET_ROOM = 'set_room';
const SET_SPIN_RESULT = 'set_spin_result';
const SET_HOST = 'set_host';
const SET_KISSES = 'set_kisses';

export const setRoom = (roomEvent) => {
    assert.ok(roomEvent instanceof events.RoomEvent);

    return {
        type: SET_ROOM,
        event: roomEvent
    }
};

export const setSpinResult = (spinResultEvent) => {
    assert.ok(spinResultEvent instanceof events.SpinResultEvent);

    return {
        type: SET_SPIN_RESULT,
        event: spinResultEvent
    }
}

export const setHost = (setHostEvent) => {
    assert.ok(setHostEvent instanceof events.SetHostEvent);

    return {
        type: SET_HOST,
        event: setHostEvent
    }
}

export const setKisses = (setKissesEvent) => {
    assert.ok(setKissesEvent instanceof events.SetKissesEvent);

    return {
        type: SET_KISSES,
        event: setKissesEvent
    }
}

const defaultState = {};

function room(state = defaultState, {type, event}) {
    switch (type) {
        case SET_ROOM:
            return {
                ...state,
                id: event.id,
                memberIds: event.memberIds,
                hostMemberId: event.hostMemberId,
                members: event.members,
                kisses: event.kisses
            };
        case SET_SPIN_RESULT:
            return {
                ...state,
                resultMemberId: event.memberId
            };
        case SET_HOST:
            return {
                ...state,
                hostMemberId: event.memberId
            };
        case SET_KISSES:
            return {
                ...state,
                kisses: event.kisses
            }
        default:
            return state
    }
}

export default room
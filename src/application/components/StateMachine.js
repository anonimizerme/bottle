import EventEmitter from 'events';
import _ from 'lodash';
import { Machine, interpret } from 'xstate';

export const actions = {
    REGISTERED: 'registered',
    JOIN_ROOM: 'enter_room'
};

const state = {
    id: 'application',
    initial: 'pending',
    states: {
        pending: {
            on: {
                REGISTERED: 'registered'
            },
        },
        registered: {
            on: {
                JOIN_ROOM: 'inRoom'
            },
            entry: [actions.REGISTERED]
        },
        inRoom: {
            on: {
                HOST: 'host',
                VIEWER: 'viewer'
            },
            entry: [actions.JOIN_ROOM]
        },
        host: {},
        viewer: {}
    }
};

class StateMachine {
    constructor(onTransition) {
        this._ee = new EventEmitter();

        this.actions = {};
        for (let i in actions) {
            const actionName = actions[i];
            this.actions[actionName] = (context, event) => this._ee.emit(actionName, event);
        }

        this._machine = interpret(Machine(state, {actions: this.actions})).onTransition(onTransition);
    }

    on(actionName, callback) {
        this._ee.on(actionName, callback);
    }

    once(actionName, callback) {
        this._ee.once(actionName, callback);
    }

    get machine() {
        return this._machine;
    }
}

export default StateMachine

import EventEmitter from 'events';
import _ from 'lodash';
import { Machine, interpret } from 'xstate';

export const actions = {
    REGISTERED: 'registered',
    JOIN_ROOM: 'enter_room'
};

const stateInRoom = {
    initial: 'pending',
    states: {
        pending: {
            on: {
                HOST: 'host',
                VIEWER: 'viewer'
            }
        },
        host: {
            on: {
                SPIN_RESULT: 'spinResult',
            }
        },
        viewer: {
            on: {
                SPIN_RESULT: 'spinResult',
            }
        },
        spinResult: {
            on: {
                WAIT_DECISION: 'waitDecision',
            }
        },
        waitDecision: {
            on: {
                DECISION_READY: 'decisionReady'
            },
        },
        decisionReady: {
            on: {
                '': 'pending'
            }
        }
    }
}

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
            entry: [actions.JOIN_ROOM],
            ...stateInRoom
        },
    }
};

class StateMachine {
    constructor(onTransition) {
        this._ee = new EventEmitter();

        this.actions = {};
        for (let i in actions) {
            const actionName = actions[i];
            this.actions[actionName] = (context, event) => {
                console.log(`stateMachine: action: ${actionName} fired`);
                this._ee.emit(actionName, event);
            }
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

    matches(stateValue) {
        return this._machine.state.matches(stateValue);
    }
}

export default StateMachine

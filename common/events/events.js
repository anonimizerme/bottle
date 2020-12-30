const _ = require('lodash');
const serverEvents = require('./server');
const clientEvents = require('./client');
const eventsSchemaValidator = require('../components/eventsSchemaValidator');

class BaseEvent {
    constructor(object) {
        this._props = {};

        if (!_.isUndefined(object)) {
            this.object = object;
        }

        // make setters and getters for properties
        for (let key in _.get(this.schema, 'properties', {})) {
            Object.defineProperty(this, key, {
                get: () => this._props[key],
                set: (val) => this._props[key] = val
            })
        }
    }

    set object(object) {
        if (!_.isUndefined(this.schema)) {
            try {
                // todo: temporary try catch. Move it to place where event is created
                eventsSchemaValidator.validate(object, this.schema, {throwError: true});
            } catch (e) {
                console.log('!!!!!!!', this.constructor.name, object, e);
            }
        }

        for (let prop in object) {
            this._props[prop] = object[prop];
        }
    }

    get object() {
        return this._props;
    }

    get eventName() {
        throw new Error(`Need implement getter eventName for class ${this.constructor.name}`);
    }

    get isSentFromClient() {
        return false;
    }

    get isSentFromServer() {
        return false;
    }
}

class ErrorEvent extends BaseEvent {
    get eventName() {
        return clientEvents.ERROR;
    }

    get isSentFromServer() {
        return true;
    }

    get schema() {
        return {
            type: 'object',
            properties: {
                code: {type: 'integer', required: true},
                message: {type: 'string', required: true}
            }
        }
    }
}

class RegisterEvent extends BaseEvent {
    get eventName() {
        return serverEvents.REGISTER;
    }

    get isSentFromClient() {
        return true;
    }

    get schema() {
        return {
            type: 'object',
            properties: {
                socialProvider: {type: 'string', required: true},
                socialId:   {type: 'string', required: true},
            }
        }
    }
}

class RegisteredEvent extends BaseEvent {
    get eventName() {
        return clientEvents.REGISTERED;
    }

    get isSentFromServer() {
        return true;
    }

    get schema() {
        return {
            type: 'object',
            properties: {
                id: {type: 'string', required: true},
                firstName: {type: 'string', required: true},
                lastName: {type: 'string', required: true},
                success: {type: 'boolean', required: true}
            }
        }
    }
}

class JoinEvent extends BaseEvent {
    get eventName() {
        return serverEvents.JOIN;
    }

    get isSentFromClient() {
        return true;
    }
}

class RoomEvent extends BaseEvent {
    get eventName() {
        return clientEvents.ROOM;
    }

    get isSentFromServer() {
        return true;
    }

    get schema() {
        return {
            type: 'object',
            properties: {
                id: {type: 'string', required: true},
                hostMemberId: {type: 'string', required: true},
                memberIds: {type: 'array', required: true, items: {type: 'string'}, minItems: 1},
                members: {type: 'array', required: true, items: {type: 'object'}, minItems: 1},
                kisses: {type: 'object'}
            }
        }
    }
}

class SpinEvent extends BaseEvent {
    get eventName() {
        return serverEvents.SPIN;
    }

    get isSentFromClient() {
        return true;
    }
}

class SpinResultEvent extends BaseEvent {
    get eventName() {
        return clientEvents.SPIN_RESULT;
    }

    get isSentFromServer() {
        return true;
    }

    get schema() {
        return {
            type: 'object',
            properties: {
                memberId: {type: 'string', required: true},
            }
        }
    }
}

class MakeDecisionEvent extends BaseEvent {
    get eventName() {
        return serverEvents.MAKE_DECISION;
    }

    get isSentFromClient() {
        return true;
    }

    get schema() {
        return {
            type: 'object',
            properties: {
                ok: {type: 'boolean', required: true},
            }
        }
    }
}

class DecisionEvent extends BaseEvent {
    get eventName() {
        return clientEvents.DECISION;
    }

    get isSentFromServer() {
        return true;
    }

    get schema() {
        return {
            type: 'object',
            properties: {
                hostDecision: {type: 'boolean'},
                memberDecision: {type: 'boolean'},
                isReady: {type: 'boolean', required: true},
                isCouple: {type: 'boolean', required: true},
            }
        }
    }
}

class SetKissesEvent extends BaseEvent {
    get eventName() {
        return clientEvents.SET_KISSES;
    }

    get isSentFromServer() {
        return true;
    }

    get schema() {
        return {
            type: 'object',
            properties: {
                kisses: {type: 'object', required: true}
            }
        }
    }
}

class SetHostEvent extends BaseEvent {
    get eventName() {
        return clientEvents.SET_HOST;
    }

    get isSentFromServer() {
        return true;
    }

    get schema() {
        return {
            type: 'object',
            properties: {
                memberId: {type: 'string', required: true},
            }
        }
    }
}

class ChatMessageEvent extends BaseEvent {
    get eventName() {
        return serverEvents.CHAT_MESSAGE;
    }

    get isSentFromClient() {
        return true;
    }

    get schema() {
        return {
            type: 'object',
            properties: {
                message: {type: 'string', required: true}
            }
        }
    }
}

class ChatNewMessageEvent extends BaseEvent {
    get eventName() {
        return clientEvents.CHAT_NEW_MESSAGE;
    }

    get isSentFromServer() {
        return true;
    }

    get schema() {
        return {
            type: 'object',
            properties: {
                memberId: {type: 'string', required: true},
                message: {type: 'string', required: true},
            }
        }
    }
}

module.exports.ErrorEvent = ErrorEvent;
module.exports.RegisterEvent = RegisterEvent;
module.exports.RegisteredEvent = RegisteredEvent;
module.exports.JoinEvent = JoinEvent;
module.exports.RoomEvent = RoomEvent;
module.exports.SpinEvent = SpinEvent;
module.exports.SpinResultEvent = SpinResultEvent;
module.exports.MakeDecisionEvent = MakeDecisionEvent;
module.exports.DecisionEvent = DecisionEvent;
module.exports.SetKissesEvent = SetKissesEvent;
module.exports.SetHostEvent = SetHostEvent;
module.exports.ChatMessageEvent = ChatMessageEvent;
module.exports.ChatNewMessageEvent = ChatNewMessageEvent;
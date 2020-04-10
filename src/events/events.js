const _ = require('lodash');
const serverEvents = require('../events/server');
const clientEvents = require('../events/client');
const eventsSchemaValidator = require('../components/eventsSchemaValidator');

class BaseEvent {
    constructor(object) {
        this._props = {};

        if (!_.isUndefined(object)) {
            this.object = object;
        }
    }

    prop(key, val) {
        // Return value
        if (_.isUndefined(val)) {
            return this._props[key]
        }

        // Set value
        this._props[key] = val;
    }

    set object(object) {
        if (!_.isUndefined(this.schema)) {
            eventsSchemaValidator.validate(object, this.schema, {throwError: true});
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
                id:   {type: 'string', required: true},
                name: {type: 'string', required: true}
            }
        }
    }

    set id(id) {
        this.prop('id', id);
    }

    get id() {
        return this.prop('id');
    }

    set name(name) {
        this.prop('name', name);
    }

    get name() {
        return this.prop('name');
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
                success: {type: 'boolean', required: true}
            }
        }
    }

    get success() {
        return this.prop('success');
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
                host: {type: 'object', required: true},
                members: {type: 'array', required: true, items: {type: 'object'}, minItems: 1},
            }
        }
    }

    get id() {
        return this.prop('id');
    }

    get host() {
        return this.prop('host');
    }

    get members() {
        return this.prop('members');
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
                member: {type: 'object', required: true},
            }
        }
    }

    get member() {
        return this.prop('member');
    }
}

module.exports.RegisterEvent = RegisterEvent;
module.exports.RegisteredEvent = RegisteredEvent;
module.exports.JoinEvent = JoinEvent;
module.exports.RoomEvent = RoomEvent;
module.exports.SpinEvent = SpinEvent;
module.exports.SpinResultEvent = SpinResultEvent;
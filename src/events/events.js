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

module.exports.RegisterEvent = RegisterEvent;
module.exports.RegisteredEvent = RegisteredEvent;
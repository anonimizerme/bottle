const EventEmitter = require('events');
const _ = require('lodash');
const ClientIO = require('socket.io-client');
const events = require('./events/events');
const clientEvents = require('./events/client');
const logger = require('./components/Logger')('client');

class Client {
    init(url) {
        this._ee = new EventEmitter();

        this._socket = new ClientIO(url);
        this._socket.on('connect', this.handlerConnect.bind(this));

        this._registered = false;

        return this;
    }

    terminate() {
        this._socket.close();

        return this;
    }

    sendEvent(event) {
        if (event.isSentFromClient !== true) {
            throw new Error(`Can't send ${event.constructor.name} from client`);
        }

        this._socket.emit(event.eventName, event.object);

        return this;
    }

    on(eventName, callback) {
        this._ee.addListener(eventName, callback);
    }

    handlerConnect() {
        logger.log(`${this._socket.id} is connected`);

        this._socket.on(clientEvents.REGISTERED, this.handlerRegistered.bind(this));
    }

    handlerRegistered(data) {
        const regEvent = new events.RegisteredEvent(data);

        if (regEvent.success) {
            logger.log(`${this._socket.id} is registered successfully`);

            this._registered = true;
        } else {
            logger.log(`${this._socket.id} isn't registered`);

            this._registered = false;
        }

        this._ee.emit(regEvent.eventName, regEvent);
    }

    get connected() {
        return this._socket.connected;
    }

    get registered() {
        return this._registered;
    }
}

module.exports = Client;
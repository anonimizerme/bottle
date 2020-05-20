const EventEmitter = require('events');
const _ = require('lodash');
const ClientIO = require('socket.io-client');
const events = require('./events/events');
const clientEvents = require('./events/client');
const logger = require('./components/Logger')('client');

class Client {
    init(url) {
        this._ee = new EventEmitter();
        this._que = [];

        this._socket = new ClientIO(url);
        this._socket.on('connect', this.handlerConnect.bind(this));

        this._registered = false;
        this._room = false;

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

        if (!this._socket.connected) {
            logger.log(`Queue sending ${JSON.stringify([event.eventName, event.object])} to server`);

            this._que.push(event);
            return;
        }

        logger.log(`Send ${JSON.stringify([event.eventName, event.object])} to server`);

        this._socket.emit(event.eventName, event.object);

        return this;
    }

    on(eventName, callback) {
        this._ee.on(eventName, callback);
    }

    once(eventName, callback) {
        this._ee.once(eventName, callback);
    }

    removeListener(eventName, callback) {
        this._ee.removeListener(eventName, callback);
    }

    removeAllListeners() {
        this._ee.removeAllListeners();
    }

    handlerConnect() {
        logger.log(`${this._socket.id} is connected`);

        this._socket.on(clientEvents.REGISTERED, this.handlerRegistered.bind(this));
        this._socket.on(clientEvents.ROOM, this.handlerRoom.bind(this));
        this._socket.on(clientEvents.SPIN_RESULT, this.handlerSpinResult.bind(this));
        this._socket.on(clientEvents.DECISION, this.handlerDecision.bind(this));
        this._socket.on(clientEvents.SET_KISSES, this.handlerSetKisses.bind(this));
        this._socket.on(clientEvents.SET_HOST, this.handlerSetHost.bind(this));
        this._socket.on(clientEvents.CHAT_NEW_MESSAGE, this.handlerChatNewMessage.bind(this));

        while (this._que.length > 0) {
            this.sendEvent(this._que.shift());
        }
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

    handlerRoom(data) {
        const roomEvent = new events.RoomEvent(data);

        logger.log(`${this._socket.id} gets room info ${JSON.stringify(roomEvent.object)}`);

        this._room = roomEvent.object;

        this._ee.emit(roomEvent.eventName, roomEvent);
    }

    handlerSpinResult(data) {
        const spinResultEvent = new events.SpinResultEvent(data);

        logger.log(`${this._socket.id} gets spin result ${JSON.stringify(spinResultEvent.object)}`);

        this._ee.emit(spinResultEvent.eventName, spinResultEvent);
    }

    handlerDecision(data) {
        const decisionEvent = new events.DecisionEvent(data);

        logger.log(`${this._socket.id} gets decision ${JSON.stringify(decisionEvent.object)}`);

        this._ee.emit(decisionEvent.eventName, decisionEvent);
    }

    handlerSetKisses(data) {
        const setKissesEvent = new events.SetKissesEvent(data);

        logger.log(`${this._socket.id} gets set host ${JSON.stringify(setKissesEvent.object)}`);

        this._ee.emit(setKissesEvent.eventName, setKissesEvent);
    }

    handlerSetHost(data) {
        const setHostEvent = new events.SetHostEvent(data);

        logger.log(`${this._socket.id} gets set host ${JSON.stringify(setHostEvent.object)}`);

        this._ee.emit(setHostEvent.eventName, setHostEvent);
    }

    handlerChatNewMessage(data) {
        const chatNewMessageEvent = new events.ChatNewMessageEvent(data);

        logger.log(`${this._socket.id} gets chat new message ${JSON.stringify(chatNewMessageEvent.object)}`);

        this._ee.emit(chatNewMessageEvent.eventName, chatNewMessageEvent);
    }

    get connected() {
        return this._socket.connected;
    }

    get registered() {
        return this._registered;
    }

    get room() {
        return this._room;
    }
}

module.exports = Client;
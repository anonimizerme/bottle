const SocketIO = require('socket.io');
const events = require('./events/events');
const serverEvents = require('./events/server');
const Member = require('./models/Member');
const MembersManager = require('./components/MembersManager');
const logger = require('./components/Logger')('server');

let io;
let membersManager;

const onConnect = (socket) => {
    logger.log(`Client ${socket.id} is connected`);

    socket.on('disconnect', onDisconnect(socket));

    socket.on(serverEvents.REGISTER, onRegister(socket));
    socket.on(serverEvents.JOIN, onJoin(socket));
    socket.on(serverEvents.SPIN, onSpin(socket));
    socket.on(serverEvents.MAKE_DECISION, onMakeDecision(socket));

    // todo: implement connect
};

const onDisconnect = (socket) => (reason) => {
    // todo: implement disconnect
};

/**
 * Add Member into members collection
 * @param socket
 * @returns {function(...[*]=)}
 */
const onRegister = (socket) => (data) => {
    const regEvent = new events.RegisterEvent(data);
    const member = new Member(regEvent.id, regEvent.name);
    membersManager.addMember(member, {
        socketId: socket.id
    });

    serverInstance.sendEvent(socket, new events.RegisteredEvent({
        success: true
    }));
};

const onJoin = (socket) => (data) => {
    // todo: implement join
};

const onSpin = (socket) => (data) => {
    // todo: implement spin
};

const onMakeDecision = (socket) => (data) => {
    // todo: implement make decision
};

let serverInstance;

class Server {
    init(port = 3000) {
        io = new SocketIO(port);
        membersManager = new MembersManager();

        io.on('connection', onConnect);

        serverInstance = this;

        return this;
    }

    terminate() {
        io.close();

        return this;
    }

    sendEvent(socket, event) {
        if (event.isSentFromServer !== true) {
            throw new Error(`Can't send ${event.constructor.name} from server`);
        }

        logger.log(`Send ${JSON.stringify(event)} to ${socket.id}`);

        socket.emit(event.eventName, event.object);

        return this;
    }
}

module.exports = new Server();

module.exports.Server = Server;
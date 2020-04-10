const SocketIO = require('socket.io');
const _ = require('lodash');
const events = require('./events/events');
const serverEvents = require('./events/server');
const Member = require('./models/Member');
const MembersManager = require('./components/MembersManager');
const RoomsManager = require('./components/RoomsManager');
const logger = require('./components/Logger')('server');

let io;
let serverInstance;
let membersManager;
let roomsManager;

const onConnect = (socket) => {
    logger.log(`Client ${socket.id} is connected`);

    socket.on('disconnect', onDisconnect(socket));

    socket.on(serverEvents.REGISTER, onRegister(socket));
    socket.on(serverEvents.JOIN, onJoin(socket));
    socket.on(serverEvents.SPIN, onSpin(socket));
    socket.on(serverEvents.MAKE_DECISION, onMakeDecision(socket));
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
    logger.log(`onRegister with ${JSON.stringify(data)}`);

    const regEvent = new events.RegisterEvent(data);
    const member = new Member(regEvent.id, regEvent.name);
    membersManager.addMember(member, socket.id);

    serverInstance.sendEvent(socket, new events.RegisteredEvent({
        success: true
    }));
};

const onJoin = (socket) => (data) => {
    logger.log(`onJoin with ${JSON.stringify(data)}`);

    // Try to find member
    const member = membersManager.getMember(socket.id);

    if (_.isUndefined(member)) {
        // todo: think about errors in websocket
        return;
    }

    const room = roomsManager.getAvailableRoom();
    room.addMember(member);

    // add socket to room
    serverInstance.joinRoom(socket, room.id);

    serverInstance.sendRoomEvent(room.id, new events.RoomEvent(room.json));
};

const onSpin = (socket) => (data) => {
    logger.log(`onSpin with ${JSON.stringify(data)}`);

    // Try to find member
    const member = membersManager.getMember(socket.id);
    if (_.isUndefined(member)) {
        // todo: think about errors in websocket
        return;
    }

    // Try to find room
    const room = roomsManager.getRoomWithMember(member);
    if (_.isUndefined(room)) {
        // todo: think about errors in websocket
        return;
    }

    // Check member is host
    if (room.host !== member) {
        // todo: think about errors in websocket
        return;
    }

    // Get random member from room
    let rndMember;
    try {
        rndMember = room.getRandomMemberExcept(member);
    } catch (e) {
        // todo: think about errors in websocket
        return;
    }

    serverInstance.sendRoomEvent(room.id, new events.SpinResultEvent({member: rndMember.json}));
};

const onMakeDecision = (socket) => (data) => {
    // todo: implement make decision
};

class Server {
    init(port = 3000) {
        io = new SocketIO(port);
        serverInstance = this;
        membersManager = new MembersManager();
        roomsManager = new RoomsManager();

        io.on('connection', onConnect);

        return this;
    }

    terminate() {
        io.close();

        return this;
    }

    sendEvent(socket, event) {
        if (event.isSentFromServer !== true) {
            throw new Error(`Can't send ${event.constructor.name} from server to socket`);
        }

        logger.log(`Send ${JSON.stringify([event.eventName, event.object])} to ${socket.id}`);

        socket.emit(event.eventName, event.object);

        return this;
    }

    sendRoomEvent(roomId, event) {
        if (event.isSentFromServer !== true) {
            throw new Error(`Can't send ${event.constructor.name} from server to room`);
        }

        logger.log(`Send ${JSON.stringify([event.eventName, event.object])} to room_${roomId}`);

        io.to(`room_${roomId}`).emit(event.eventName, event.object);

        return this;
    }

    joinRoom(socket, roomId) {
        socket.join(`room_${roomId}`);
    }

    leaveRoom(socket, roomId) {
        socket.leave(`room_${roomId}`);
    }
}

module.exports = new Server();

module.exports.Server = Server;
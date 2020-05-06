const SocketIO = require('socket.io');
const _ = require('lodash');
const events = require('./events/events');
const serverEvents = require('./events/server');
const Member = require('./models/Member');
const MembersManager = require('./components/MembersManager');
const RoomsManager = require('./components/RoomsManager');
const DecisionsManager = require('./components/DecisionsManager');
const logger = require('./components/Logger')('server');

let io;
let serverInstance;
let membersManager;
let roomsManager;
let decisionsManager;

let membersToSocket = {};

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
    let member;
    if (!membersManager.hasMember(regEvent.id)) {
        member = new Member(regEvent.id, regEvent.name);
        membersManager.addMember(member, member.id);
        membersToSocket[member.id] = socket.id;
    } else {
        membersToSocket[regEvent.id] = socket.id;
    }

    serverInstance.sendEvent(socket, new events.RegisteredEvent({
        success: true
    }));
};

const onJoin = (socket) => (data) => {
    logger.log(`onJoin with ${JSON.stringify(data)}`);

    // Get memberId for socketId
    const memberId = _.findKey(membersToSocket, socketId => socketId === socket.id);
    if (_.isUndefined(memberId)) {
        // todo: think about errors in websocket
        return;
    }

    // Try to find member
    const member = membersManager.getMember(memberId);

    if (_.isUndefined(member)) {
        // todo: think about errors in websocket
        return;
    }

    let room = roomsManager.getRoomWithMember(member);
    if (_.isUndefined(room)) {
        room = roomsManager.getAvailableRoom();
        room.addMember(member);
    }

    // add socket to room
    serverInstance.joinRoom(socket, room.id);

    serverInstance.sendRoomEvent(room.id, new events.RoomEvent(room.json));
};

const onSpin = (socket) => (data) => {
    logger.log(`onSpin with ${JSON.stringify(data)}`);

    // Get memberId for socketId
    const memberId = _.findKey(membersToSocket, socketId => socketId === socket.id);
    if (_.isUndefined(memberId)) {
        // todo: think about errors in websocket
        return;
    }

    // Try to find member
    const member = membersManager.getMember(memberId);
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

    // Check not already spin
    if (room.isSpinned) {
        // todo: think about errors in websocket
        return;
    } else {
        // Set room is spinned
        room.isSpinned = true;
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
    logger.log(`onMakeDecision with ${JSON.stringify(data)}`);

    // Get memberId for socketId
    const memberId = _.findKey(membersToSocket, socketId => socketId === socket.id);
    if (_.isUndefined(memberId)) {
        // todo: think about errors in websocket
        return;
    }

    // Try to find member
    const member = membersManager.getMember(memberId);
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

    const makeDecisionEvent = new events.MakeDecisionEvent(data);

    const decision = decisionsManager.room(room.id);

    // Check from who and set decision
    if (room.host === member) {
        if (_.isUndefined(decision.hostDecision)) {
            decision.hostDecision = makeDecisionEvent.ok;
        } else {
            // todo: think about errors in websocket
            return;
        }
    } else if (room.coupleMember === member) {
        if (_.isUndefined(decision.memberDecision)) {
            decision.memberDecision = makeDecisionEvent.ok;
        } else {
            // todo: think about errors in websocket
            return;
        }
    } else {
        // todo: think about errors in websocket
        return;
    }

    serverInstance.sendRoomEvent(room.id, new events.DecisionEvent({
        hostDecision: decision.hostDecision,
        memberDecision: decision.memberDecision,
        isReady: decision.isReady,
        isCouple: decision.isCouple
    }));

    if (decision.isReady) {
        // Update and send kisses
        if (decision.isCouple) {
            room.kissesStorage.add(room.host.id);
            room.kissesStorage.add(room.coupleMember.id);

            serverInstance.sendRoomEvent(room.id, new events.SetKissesEvent({
                kisses: room.kissesStorage.json
            }));
        }

        // Delete decision if it's ready and sent
        decisionsManager.delete(room.id);
        room.resetCoupleMember();
    }

    // Change host
    if (decision.isReady) {
        room.changeHost();

        serverInstance.sendRoomEvent(room.id, new events.SetHostEvent({
            member: room.host.json
        }));
    }
};

class Server {
    init(port = 3000) {
        io = new SocketIO(port);
        serverInstance = this;
        membersManager = new MembersManager();
        roomsManager = new RoomsManager();
        decisionsManager = new DecisionsManager();

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
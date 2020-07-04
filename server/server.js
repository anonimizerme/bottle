const SocketIO = require('socket.io');
const _ = require('lodash');

const events = require('../common/events/events');
const serverEvents = require('../common/events/server');
const Member = require('../common/models/Member');
const MembersManager = require('./components/MembersManager');
const RoomsManager = require('./components/RoomsManager');
const DecisionsManager = require('./components/DecisionsManager');
const logger = require('../common/components/Logger')('server');

let io;

/** @type {Server} */
let serverInstance;

/** @type {MembersManager} */
let membersManager;

/** @type {RoomsManager} */
let roomsManager;

/** @type {DecisionsManager} */
let decisionsManager;

let membersToSocket = {};

const onConnect = (socket) => {
    logger.log(`Client ${socket.id} is connected`);

    socket.on('disconnect', onDisconnect(socket));

    socket.on(serverEvents.REGISTER, onRegister(socket));
    socket.on(serverEvents.JOIN, onJoin(socket));
    socket.on(serverEvents.SPIN, onSpin(socket));
    socket.on(serverEvents.MAKE_DECISION, onMakeDecision(socket));
    socket.on(serverEvents.CHAT_MESSAGE, onChatMessage(socket));
};

const onDisconnect = (socket) => (reason) => {
    // todo: implement disconnect
};

/**
 * Add Member into members collection
 * @param socket
 * @returns {function(...[*]=)}
 */
const onRegister = (socket) => async (data) => {
    logger.log(`onRegister with ${JSON.stringify(data)}`);

    const regEvent = new events.RegisterEvent(data);
    let member;

    try {
        member = await membersManager.getMember(regEvent.id);
    } catch (e) {
        if (e instanceof Member.NotFoundError) {
            // todo: saving correct image
            member = Member.create(regEvent.id, regEvent.name, 'test.png');
            await membersManager.addMember(member);
        } else {
            logger.log(`onRegister error: ${e.message}`);
            // todo: catch db errors
            return;
        }
    }

    membersToSocket[member.id] = socket.id;

    serverInstance.sendEvent(socket, new events.RegisteredEvent({
        success: true
    }));
};

const onJoin = (socket) => async (data) => {
    logger.log(`onJoin with ${JSON.stringify(data)}`);

    // Get memberId for socketId
    const memberId = _.findKey(membersToSocket, socketId => socketId === socket.id);
    if (_.isUndefined(memberId)) {
        // todo: think about errors in websocket
        return;
    }

    // Try to find member
    let member;
    try {
        member = await membersManager.getMember(memberId);
    } catch (e) {
        if (e instanceof Member.NotFoundError) {
            // todo: think about errors in websocket
            return;
        } else {
            throw e;
        }
    }

    let room = await roomsManager.getRoomWithMember(member);
    if (_.isUndefined(room)) {
        room = await roomsManager.getAvailableRoom();
        await roomsManager.addMember(room, member);
    }

    // add socket to room
    serverInstance.joinRoom(socket, room.id);

    serverInstance.sendRoomEvent(room.id, new events.RoomEvent(room.toJSON()));
};

const onSpin = (socket) => async (data) => {
    logger.log(`onSpin with ${JSON.stringify(data)}`);

    // Get memberId for socketId
    const memberId = _.findKey(membersToSocket, socketId => socketId === socket.id);
    if (_.isUndefined(memberId)) {
        // todo: think about errors in websocket
        return;
    }

    // Try to find member
    let member;
    try {
        member = await membersManager.getMember(memberId);
    } catch (e) {
        if (e instanceof Member.NotFoundError) {
            // todo: think about errors in websocket
            return;
        } else {
            throw e;
        }
    }

    // Try to find room
    const room = await roomsManager.getRoomWithMember(member);
    if (_.isUndefined(room)) {
        // todo: think about errors in websocket
        return;
    }

    // Check member is host
    if (room.hostMemberId !== member.id) {
        // todo: think about errors in websocket
        return;
    }

    // Check not already spin
    if (room.isSpun) {
        // todo: think about errors in websocket
        return;
    }

    // Get random member from room
    let rndMemberId;
    try {
        rndMemberId = await roomsManager.getRandomMemberIdExcept(room, member);
    } catch (e) {
        // todo: think about errors in websocket
        return;
    }

    serverInstance.sendRoomEvent(room.id, new events.SpinResultEvent({memberId: rndMemberId}));
};

const onMakeDecision = (socket) => async (data) => {
    logger.log(`onMakeDecision with ${JSON.stringify(data)}`);

    // Get memberId for socketId
    const memberId = _.findKey(membersToSocket, socketId => socketId === socket.id);
    if (_.isUndefined(memberId)) {
        // todo: think about errors in websocket
        return;
    }

    // Try to find member
    let member;
    try {
        member = await membersManager.getMember(memberId);
    } catch (e) {
        if (e instanceof Member.NotFoundError) {
            // todo: think about errors in websocket
            return;
        } else {
            throw e;
        }
    }

    // Try to find room
    const room = await roomsManager.getRoomWithMember(member);
    if (_.isUndefined(room)) {
        // todo: think about errors in websocket
        return;
    }

    const makeDecisionEvent = new events.MakeDecisionEvent(data);

    const decision = decisionsManager.room(room.id);

    // Check from who and set decision
    if (room.hostMemberId === member.id) {
        if (_.isUndefined(decision.hostDecision)) {
            decision.hostDecision = makeDecisionEvent.ok;
        } else {
            // todo: think about errors in websocket
            return;
        }
    } else if (room.coupleMemberId === member.id) {
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
            // todo: update kisses storage
            // room.kissesStorage.add(room.host.id);
            // room.kissesStorage.add(room.coupleMember.id);

            // serverInstance.sendRoomEvent(room.id, new events.SetKissesEvent({
            //     kisses: room.kissesStorage.json
            // }));
        }

        // Delete decision if it's ready and sent
        decisionsManager.delete(room.id);
        await roomsManager.resetCoupleMember(room);
    }

    // Change host
    if (decision.isReady) {
        console.log('AAAAAAA', room.hostMemberId);
        await roomsManager.changeHost(room);
        console.log('BBBBBB', room.hostMemberId);

        serverInstance.sendRoomEvent(room.id, new events.SetHostEvent({
            memberId: room.hostMemberId
        }));
    }
};

const onChatMessage = (socket) => (data) => {
    logger.log(`onChatMessage with ${JSON.stringify(data)}`);

    // Get memberId for socketId
    const memberId = _.findKey(membersToSocket, socketId => socketId === socket.id);
    if (_.isUndefined(memberId)) {
        // todo: think about errors in websocket
        return;
    }

    const chatMessageEvent = new events.ChatMessageEvent(data);

    // Try to find member
    const member = membersManager.getMember(memberId);

    if (_.isUndefined(member)) {
        // todo: think about errors in websocket
        return;
    }

    let room = roomsManager.getRoomWithMember(member);
    if (_.isUndefined(room)) {
        // todo: think about errors in websocket
        return;
    }

    serverInstance.sendRoomEvent(room.id, new events.ChatNewMessageEvent({
        member: member.json,
        message: chatMessageEvent.message
    }));
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
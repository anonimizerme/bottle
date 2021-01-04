const SocketIO = require('socket.io');
const _ = require('lodash');

const events = require('../common/events/events');
const serverEvents = require('../common/events/server');
const Member = require('../common/models/Member');
const MembersManager = require('./components/MembersManager');
const RoomsManager = require('./components/RoomsManager');
const DecisionsManager = require('./components/DecisionsManager');
const SocialProvider = require('./components/social/SocialProvider');
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
    try {
        logger.log(`onRegister with ${JSON.stringify(data)}`);

        const regEvent = new events.RegisterEvent(data);
        const socialProvider = new SocialProvider(regEvent.socialProvider, regEvent.socialId);

        let member;
        // Try to find member for fake by id
        if (regEvent.socialProvider === 'fake') {
            member = await membersManager.getMember(regEvent.socialId);
        } else {
            member = await membersManager.getMemberBySocial(regEvent.socialProvider, regEvent.socialId);
        }

        if (_.isUndefined(member)) {
            const socialProfile = await socialProvider.getProfile();
            member = Member.create(regEvent.socialProvider, regEvent.socialId, socialProfile.firstName, socialProfile.lastName, socialProfile.picture);
            await membersManager.addMember(member);
        }

        membersToSocket[member.id] = socket.id;

        serverInstance.sendEvent(socket, new events.RegisteredEvent({
            id: member.id,
            firstName: member.firstName,
            lastName: member.lastName,
            success: true
        }));
    } catch (e) {
        logger.error(e);

        return serverInstance.sendEvent(socket, new events.ErrorEvent({code: -1, message: e.message}));
    }
};

const onJoin = (socket) => async (data) => {
    try {
        logger.log(`onJoin with ${JSON.stringify(data)}`);

        // Get memberId for socketId
        const memberId = _.findKey(membersToSocket, socketId => socketId === socket.id);
        if (_.isUndefined(memberId)) {
            return serverInstance.sendEvent(socket, new events.ErrorEvent({code: 1, message: `[onJoin] Can't find memberId for socket ${socket.id}`}));
        }

        // Try to find member
        const member = await membersManager.getMember(memberId);
        if (_.isUndefined(member)) {
            return serverInstance.sendEvent(socket, new events.ErrorEvent({code: 1, message: `[onJoin] Can't find memberId ${memberId}`}));
        }

        let room = await roomsManager.getRoomWithMember(member);
        if (_.isUndefined(room)) {
            room = await roomsManager.getAvailableRoom();
            room = await roomsManager.addMember(room, member);
        }

        // get members for this room
        const members = (await membersManager.getMembers(room.memberIds)).map(member => member.toJSON());

        // add socket to room
        serverInstance.joinRoom(socket, room.id);

        serverInstance.sendRoomEvent(room.id, new events.RoomEvent({
            ...room.toJSON(),
            members
        }));
    } catch (e) {
        logger.error(e);

        return serverInstance.sendEvent(socket, new events.ErrorEvent({code: -1, message: e.message}));
    }
};

const onSpin = (socket) => async (data) => {
    try {
        logger.log(`onSpin with ${JSON.stringify(data)}`);

        // Get memberId for socketId
        const memberId = _.findKey(membersToSocket, socketId => socketId === socket.id);
        if (_.isUndefined(memberId)) {
            return serverInstance.sendEvent(socket, new events.ErrorEvent({code: 1, message: `[onSpin] Can't find memberId for socket ${socket.id}`}));
        }

        // Try to find member
        const member = await membersManager.getMember(memberId);
        if (_.isUndefined(member)) {
            return serverInstance.sendEvent(socket, new events.ErrorEvent({code: 1, message: `[onSpin] Can't find memberId ${memberId}`}));
        }

        // Try to find room
        const room = await roomsManager.getRoomWithMember(member);
        if (_.isUndefined(room)) {
            return serverInstance.sendEvent(socket, new events.ErrorEvent({code: 1, message: `[onSpin] Can't find room for memberId ${memberId}`}));
        }

        // Check member is host
        if (room.hostMemberId !== member.id) {
            return serverInstance.sendEvent(socket, new events.ErrorEvent({code: 1, message: `[onSpin] Only host can spin the bootle`}));
        }

        // Check not already spin
        if (room.isSpun) {
            return serverInstance.sendEvent(socket, new events.ErrorEvent({code: 1, message: `[onSpin] Bottle is already spun`}));
        }

        // Get random member from room
        let rndMemberId;
        try {
            rndMemberId = await roomsManager.getRandomMemberIdExcept(room, member);
        } catch (e) {
            return serverInstance.sendEvent(socket, new events.ErrorEvent({code: 1, message: `[onSpin] Can't get random memberId`}));
        }

        serverInstance.sendRoomEvent(room.id, new events.SpinResultEvent({memberId: rndMemberId}));
    } catch (e) {
        logger.error(e);

        return serverInstance.sendEvent(socket, new events.ErrorEvent({code: -1, message: e.message}));
    }
};

const onMakeDecision = (socket) => async (data) => {
    try {
        logger.log(`onMakeDecision with ${JSON.stringify(data)}`);

        // Get memberId for socketId
        const memberId = _.findKey(membersToSocket, socketId => socketId === socket.id);
        if (_.isUndefined(memberId)) {
            return serverInstance.sendEvent(socket, new events.ErrorEvent({code: 1, message: `[onMakeDecision] Can't find memberId for socket ${socket.id}`}));
        }

        // Try to find member
        const member = await membersManager.getMember(memberId);
        if (_.isUndefined(member)) {
            return serverInstance.sendEvent(socket, new events.ErrorEvent({code: 1, message: `[onMakeDecision] Can't find memberId ${memberId}`}));
        }

        // Try to find room
        const room = await roomsManager.getRoomWithMember(member);
        if (_.isUndefined(room)) {
            return serverInstance.sendEvent(socket, new events.ErrorEvent({code: 1, message: `[onMakeDecision] Can't find room for memberId ${memberId}`}));
        }

        const makeDecisionEvent = new events.MakeDecisionEvent(data);

        const decision = decisionsManager.room(room.id);

        // Check from who and set decision
        if (room.hostMemberId === member.id) {
            if (_.isUndefined(decision.hostDecision)) {
                decision.hostDecision = makeDecisionEvent.ok;
            } else {
                return serverInstance.sendEvent(socket, new events.ErrorEvent({code: 1, message: `[onMakeDecision] Host already made decision`}));
            }
        } else if (room.coupleMemberId === member.id) {
            if (_.isUndefined(decision.memberDecision)) {
                decision.memberDecision = makeDecisionEvent.ok;
            } else {
                return serverInstance.sendEvent(socket, new events.ErrorEvent({code: 1, message: `[onMakeDecision] Couple member already made decision`}));
            }
        } else {
            return serverInstance.sendEvent(socket, new events.ErrorEvent({code: 1, message: `[onMakeDecision] Only host or couple member can make decision`}));
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
                await roomsManager.addKissesForCouple(room);
                serverInstance.sendRoomEvent(room.id, new events.SetKissesEvent({
                    kisses: room.toJSON().memberKisses
                }));
            }

            // Delete decision if it's ready and sent
            decisionsManager.delete(room.id);
            await roomsManager.resetCoupleMember(room);
        }

        // Change host
        if (decision.isReady) {
            await roomsManager.changeHost(room);

            serverInstance.sendRoomEvent(room.id, new events.SetHostEvent({
                memberId: room.hostMemberId
            }));
        }
    } catch (e) {
        logger.error(e);

        return serverInstance.sendEvent(socket, new events.ErrorEvent({code: -1, message: e.message}));
    }
};

const onChatMessage = (socket) => async (data) => {
    try {
        logger.log(`onChatMessage with ${JSON.stringify(data)}`);

        // Get memberId for socketId
        const memberId = _.findKey(membersToSocket, socketId => socketId === socket.id);
        if (_.isUndefined(memberId)) {
            return serverInstance.sendEvent(socket, new events.ErrorEvent({code: 1, message: `[onChatMessage] Can't find memberId for socket ${socket.id}`}));
        }

        const chatMessageEvent = new events.ChatMessageEvent(data);

        // Try to find member
        const member = await membersManager.getMember(memberId);
        if (_.isUndefined(member)) {
            return serverInstance.sendEvent(socket, new events.ErrorEvent({code: 1, message: `[onChatMessage] Can't find memberId ${memberId}`}));
        }

        // Try to find room
        const room = await roomsManager.getRoomWithMember(member);
        if (_.isUndefined(room)) {
            return serverInstance.sendEvent(socket, new events.ErrorEvent({code: 1, message: `[onChatMessage] Can't find room with member ${memberId}`}));
        }

        serverInstance.sendRoomEvent(room.id, new events.ChatNewMessageEvent({
            memberId: member.id,
            message: chatMessageEvent.message
        }));
    } catch (e) {
        logger.error(e);

        return serverInstance.sendEvent(socket, new events.ErrorEvent({code: -1, message: e.message}));
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

        console.log(`Server listens on ${port} port`);

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
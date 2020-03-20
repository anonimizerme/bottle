const socketIO = require('socket.io');
const serverEvents = require('./events/server');

let io;

const onConnect = (socket) => {
    socket.on('disconnect', onDisconnect(socket));

    socket.on(serverEvents.JOIN, onJoin(socket));
    socket.on(serverEvents.SPIN, onSpin(socket));
    socket.on(serverEvents.MAKE_DECISION, onMakeDecision(socket));

    // todo: implement connect
};

const onDisconnect = (socket) => (reason) => {
    // todo: implement disconnect
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

class Server {
    init(app) {
        io = socketIO(app);

        io.on('connection', onConnect);
    }
}

module.exports = (new Server());
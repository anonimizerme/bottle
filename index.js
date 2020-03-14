const app = require('http').createServer();
const io = require('socket.io')(app);
const fs = require('fs');

app.listen(80);


const GENDER_MALE = 'm';
const GENDER_FEMALE = 'f';

class RoomMember {
    _gender = null;

    constructor(room) {
        this.room = room;
    }

    set gender(gender) {
        this._gender = gender;
    }

    get gender() {
        return this._gender;
    }
}

class Room {
    constructor() {
        this.members = [];
    }

    get roomName() {
        return 'room1';
    }

    addMember(roomMember) {
        this.members.push(roomMember);
    }

    getRandomMember() {
        return this.members[Math.floor(Math.random() * this.members.length)];
    }
}

const room = new Room();

// Server events
const EVENT_SERVER_ROOM_JOIN = 'room_join';
const EVENT_SERVER_ROOM_SPIN_BOTTLE = 'spin_bottle';
const EVENT_SERVER_ROOM_SET_RESULT = 'set_result';

// Client events
const EVENT_CLIENT_ROOM_NEW_MEMBER = 'room_new_member';
const EVENT_CLIENT_ROOM_PLAY = 'room_play';
const EVENT_CLIENT_ROOM_RESULT = 'result';

io.on('connection', function (socket) {
    socket.join(room.roomName);

    // Join to room
    socket.on(EVENT_SERVER_ROOM_JOIN, (data) => {
        const roomMember = new RoomMember(room);
        roomMember.gender = Math.random() > 0.5 ? GENDER_FEMALE : GENDER_MALE;
        room.addMember(roomMember);

        io.to(room.roomName).emit(EVENT_CLIENT_ROOM_NEW_MEMBER, roomMember);
    });

    // Spin the bottle
    socket.on(EVENT_SERVER_ROOM_SPIN_BOTTLE, (data) => {
        const randomMember = room.getRandomMember();

        io.to(room.roomName).emit(EVENT_CLIENT_ROOM_PLAY, randomMember);
    });

    // Set result
    socket.on(EVENT_SERVER_ROOM_SET_RESULT, (data) => {
        io.to(room.roomName).emit(EVENT_CLIENT_ROOM_RESULT);
    });
});
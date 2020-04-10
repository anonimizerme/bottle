const _ = require('lodash');
const Room = require('../models/Room');

const ROOM_LIMIT = 12;

class RoomsManager {
    constructor() {
        this._rooms = [];
    }

    getAvailableRoom() {
        let room = this._rooms.find((room) => {
            return room.members.length < ROOM_LIMIT;
        });

        if (_.isUndefined(room)) {
            room = new Room();
        }

        this._rooms.push(room);

        return room;
    }

    getRoomWithMember(member) {
        let room = this._rooms.find((room) => room.hasMember(member));

        return room;
    }
}

module.exports = RoomsManager;

module.exports.ROOM_LIMIT = ROOM_LIMIT;
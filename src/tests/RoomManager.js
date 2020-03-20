const assert = require('assert');

const Member = require('../models/Member');
const RoomsManager = require('../components/RoomsManager');
const ROOM_LIMIT = require('../components/RoomsManager').ROOM_LIMIT;

describe('RoomsManager', function() {

    let roomManager;

    beforeEach(function () {
        roomManager = new RoomsManager();
    });

    it('Get empty room', function () {
        const room = roomManager.getAvailableRoom();
        assert.equal(room.members.length, 0);
    });

    it('The same available room', function () {
        const room1 = roomManager.getAvailableRoom();
        const room2 = roomManager.getAvailableRoom();

        assert.equal(room1, room2);
    });

    it('New room when first is full', function () {
        const room1 = roomManager.getAvailableRoom();
        for (let i = 0; i < ROOM_LIMIT; i++) {
            room1.addMember(new Member());
        }

        const room2 = roomManager.getAvailableRoom();
        assert.notEqual(room1, room2);
        assert.equal(room2.members.length, 0);
    });
});
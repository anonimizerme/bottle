const assert = require('assert');

const Room = require('../models/Room');
const Member = require('../models/Member');

describe('Room', function() {

    let room;

    describe('Check constructor', function () {
        before(function () {
            room = new Room();
        });

        it('Members', function () {
            assert.ok(Array.isArray(room.members));
        });

        it('Members count', function () {
            assert.equal(room.members.length, 0);
        });

        it('Get host', function () {
            assert.equal(room.host, null);
        });
    });

    describe('Check room management', function () {
        beforeEach(function () {
            room = new Room();
        });

        it('Check add member', function () {
            room.addMember(new Member(1, 'n1', 'u1'));
            assert.equal(room.members.length, 1);
        });

        it('Check first is host', function () {
            room.addMember(new Member(1, 'n1', 'u1'));
            room.addMember(new Member(2, 'n2', 'u2'));
            assert.equal(room.host.id, 1);
        });

        it('Check change host', function () {
            room.addMember(new Member(1, 'n1', 'u1'));
            room.addMember(new Member(2, 'n2', 'u2'));
            room.host = 2;
            assert.equal(room.host.id, 2);
        });

        it('Remove member if more than 1', function () {
            room.addMember(new Member(1, 'n1', 'u1'));
            room.addMember(new Member(2, 'n2', 'u2'));
            room.removeMember(1);
            assert.equal(room.members.length, 1);
            assert.equal(room.host.id, 2);
        });

        it('Remove member if only 1', function () {
            room.addMember(new Member(1, 'n1', 'u1'));
            room.removeMember(1);
            assert.equal(room.members.length, 0);
            assert.equal(room.host, null);
        });
    });
});
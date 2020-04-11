const assert = require('assert');
const should = require('should');

const Room = require('../../models/Room');
const Member = require('../../models/Member');

describe('Room', function() {

    let room;

    describe('Check constructor', function () {
        before(function () {
            room = new Room();
        });

        it('Get ID', function () {
            assert.ok(room.id);
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

        it('Check room has not member', function () {
            const member = new Member(3, 'n3', 'u3');
            assert.equal(room.hasMember(member), false);
        });

        it('Check room has member', function () {
            const member = new Member(4, 'n4', 'u4');
            room.addMember(member);
            assert.ok(room.hasMember(member));
        });

        it('Get random member fail', function () {
            const member = new Member();
            room.addMember(member);
            (() => {
                room.getRandomMemberExcept(member)
            }).should.throw();
        });

        it('Get random member success', function () {
            const member1 = new Member(1);
            const member2 = new Member(2);
            room.addMember(member1);
            room.addMember(member2);

            assert.equal(room.getRandomMemberExcept(member1), member2);
            assert.equal(room.coupleMember, member2);
        })

        it('Change host', function () {
            const member1 = new Member(1);
            const member2 = new Member(2);
            room.addMember(member1);
            room.addMember(member2);

            assert.equal(room.host, member1);

            room.changeHost();
            assert.equal(room.host, member2);

            room.changeHost();
            assert.equal(room.host, member1);
        })
    });
});
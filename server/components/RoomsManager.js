const assert = require('assert');
const _ = require('lodash');
const Room = require('../../common/models/Room');
const Member = require('../../common/models/Member');

class RoomsManager {
    async getAvailableRoom() {
        let room = await Room.query()
            .findOne(Room.raw('jsonb_array_length(member_ids) < ?', [Room.ROOM_LIMIT]))

        if (_.isUndefined(room)) {
            room = Room.create();
            await room.$query().insert();
        }

        return room;
    }

    async getRoomWithMember(member) {
        assert(member instanceof Member);

        const room = await Room.query()
            .whereRaw('member_ids \\? ?', [member.id])
            .first()

        return room;
    }

    async resetCoupleMember(room) {
        assert(room instanceof Room);

        room.coupleMemberId = null;

        return room.$query().update();
    }

    /**
     * Add member to room
     * @param {Member} member
     */
    async addMember(room, member) {
        assert.ok(room instanceof Room);
        assert.ok(member instanceof Member);
        assert.ok(room.memberIds.length < Room.ROOM_LIMIT);

        room.memberIds.push(member.id);

        // Set host if added member is first
        if (room.memberIds.length === 1) {
            room.hostMemberId = member.id;
        }

        await room.$query().update();
    }

    /**
     * Remove member from room
     * @param {Member} member
     */
    async removeMember(room, member) {
        assert.ok(room instanceof Room);
        assert.ok(member instanceof Member);

        const index = room.memberIds.indexOf(member.id);
        if (index === -1) {
            throw new Error(`Can't find member with id ${member.id} in current room.`);
        }

        // Change host if removed member was hast
        if (room.hostMemberId === member.id) {
            if (room.memberIds.length > 1) {
                let newIndex;

                if (_.isUndefined(room.memberIds[index + 1])) {
                    newIndex = 0;
                } else {
                    newIndex = index + 1;
                }

                room.hostMemberId = room.memberIds[newIndex];
            } else {
                room.hostMemberId = null;
            }
        }

        // Remove member
        room.memberIds.splice(index, 1);

        return room.$query().update();
    }

    /**
     * Set host member
     * @param {Member} member
     */
    async setHost(room, member) {
        assert.ok(room instanceof Room);
        assert.ok(member instanceof Member);

        const isExist = room.memberIds.indexOf(member.id) !== -1;
        if (!isExist) {
            throw new Error(`Can't find member with id ${member.id} in current room.`);
        }

        room.hostMemberId = member.id;

        return room.$query().update();
    }

    async changeHost(room) {
        assert.ok(room.memberIds.length > 1);

        const localMemberId = room.memberIds.indexOf(room.hostMemberId);
        let newLocalMemberHostId;

        if (_.isUndefined(room.memberIds[localMemberId+1])) {
            newLocalMemberHostId = 0;
        } else {
            newLocalMemberHostId = localMemberId + 1;
        }

        room.hostMemberId = room.memberIds[newLocalMemberHostId];

        room.$query().update();
    }

    /**
     * Get random member id except member and set coupleMemberId
     * @param {Member} member
     * @returns {string}
     */
    async getRandomMemberIdExcept(room, member) {
        assert.ok(room instanceof Room);
        assert.ok(member instanceof Member);
        assert.ok(room.memberIds.length > 1);

        const index = room.memberIds.indexOf(member.id);
        if (index === -1) {
            throw new Error(`Can't find member with id ${member.id} in current room.`);
        }

        let memberIdsWithoutMember = room.memberIds.slice();
        memberIdsWithoutMember.splice(index, 1);

        room.coupleMemberId = memberIdsWithoutMember[_.random(memberIdsWithoutMember.length - 1)];

        await room.$query().update();

        return room.coupleMemberId;
    }
}

module.exports = RoomsManager;
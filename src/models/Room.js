const assert = require('assert');
const _ = require('lodash');
const Member = require('./Member');

class Room {
    constructor() {
        this._members = [];
        this._hostMemberId = null;
    }

    get members() {
        return this._members;
    }

    get host() {
        return _.find(this._members, {id: this._hostMemberId});
    }

    set host(memberId) {
        const member = _.find(this._members, {id: this._hostMemberId});
        if (_.isUndefined(member)) {
            throw new Error(`Can't find member with id ${memberId} in current room.`);
        }

        this._hostMemberId = memberId;
    }

    addMember(member) {
        assert.ok(member instanceof Member);

        this._members.push(member);

        if (this._members.length === 1) {
            this._hostMemberId = member.id;
        }
    }

    removeMember(memberId) {
        const localMemberId = _.findIndex(this._members, {id: memberId});
        if (localMemberId === -1) {
            throw new Error(`Can't find member with id ${memberId} in current room.`);
        }

        // Change host
        if (this._members.length > 1) {
            let newLocalMemberHostId;

            if (_.isUndefined(this._members[localMemberId+1])) {
                newLocalMemberHostId = 0;
            } else {
                newLocalMemberHostId = localMemberId + 1;
            }

            this._hostMemberId = this._members[newLocalMemberHostId].id;
        } else {
            this._hostMemberId = null;
        }

        // Remove member
        this._members.splice(localMemberId, 1);
    }
}

module.exports = Room;
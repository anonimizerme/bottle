const _ = require('lodash');
const assert = require('assert');
const Member = require('../models/Member');

class MembersManager {
    constructor() {
        this._members = new Map();
    }

    hasMember(key) {
        assert.ok(!_.isUndefined(key));

        return this._members.has(key);
    }

    addMember(member, key) {
        assert.ok(member instanceof Member);
        assert.ok(!_.isUndefined(key));

        this._members.set(key, member)
    }

    getMember(key) {
        if(!this._members.has(key)) {
            throw new Error(`Can't find member for key ${JSON.stringify(key)}`)
        }

        return this._members.get(key);
    }

    removeMember(key) {
        if(!this._members.has(key)) {
            throw new Error(`Can't find member for key ${JSON.stringify(key)}`)
        }

        this._members.delete(key);
    }
}

module.exports = MembersManager;
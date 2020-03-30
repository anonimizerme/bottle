const assert = require('assert');

const Member = require('../../models/Member');
const MembersManager = require('../../components/MembersManager');

describe('MembersManager', function() {

    let membersManager;

    beforeEach(function () {
        membersManager = new MembersManager();
    });

    it('Adding incorrect key', function () {
        (() => membersManager.addMember(new Member(), 1)).should.throw();
    });

    it('Adding incorrect member', function () {
        (() => membersManager.addMember({}, 1)).should.throw();
    });

    it('Adding member', function () {
        const key = {key: 1};
        const member = new Member();
        membersManager.addMember(member, key);
        assert.equal(membersManager.getMember(key), member);
    });

    it('Remove member', function () {
        const key = {key: 1};
        const member = new Member();
        membersManager.addMember(member, key);
        membersManager.removeMember(key);
        (() => membersManager.getMember(key)).should.throw();
    });
});
const uuid = require('uuid');
const chai = require('chai');

const {init: initKnex, destroy: destroyKnex} = require('../../server/knex');
const Member = require('../../common/models/Member');
const MembersManager = require('../../server/components/MembersManager');

const expect = chai.expect;

describe('MembersManager', function() {
    let membersManager;

    before(function() {
        initKnex();
    });

    after(function() {
        destroyKnex();
    })

    beforeEach(async function () {
        membersManager = new MembersManager();

        await Member.query().delete();
    });

    it('Adding incorrect member', async function () {
        try {
            await membersManager.addMember({});
        } catch (e) {
            expect(e).to.be.instanceof(Error)
        }
    });

    it('Adding member', async function () {
        const member = Member.create(uuid.v4(), '_test_name', '_test');
        await membersManager.addMember(member);
    });
});
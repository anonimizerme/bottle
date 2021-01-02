const uuid = require('uuid');
const chai = require('chai');

const {init: initKnex} = require('../../server/knex');
const Member = require('../../common/models/Member');
const MembersManager = require('../../server/components/MembersManager');

const expect = chai.expect;

describe('MembersManager', function() {
    let membersManager;

    before(function() {
        initKnex();
    });

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
        const member = Member.create('fake', uuid.v4(), '_test', '_test', '_test.png');
        await membersManager.addMember(member);
    });
});
const uuid = require('uuid');
const chai = require('chai');

const {init: initKnex} = require('../../server/knex');
const Member = require('../../common/models/Member');
const Room = require('../../common/models/Room');
const RoomsManager = require('../../server/components/RoomsManager');

const expect = chai.expect;

describe('RoomsManager', function() {

    let roomManager;

    before(function() {
        initKnex();
    });

    beforeEach(async function () {
        roomManager = new RoomsManager();

        await Room.query().delete();
    });

    it('Get empty room', async function () {
        const room = await roomManager.getAvailableRoom();
        expect(room).to.be.an.instanceof(Room);
    });

    it('The same available room', async function () {
        const room1 = await roomManager.getAvailableRoom();
        const room2 = await roomManager.getAvailableRoom();

        expect(room1.id).to.be.equal(room2.id);
    });

    it('Add only one member', function () {
        const member = Member.create(uuid.v4(), '_test', '_test');
        const room = Room.create();
        roomManager.addMember(room, member);

        expect(room.memberIds).to.eql([member.id]);
        expect(room.hostMemberId).to.equal(member.id);
    });

    it('Add two member', async function () {
        const [id1, id2] = [uuid.v4(), uuid.v4()];
        const [member1, member2] = [
            Member.create(id1, '_test', '_test'),
            Member.create(id2, '_test', '_test')
        ];

        const room = await roomManager.getAvailableRoom();
        await roomManager.addMember(room, member1);
        await roomManager.addMember(room, member2);

        expect(room.memberIds).to.eql([id1, id2]);
        expect(room.hostMemberId).to.eql(id1);
    });

    it('Get room for member', async function () {
        const member1 = Member.create(uuid.v4(), 'test', 'test');
        const member2 = Member.create(uuid.v4(), 'test2', 'test2');
        const room = await roomManager.getAvailableRoom();
        await roomManager.addMember(room, member1);

        const [room1, room2] = await Promise.all([
            roomManager.getRoomWithMember(member1),
            roomManager.getRoomWithMember(member2)
        ])

        expect(room1.uuid).to.be.equal(room.uuid);
        expect(room2).to.be.undefined;
    });

    it('Add two member and set host', async function () {
        const [id1, id2] = [uuid.v4(), uuid.v4()];
        const [member1, member2] = [
            Member.create(id1, '_test', '_test'),
            Member.create(id2, '_test', '_test')
        ];
        const room = await roomManager.getAvailableRoom();

        await roomManager.addMember(room, member1);
        await roomManager.addMember(room, member2);
        await roomManager.setHost(room, member2);

        expect(room.memberIds).to.eql([id1, id2]);
        expect(room.hostMemberId).to.eql(id2);
    });

    it('Remove only one member', async function () {
        const id = uuid.v4();
        const member = Member.create(id, '_test', '_test');
        const room = await roomManager.getAvailableRoom();

        await roomManager.addMember(room, member);
        await roomManager.removeMember(room, member);

        expect(room.memberIds).to.have.lengthOf(0);
        expect(room.hostMemberId).to.be.null;
    });

    it('Remove first (host) of two members', async function () {
        let ids = [];
        let members = [];
        const room = await roomManager.getAvailableRoom();

        for (let i = 0; i < 2; i++) {
            ids.push(uuid.v4());
            members.push(Member.create(ids[i], '_test', '_test'));
            await roomManager.addMember(room, members[i]);
        }

        await roomManager.removeMember(room, members[0]);

        expect(room.memberIds).to.eql([ids[1]]);
        expect(room.hostMemberId).to.equal(ids[1]);
    });

    it('Remove last (host) of two members', async function () {
        let ids = [];
        let members = [];
        const room = await roomManager.getAvailableRoom();

        for (let i = 0; i < 2; i++) {
            ids.push(uuid.v4());
            members.push(Member.create(ids[i], '_test', '_test'));
            await roomManager.addMember(room, members[i]);
        }

        await roomManager.setHost(room, members[1]);

        await roomManager.removeMember(room, members[1]);

        expect(room.memberIds).to.eql([ids[0]]);
        expect(room.hostMemberId).to.equal(ids[0]);
    });

    it('Get random member fail', async function () {
        const id = uuid.v4();
        const member = Member.create(id, '_test', '_test');
        const room = await roomManager.getAvailableRoom();

        await roomManager.addMember(room, member);
        await roomManager.removeMember(room, member);

        try {
            await roomManager.getRandomMemberIdExcept(room, member)
            throw new Error('It should be failed');
        } catch (e) {
            // pass
        }
    });

    it('Get random member', async function () {
        let ids = [];
        let members = [];
        const room = await roomManager.getAvailableRoom();

        for (let i = 0; i < 3; i++) {
            ids.push(uuid.v4());
            members.push(Member.create(ids[i], '_test', '_test'));
            await roomManager.addMember(room, members[i]);
        }

        const randomMemberId = await roomManager.getRandomMemberIdExcept(room, members[0]);

        expect(ids.indexOf(randomMemberId)).to.not.equal(-1);
    });

    it('Check if room is spun', async function () {
        let ids = [];
        let members = [];
        const room = await roomManager.getAvailableRoom();

        for (let i = 0; i < 3; i++) {
            ids.push(uuid.v4());
            members.push(Member.create(ids[i], '_test', '_test'));
            await roomManager.addMember(room, members[i]);
        }

        expect(room.isSpun).to.equal(false);

        roomManager.getRandomMemberIdExcept(room, members[0]);
        expect(room.isSpun).to.equal(true);
    });

    it('Reset couple member', async function () {
        let ids = [];
        let members = [];
        const room = await roomManager.getAvailableRoom();

        for (let i = 0; i < 3; i++) {
            ids.push(uuid.v4());
            members.push(Member.create(ids[i], '_test', '_test'));
            await roomManager.addMember(room, members[i]);
        }

        await roomManager.getRandomMemberIdExcept(room, members[0]);
        await roomManager.resetCoupleMember(room);

        expect(room.isSpun).to.equal(false);
    });

    it('New room when first is full', async function () {
        const room1 = await roomManager.getAvailableRoom();
        for (let i = 0; i < Room.ROOM_LIMIT; i++) {
            await roomManager.addMember(room1, Member.create(uuid.v4(), 'test', 'test'));
        }

        const room2 = await roomManager.getAvailableRoom();
        expect(room1.id).to.not.equal(room2.id);
    });
});
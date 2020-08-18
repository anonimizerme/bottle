const {expect} = require('chai');
const _ = require('lodash');
const uuid = require('uuid');
const faker = require('faker');

const {init: initKnex, destroy: destroyKnex} = require('../../server/knex');
const Server = require('../../server/server').Server;
const Client = require('../../common/client');
const clientEvents = require('../../common/events/client');
const {RegisterEvent, JoinEvent, SpinEvent, MakeDecisionEvent} = require('../../common/events/events');
const Room = require('../../common/models/Room');
const Member = require('../../common/models/Member');

const PORT = 3030;
const URL = `http://localhost:${PORT}`;

describe('Server', function () {
    let server;
    let client, client2;

    let memberIds = Array.from([1, 1], item => uuid.v4());

    before(async function() {
        initKnex();

        server = (new Server()).init(PORT);
        client = (new Client()).init(URL);

        // Clear DB before run test
        // todo: use test db for tests
        await Promise.all([
            Room.query().delete(),
            Member.query().delete()
        ]);
    });

    after(function() {
        server.terminate();
        server = null;

        client.terminate();
        client = null;

        if (!_.isUndefined(client2)) {
            client2.terminate();
            client2 = null;
        }

        destroyKnex();
    });

    it('Register event', function (done) {
        this.timeout(500);

        client.once(clientEvents.REGISTERED, (event) => {
            clearTimeout(fail);

            expect(event.success).to.be.ok;
            expect(client.registered).to.be.ok;

            done();
        });

        client.once(clientEvents.ERROR, (event) => {
            console.error(event);
        })

        client.sendEvent(new RegisterEvent({
            id: memberIds[0],
            name: `test ${faker.name.firstName()}`
        }));

        let fail = setTimeout(() => {
            done(`Client hasn't received ${clientEvents.REGISTERED} event`);
        }, 500);
    });

    it('Join event', function (done) {
        this.timeout(500);

        client.once(clientEvents.ROOM, (event) => {
            expect(event.id).to.be.ok;
            expect(event.memberIds).to.be.lengthOf(1);
            expect(event.memberIds).to.include(memberIds[0]);

            done();
        });

        client.sendEvent(new JoinEvent());
    });

    it('Join once again event', function (done) {
        this.timeout(500);

        client.once(clientEvents.ROOM, (event) => {
            expect(event.id).to.be.ok;
            expect(event.memberIds).to.be.lengthOf(1);

            done();
        });

        client.sendEvent(new JoinEvent());
    });

    it('Second client register and join', function (done) {
        this.timeout(500);

        client2 = (new Client()).init(URL);

        client2.once(clientEvents.REGISTERED, (event) => {
            client2.sendEvent(new JoinEvent());
        });

        client2.once(clientEvents.ROOM, (event) => {
            expect(event.id).to.be.ok;
            expect(event.memberIds).to.be.lengthOf(2);
            expect(event.memberIds).to.include(memberIds[0]);
            expect(event.memberIds).to.include(memberIds[1]);
            expect(event.hostMemberId).to.be.equal(memberIds[0]);

            done();
        });

        client2.sendEvent(new RegisterEvent({
            id: memberIds[1],
            name: `test ${faker.name.firstName()}`
        }));
    });

    it ('Spin the bottle. Invalid host', function (done) {
        setTimeout(() => {
            client2.removeAllListeners();

            done();
        }, 500);

        client2.on(clientEvents.SPIN_RESULT, (event) => {
            assert.fail(`Client 2 can't spin the bottle and get spin result`);
        });

        client2.sendEvent(new SpinEvent());
    });

    it ('Spin the bottle. Correct host', async function () {
        this.timeout(500);

        let promises = [
            new Promise(res => {
                client.on(clientEvents.SPIN_RESULT, event => res(event));
            }),
            new Promise(res => {
                client2.on(clientEvents.SPIN_RESULT, event => res(event));
            })
        ];

        client.sendEvent(new SpinEvent());

        return Promise.all(promises).then((results) => {
            expect(results[0].memberId).to.be.equal(memberIds[1]);
            expect(results[1].memberId).to.be.equal(memberIds[1]);

            client.removeAllListeners();
            client2.removeAllListeners();
        })
    });

    it ('Spin the bottle second time', function (done) {
        setTimeout(() => {
            client.removeAllListeners();

            done();
        }, 500);

        client.on(clientEvents.SPIN_RESULT, (event) => {
            assert.fail(`Can't spin second time and get new spin result`);
        });

        client.sendEvent(new SpinEvent());
    });

    it ('Make decision first member', async function () {
        this.timeout(500);

        let promises = [
            new Promise(res => {
                client.on(clientEvents.DECISION, event => res(event));
            }),
            new Promise(res => {
                client2.on(clientEvents.DECISION, event => res(event));
            })
        ];

        client.sendEvent(new MakeDecisionEvent({ok: true}));

        return Promise.all(promises).then((results) => {
            expect(results[0].hostDecision).to.be.ok;
            expect(results[0].isReady).to.not.be.ok;
            expect(results[0].isCouple).to.not.be.ok;

            client.removeAllListeners();
            client2.removeAllListeners();
        })
    });

    it ('Make decision second member and new host set', async function () {
        this.timeout(500);

        let promises = [
            new Promise(res => {
                client2.on(clientEvents.DECISION, event => res(event));
            }),
            new Promise(res => {
                client2.on(clientEvents.SET_KISSES, event => res(event));
            }),
            new Promise(res => {
                client2.on(clientEvents.SET_HOST, event => res(event));
            }),
        ];

        client2.sendEvent(new MakeDecisionEvent({ok: true}));

        return Promise.all(promises).then((results) => {
            expect(results[0].hostDecision).to.be.ok;
            expect(results[0].memberDecision).to.be.ok;
            expect(results[0].isReady).to.be.ok;
            expect(results[0].isCouple).to.be.ok;

            expect(results[1].kisses[memberIds[0]]).to.be.equal(1);
            expect(results[1].kisses[memberIds[1]]).to.be.equal(1);

            expect(results[2].memberId).to.be.equal(memberIds[1]);

            client.removeAllListeners();
            client2.removeAllListeners();
        })
    });

});
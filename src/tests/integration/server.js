const assert = require('assert');
const _ = require('lodash');

const Server = require('../../server').Server;
const Client = require('../../client');
const clientEvents = require('../../events/client');
const RegisterEvent = require('../../events/events').RegisterEvent;
const JoinEvent = require('../../events/events').JoinEvent;
const SpinEvent = require('../../events/events').SpinEvent;
const MakeDecisionEvent = require('../../events/events').MakeDecisionEvent;

const PORT = 3030;
const URL = `http://localhost:${PORT}`;

describe('Server', function () {
    let server;
    let client, client2;

    before(function() {
        server = (new Server()).init(PORT);
        client = (new Client()).init(URL);
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
    });

    it('Register event', function (done) {
        this.timeout(500);

        client.once(clientEvents.REGISTERED, (event) => {
            clearTimeout(fail);

            assert.ok(event.success);
            assert.ok(client.registered);

            done();
        });

        client.sendEvent(new RegisterEvent({
            id: 'id 1',
            name: 'name 1'
        }));

        let fail = setTimeout(() => {
            done(`Client hasn't received ${clientEvents.REGISTERED} event`);
        }, 500);
    });

    it('Join event', function (done) {
        this.timeout(500);

        client.once(clientEvents.ROOM, (event) => {
            assert.ok(event.id);
            assert.equal(event.members.length, 1);

            done();
        });

        client.sendEvent(new JoinEvent());
    });

    it('Join once again event', function (done) {
        this.timeout(500);

        client.once(clientEvents.ROOM, (event) => {
            assert.ok(event.id);
            assert.equal(event.members.length, 1);

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
            assert.ok(event.id);
            assert.equal(event.members.length, 2);
            assert.equal(event.host.id, 'id 1');

            done();
        });

        client2.sendEvent(new RegisterEvent({
            id: 'id 2',
            name: 'name 2'
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
            assert.equal(results[0].member.id, 'id 2');
            assert.equal(results[1].member.id, 'id 2');

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
            assert.ok(results[0].hostDecision);
            assert.equal(results[0].isReady, false);
            assert.equal(results[0].isCouple, false);

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
                client2.on(clientEvents.SET_HOST, event => res(event));
            }),
        ];

        client2.sendEvent(new MakeDecisionEvent({ok: true}));

        return Promise.all(promises).then((results) => {
            assert.ok(results[0].hostDecision);
            assert.ok(results[0].memberDecision);
            assert.equal(results[0].isReady, true);
            assert.equal(results[0].isCouple, true);

            assert.equal(results[1].member.id, 'id 2');

            client.removeAllListeners();
            client2.removeAllListeners();
        })
    });

});
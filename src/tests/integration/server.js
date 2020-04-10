const assert = require('assert');
const _ = require('lodash');

const Server = require('../../server').Server;
const Client = require('../../client');
const clientEvents = require('../../events/client');
const RegisterEvent = require('../../events/events').RegisterEvent;
const JoinEvent = require('../../events/events').JoinEvent;
const SpinEvent = require('../../events/events').SpinEvent;

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

        client.on(clientEvents.REGISTERED, (event) => {
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

        client.on(clientEvents.ROOM, (event) => {
            assert.ok(event.id);
            assert.equal(event.members.length, 1);

            client.removeAllListeners();

            done();
        });

        client.sendEvent(new JoinEvent());
    });

    it('Second client register and join', function (done) {
        this.timeout(500);

        client2 = (new Client()).init(URL);

        client2.on(clientEvents.REGISTERED, (event) => {
            client2.sendEvent(new JoinEvent());
        });

        client2.on(clientEvents.ROOM, (event) => {
            assert.ok(event.id);
            assert.equal(event.members.length, 2);
            assert.equal(event.host.id, 'id 1');

            client2.removeAllListeners();

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
            assert.fail(`Client 2 can't spin the bottle and get spin result `);
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
        })
    });


});
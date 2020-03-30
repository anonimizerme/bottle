const assert = require('assert');
const should = require('should');

const Server = require('../../server').Server;
const Client = require('../../client');
const clientEvents = require('../../events/client');
const RegisterEvent = require('../../events/events').RegisterEvent;

const PORT = 3030;
const URL = `http://localhost:${PORT}`;

describe('Server', function () {
    let server;
    let client;

    beforeEach(function() {
        server = (new Server()).init(PORT);
        client = (new Client()).init(URL)
    });

    afterEach(function() {
        server.terminate();
        server = null;

        client.terminate();
        client = null;
    });

    it('Register event', function (done) {
        client.sendEvent(new RegisterEvent({
            id: 'id 1',
            name: 'name 1'
        }));

        let fail = setTimeout(() => {
            done(`Client hasn't received ${clientEvents.REGISTERED} event`);
        }, 50);

        client.on(clientEvents.REGISTERED, (event) => {
            clearTimeout(fail);

            assert.ok(event.success);
            assert.ok(client.registered);

            done();
        });
    });


});
const assert = require('assert');
const _ = require('lodash');

const Server = require('../../server').Server;
const Client = require('../../client');
const clientEvents = require('../../events/client');
const RegisterEvent = require('../../events/events').RegisterEvent;
const ChatMessageEvent = require('../../events/events').ChatMessageEvent;
const JoinEvent = require('../../events/events').JoinEvent;

const PORT = 3030;
const URL = `http://localhost:${PORT}`;

describe('Chat', function () {
    let server;
    let clients = [];

    before(function() {
        server = (new Server()).init(PORT);
        for (let i=0; i<2; i++) {
            const client = (new Client()).init(URL);

            client.sendEvent(new RegisterEvent({
                id: `id_${i}`,
                name: `name ${i}`
            }));

            client.sendEvent(new JoinEvent());

            clients.push(client);
        }

        return new Promise(res => setTimeout(res, 1000));
    });

    after(function() {
        server.terminate();
        server = null;

        for (let client of clients) {
            client.terminate();
            client = null;
        }
    });

    it('Send message', function () {
        clients[0].sendEvent(new ChatMessageEvent({
            message: 'Hello!'
        }))
    });

    it('Receive message', function () {
        this.timeout(500);

        let promises = clients.map(client => {
            return new Promise(res => {
                client.once(clientEvents.CHAT_NEW_MESSAGE, event => res(event));
            })
        })

        clients[0].sendEvent(new ChatMessageEvent({message: 'Test 123'}));

        return Promise.all(promises).then((results) => {
            assert.equal(results[1].member.id, 'id_0');
            assert.equal(results[1].message, 'Test 123');
        })
    });
});
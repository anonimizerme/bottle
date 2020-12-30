const {expect} = require('chai');
const _ = require('lodash');
const uuid = require('uuid');

const {init: initKnex} = require('../../server/knex');
const Server = require('../../server/server').Server;
const Client = require('../../common/client');
const clientEvents = require('../../common/events/client');
const {RegisterEvent, ChatMessageEvent, JoinEvent} = require('../../common/events/events');
const Room = require('../../common/models/Room');
const Member = require('../../common/models/Member');

const PORT = 3030;
const URL = `http://localhost:${PORT}`;

describe('Chat', function () {
    this.timeout(10000);

    let server;
    let clients = [];

    const memberIds = [
        uuid.v4(),
        uuid.v4(),
    ]

    before(async function() {
        initKnex();

        // Clear DB before run test
        // todo: use test db for tests
        await Promise.all([
            Room.query().delete(),
            Member.query().delete()
        ]);

        server = (new Server()).init(PORT);
        for (let i=0; i<2; i++) {
            const client = (new Client()).init(URL);

            client.sendEvent(new RegisterEvent({
                socialProvider: 'fake',
                socialId: memberIds[i]
            }));

            client.once(clientEvents.REGISTERED, (event) => {
                client.sendEvent(new JoinEvent());
            });

            clients.push(client);

            // this timeout to add to the same room
            await new Promise(res => setTimeout(res, 500));
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

    it('Send and receive message', function () {
        this.timeout(500);

        let promises = clients.map(client => {
            return new Promise(res => {
                client.once(clientEvents.CHAT_NEW_MESSAGE, event => res(event));
            })
        })

        clients[0].sendEvent(new ChatMessageEvent({message: 'Test 123'}));

        return Promise.all(promises).then((results) => {
            expect(results[1].memberId).to.be.equal(memberIds[0]);
            expect(results[1].message).to.be.equal('Test 123');
        })
    });
});
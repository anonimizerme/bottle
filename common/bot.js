const _ = require('lodash');
const faker = require('faker');
const uuid = require('uuid');

const Client = require('./client');
const clientEvents = require('./events/client');
const RegisterEvent = require('./events/events').RegisterEvent;
const ChatMessageEvent = require('./events/events').ChatMessageEvent;
const JoinEvent = require('./events/events').JoinEvent;
const SpinEvent = require('./events/events').SpinEvent;
const MakeDecisionEvent = require('./events/events').MakeDecisionEvent;

let protocol = 'http',
    host = 'localhost',
    port = 3000,
    amount = 11;

const args = process.argv.slice(2);
for (let arg of args) {
    let [name, value] = arg.split('=');
    switch (name) {
        case '--host':
            host = value;
            break;
        case '--port':
            port = value;
            break;
        case '--protocol':
            protocol = value;
            break;
        case '--amount':
            amount = value;
            break;
    }
}

const URL = `${protocol}://${host}:${port}`

let clients = [];
let hostId;

for (let i=0; i<amount; i++) {
    const obj = {
        client: (new Client()).init(URL),
        id: uuid.v4(),
        name: `name ${i}`,
    };

    obj.client.sendEvent(new RegisterEvent({
        id: obj.id,
        name: obj.name
    }));

    obj.client.once(clientEvents.REGISTERED, () => {
        obj.client.sendEvent(new JoinEvent());
    });

    obj.client.on(clientEvents.ROOM, (event) => {
        hostId = event.hostMemberId;

        if (event.memberIds.length > 1) {
            if (hostId == obj.id) {
                setTimeout(() => {
                    obj.client.sendEvent(new SpinEvent());
                }, 4000);
            }
        }

        setInterval(() => {
            setTimeout(() => {
                obj.client.sendEvent(new ChatMessageEvent({message: faker.lorem.sentence()}))
            }, (Math.random() * 10 + Math.random() * 20) * 1000)
        }, (Math.random() * 10 + 30) * 1000);
    });

    obj.client.on(clientEvents.SET_HOST, (event) => {
        hostId = event.memberId;

        if (hostId == obj.id) {
            setTimeout(() => {
                obj.client.sendEvent(new SpinEvent());
            }, 4000);
        }
    });

    obj.client.on(clientEvents.SPIN_RESULT, (event) => {
        setTimeout(() => {
            if (hostId == obj.id || event.memberId == obj.id) {
                obj.client.sendEvent(new MakeDecisionEvent({ok: Math.random() > 0.2}));
            }
        }, 6000);
    });

    console.log(`Client ${obj.id} has been started`);

    clients.push(obj);
}
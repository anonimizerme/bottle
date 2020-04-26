import * as PIXI from 'pixi.js';
import config from '../config';
import {actions} from './StateMachine';
import Client from './../../client';
import Members from './Members';
import Bottle from './Bottle';
import {RegisterEvent, JoinEvent} from '../../events/events';
import clientEvents from '../../events/client';

class Application {
    constructor(store, stateMachine) {
        this.store = store;
        this.stateMachine = stateMachine;

        this.client = new Client();
        this.client.init(`${config.server.protocol}://${config.server.host}:${config.server.port}`);

        this.client.once(clientEvents.REGISTERED, (data) => {
            this.stateMachine.machine.send('REGISTERED');
        });

        this.client.once(clientEvents.ROOM, (data) => {
            this.stateMachine.machine.send('IN_ROOM');
        });

        this.stateMachine.once(actions.REGISTERED, () => {
            this.client.sendEvent(new JoinEvent());
        });

        this.stateMachine.once(actions.IN_ROOM, () => {
            console.log('we are in room!');
        });

        this._start();

        let prev;
        this.store.subscribe(() => {
            let cur = this.store.getState().room;
            console.log(cur == prev);
            prev = cur;
        });

        this.pixi = new PIXI.Application({
            width: 600,
            height: 600,
            antialias: true,    // default: false
            transparent: false, // default: false
            resolution: 1       // default: 1
        });

        this.pixi.renderer.backgroundColor = 0x061639;

        this.members = new Members(this);
        this.members.init();

        this.bottle = new Bottle(this);
        this.bottle.init();
    }

    _start() {
        this.stateMachine.machine.start();

        let stateClient = this.store.getState().client;
        this.client.sendEvent(new RegisterEvent({
            id: stateClient.clientId,
            name: stateClient.clientId,
        }));
    }

    attachToDocument() {
        document.body.appendChild(this.pixi.view);
    }

    render() {
        this.pixi.ticker.add(delta => this.members.render(delta));
        this.pixi.ticker.add(delta => this.bottle.render(delta));
    }
}

export default Application;
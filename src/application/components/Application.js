import _ from 'lodash';
import * as PIXI from 'pixi.js';
window.PIXI = PIXI;

import config from '../config';
import {actions} from './StateMachine';
import Client from './../../client';
import Members from './Members';
import Bottle from './Bottle';
import DecisionDialog from './DecisionDialog';
import {RegisterEvent, JoinEvent, SpinEvent, MakeDecisionEvent} from '../../events/events';
import clientEvents from '../../events/client';
import {setRoom, setSpinResult, setHost} from '../store/reducers/room';
import {getAngle} from './helpers/bottleAngle';


const isHost = (state) => _.get(state, 'room.host.id') === _.get(state, 'client.clientId');

class Application {
    constructor(store, stateMachine) {
        this.pixi = this._initPixi();

        this.store = store;
        this.stateMachine = stateMachine;

        this.client = new Client();
        this.client.init(`${config.server.protocol}://${config.server.host}:${config.server.port}`);

        this.members = new Members(this);
        this.bottle = new Bottle(this);

        // this.decisionDialog = new DecisionDialog(this);
        // this.decisionDialog.onYes(() => {
        //     this.client.sendEvent(new MakeDecisionEvent({ok: true}));
        // });
        // this.decisionDialog.onNo(() => {
        //     this.client.sendEvent(new MakeDecisionEvent({ok: false}));
        // });
        // this.decisionDialog.init();

        this.client.once(clientEvents.REGISTERED, (data) => {
            this.stateMachine.machine.send('REGISTERED');
        });

        this.client.on(clientEvents.ROOM, (event) => {
            this.store.dispatch(setRoom(event));

            this.stateMachine.machine.send('JOIN_ROOM');

            if (event.members.length > 1) {
                if (isHost(this.store.getState())) {
                    this.stateMachine.machine.send('HOST');
                } else {
                    this.stateMachine.machine.send('VIEWER');
                }
            }
        });

        this.client.on(clientEvents.SET_HOST, (event) => {
            this.store.dispatch(setHost(event));

            if (event.member.id === this.store.getState().client.clientId) {
                this.stateMachine.machine.send('HOST');
            } else {
                this.stateMachine.machine.send('VIEWER');
            }
        });

        this.client.on(clientEvents.SPIN_RESULT, (event) => {
            this.store.dispatch(setSpinResult(event));

            this.stateMachine.machine.send('SPIN_RESULT');

            this.bottle.isShow = true;
            this.bottle.spin();

            // setTimeout(() => {
            let memberIndex;
            let members = this.store.getState().room.members;
            for (let i in members) {
                if (members[i].id == event.member.id) {
                    memberIndex = i;
                    break;
                }
            }
            this.bottle.setStop(memberIndex);
            // })
        });

        this.client.on(clientEvents.DECISION, (event) => {
            // todo: govnokod, perepisat
            // this.decisionDialog.state = {
            //     decision: isHost ? event.hostDecision : event.memberDecision,
            //     otherDecision: isHost ? event.memberDecision: event.memberDecision,
            // };

            if (event.isReady) {
                this.stateMachine.machine.send('DECISION_READY');

                // setTimeout(() => {
                //     // this.decisionDialog.state = null;
                //
                //     if (event.isCouple) {
                //         alert('У вас любовь :)')
                //     } else {
                //         alert('Увы, встреча не удалась')
                //     }
                // }, 1000);

                // todo: move to state machine changing action
                this.bottle.reset();
            }
        });

        this.stateMachine.once(actions.REGISTERED, () => {
            this.client.sendEvent(new JoinEvent());
        });

        this.stateMachine.once(actions.JOIN_ROOM, () => {
            console.log('we are in room!');
        });

        this._start();


        this.members.init();

        window.test = () => this.client.sendEvent(new MakeDecisionEvent({ok: true}));
        window.testGetAngle = (id) => getAngle(this.pixi.screen, id);


        this.bottle.onClick(() => {
            if (this.stateMachine.matches('inRoom.host')) {
                this.client.sendEvent(new SpinEvent());
            }
        });
        this.bottle.onStop(() => {
            // this.decisionDialog.isShow = true;

            this.stateMachine.machine.send('WAIT_DECISION')
        });
        this.bottle.init();

        this.store.subscribe(() => {
            const state = this.store.getState();

            // Provide member to member component
            this.members.list = _.get(state, 'room.members', []);

            // Provide properties to bottle component
            this.bottle.isShow = isHost(state);
        });
    }

    _initPixi() {
        const pixi = new PIXI.Application({
            width: 600,
            height: 600,
            antialias: true,    // default: false
            transparent: false, // default: false
            resolution: 1       // default: 1
        });

        pixi.stage.sortableChildren = true;

        pixi.renderer.backgroundColor = 0x061639;

        return pixi;
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
        // this.pixi.ticker.add(delta => this.members.render(delta));
        this.pixi.ticker.add(delta => this.bottle.animation(delta));
    }
}

export default Application;
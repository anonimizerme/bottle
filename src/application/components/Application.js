import _ from 'lodash';
import * as PIXI from 'pixi.js';
window.PIXI = PIXI;

import config from '../config';
import {actions} from './StateMachine';
import Client from './../../client';
import Members from './Members';
import Bottle, {ON_CLICK, ON_STOP} from './Bottle';
import DecisionDialog from './DecisionDialog';
import {RegisterEvent, JoinEvent, SpinEvent, MakeDecisionEvent} from '../../events/events';
import clientEvents from '../../events/client';
import {setRoom, setSpinResult, setHost, setKisses} from '../store/reducers/room';
import {getAngle} from './helpers/bottleAngle';


const isHost = (state) => _.get(state, 'room.host.id') === _.get(state, 'client.clientId');
const isInCouple = (state) => isHost(state) || _.get(state, 'room.resultMemberId') === _.get(state, 'client.clientId');

class Application {
    constructor(store, stateMachine) {
        this.pixi = this._initPixi();

        this.store = store;
        this.stateMachine = stateMachine;

        this.client = new Client();
        this.client.init(`${config.server.protocol}://${config.server.host}:${config.server.port}`);

        this.members = new Members(this);
        this.bottle = new Bottle(this);

        this.decisionDialog = new DecisionDialog(this);
        this.decisionDialog.onYes(() => {
            this.decisionDialog.myDecision = true;
            this.client.sendEvent(new MakeDecisionEvent({ok: true}));
        });
        this.decisionDialog.onNo(() => {
            this.decisionDialog.myDecision = false;
            this.client.sendEvent(new MakeDecisionEvent({ok: false}));
        });
        this.decisionDialog.init();

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
        });

        this.client.on(clientEvents.SET_KISSES, (event) => {
            this.store.dispatch(setKisses(event));
        });

        this.client.on(clientEvents.SPIN_RESULT, (event) => {
            this.store.dispatch(setSpinResult(event));

            this.stateMachine.machine.send('SPIN_RESULT');

            let memberIndex;
            let members = this.store.getState().room.members;
            for (let i in members) {
                if (members[i].id == event.member.id) {
                    memberIndex = i;
                    break;
                }
            }
            this.bottle.setStop(memberIndex);

            this.bottle.show();
            this.bottle.spin();
        });

        this.client.on(clientEvents.DECISION, (event) => {
            if (!isInCouple(this.store.getState())) {
                if (!_.isUndefined(event.hostDecision)) {
                    this.decisionDialog.hostDecision = event.hostDecision;
                }

                if (!_.isUndefined(event.memberDecision)) {
                    this.decisionDialog.memberDecision = event.memberDecision;
                }
            } else {
                let decision = isHost(this.store.getState()) ? event.memberDecision : event.hostDecision;
                if (!_.isUndefined(decision)) {
                    console.log('!!!!!!!', decision);
                    this.decisionDialog.memberDecision = decision;
                }
            }

            if (event.isReady) {
                if (isInCouple(this.store.getState())) {

                }

                setTimeout(() => {
                    this.stateMachine.machine.send('DECISION_READY');

                    this.decisionDialog.isShow = false;
                }, 3000);
            }
        });

        this.stateMachine.once(actions.REGISTERED, () => {
            this.client.sendEvent(new JoinEvent());
        });

        this.stateMachine.once(actions.JOIN_ROOM, () => {
            console.log('we are in room!');
        });

        // this.stateMachine.on(actions.PREPARE, () => {
        //     // this.members.reset();
        // });

        this.stateMachine.on(actions.SET_HOST, () => {
            this.members.setHost(this.store.getState().room.host.id);
        });

        this.stateMachine.on(actions.SET_VIEWER, () => {
            this.members.setHost(this.store.getState().room.host.id);
        });

        this.stateMachine.on(actions.SET_IN_COUPLE, () => {
            this.members.setCouple(this.store.getState().room.resultMemberId);
        })

        this.stateMachine.on(actions.WAIT_DECISION, () => {
            const state = this.store.getState();

            if (isInCouple(state)) {
                this.decisionDialog.interactive = true;
            } else {
                this.decisionDialog.interactive = false;
            }
        });

        this.stateMachine.on(actions.DECISION_READY, () => {
            this.bottle.reset();
            this.members.reset();

            if (isHost()) {
                this.stateMachine.machine.send('HOST');
            } else {
                this.stateMachine.machine.send('VIEWER');
            }
        })

        this._start();

        this.members.init();

        this.bottle.ee.on(ON_CLICK, () => {
            if (this.stateMachine.matches('inRoom.host')) {
                this.bottle.prepare();
                this.client.sendEvent(new SpinEvent());
            }
        });
        this.bottle.ee.on(ON_STOP, () => {
            this.decisionDialog.reset();
            this.decisionDialog.isShow = true;

            this.stateMachine.machine.send('WAIT_DECISION')
        });

        this.store.subscribe(() => {
            const state = this.store.getState();

            // Provide member to member component
            this.members.list = _.get(state, 'room.members', []);

            this.members.kisses = _.get(state, 'room.kisses', {});

            // Provide properties to bottle component
            isHost(state) ? this.bottle.show() : this.bottle.hide();
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
        // this.pixi.ticker.add(delta => this.bottle.animation(delta));
    }
}

export default Application;
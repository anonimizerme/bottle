import _ from 'lodash';
import * as PIXI from 'pixi.js';
import faker from 'faker';
window.PIXI = PIXI;

import config from '../config';
import {actions} from './StateMachine';
import Client from '../../../common/client';
import screenUtil, {GAME_HEIGHT, GAME_WIDTH} from '../utils/screen';
import loader from '../assets/loader';
import MemberList from './ui/MemberList';
import Bottle, {ON_CLICK, ON_STOP} from './ui/Bottle';
import Heart from './ui/Heart';
import Menu from './ui/Menu';
import Mail from './ui/Mail';
import DecisionDialog from './DecisionDialog';
import {RegisterEvent, JoinEvent, SpinEvent, MakeDecisionEvent, ChatMessageEvent} from '../../../common/events/events';
import clientEvents from '../../../common/events/client';
import {setRoom, setSpinResult, setHost, setKisses} from '../store/reducers/room';

const isHost = (state) => _.get(state, 'room.hostMemberId') === _.get(state, 'client.clientId');
const isInCouple = (state) => isHost(state) || _.get(state, 'room.resultMemberId') === _.get(state, 'client.clientId');

class Application {
    constructor(store, stateMachine) {
        this.store = store;
        this.stateMachine = stateMachine;

        this.client = new Client();
        this.client.init(`${config.server.protocol}://${config.server.host}:${config.server.port}`);
    }

    async init() {
        await loader.load();

        this.pixi = this._initPixi();

        this.members = new MemberList(this.pixi);
        this.bottle = new Bottle(this.pixi);
        this.heart = new Heart(this.pixi);
        this.menu = new Menu(this.pixi);
        this.mail = new Mail(this.pixi);

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

        this.client.on(clientEvents.ERROR, (data) => {
            const p = document.createElement('p');
            p.textContent = `${data.code}: ${data.message}`;
            document.getElementById('errors-wrap').append(p);
        })

        this.client.on(clientEvents.CHAT_NEW_MESSAGE, (data) => {
            const chat = document.getElementById('chat');
            const message = document.createElement('p');
            message.innerHTML = `<b>${data.memberId.split('-')[1]}</b>: ${data.message}`;
            chat.appendChild(message);
            chat.scrollTop = chat.scrollHeight;
        });

        document.getElementById('send').addEventListener('click', () => {
            this.client.sendEvent(new ChatMessageEvent({message: document.getElementById('text').value}));
            document.getElementById('text').value = '';
        });

        this.client.once(clientEvents.REGISTERED, (data) => {
            this.stateMachine.machine.send('REGISTERED');
        });

        this.client.on(clientEvents.ROOM, (event) => {
            this.store.dispatch(setRoom(event));

            this.stateMachine.machine.send('JOIN_ROOM');

            if (event.memberIds.length > 1) {
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
            let memberIds = this.store.getState().room.memberIds;
            for (let i in memberIds) {
                if (memberIds[i] == event.memberId) {
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
            this.members.setHost(this.store.getState().room.hostMemberId);
        });

        this.stateMachine.on(actions.SET_VIEWER, () => {
            this.members.setHost(this.store.getState().room.hostMemberId);
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
            this.members.list = _.get(state, 'room.memberIds', []);

            this.members.kisses = _.get(state, 'room.kisses', {});

            this.heart.count = _.get(state, `room.kisses.${_.get(state, 'client.clientId')}`, 0);

            // Provide properties to bottle component
            isHost(state) ? this.bottle.show() : this.bottle.hide();
        });
    }

    _initPixi() {
        const pixi = new PIXI.Application({
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
            antialias: true,
            transparent: false,
            resolution: 1
        });

        const bg = new PIXI.Sprite(loader.resources['bg.01'].texture);
        bg.anchor.x = 0;
        bg.anchor.y = 0;
        bg.position.x = 0;
        bg.position.y = 0;
        bg.scale.set(1.3)
        pixi.stage.addChild(bg);

        const table = new PIXI.Sprite(loader.resources['table'].texture);
        table.anchor.set(0.5)
        table.scale.set(0.7)
        table.position.x = pixi.screen.width/2 + 150;
        table.position.y = pixi.screen.height/2;
        pixi.stage.addChild(table);

        pixi.stage.sortableChildren = true;

        pixi.renderer.backgroundColor = 0x061639;

        return pixi;
    }

    _start() {
        this.stateMachine.machine.start();

        let stateClient = this.store.getState().client;
        this.client.sendEvent(new RegisterEvent({
            id: stateClient.clientId,
            name: faker.name.firstName(),
        }));
    }

    _changeSize() {
        document.getElementById('game').style.width = GAME_WIDTH * screenUtil.getGameScreenRatio() + 'px';
        document.getElementById('game-wrap').style.height = GAME_HEIGHT * screenUtil.getGameScreenRatio() + 'px';
    }

    attachToDocument() {
        this._changeSize();
        screenUtil.onResizeWindow(this._changeSize.bind(this));

        document.getElementById('game').appendChild(this.pixi.view);
    }

    render() {
        // this.pixi.ticker.add(delta => this.members.render(delta));
        // this.pixi.ticker.add(delta => this.bottle.animation(delta));
    }
}

export default Application;
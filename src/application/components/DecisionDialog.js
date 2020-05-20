import _ from 'lodash';
import * as PIXI from 'pixi.js';

const BUTTON_TYPES = {
    yes: {bg: 0xFFFFFF, text: '❤️'},
    no: {bg: 0xCCCCCC, text: '❌️'},
    wait: {bg: 0xffc1b2, text: '?️'},
};

class Button {
    constructor(container, type) {
        this._type = type;
        this._object = this._make(type);

        container.addChild(this._object);
    }

    get object() {
        return this._object;
    }

    set alpha(val) {
        this._object.alpha = val;
    }

    set type(type) {
        this._object.beginFill(BUTTON_TYPES.bg);
        this._object.getChildByName('text').text = BUTTON_TYPES[type].text;
    }

    _make(type) {
        const button = new PIXI.Graphics();

        button.beginFill(BUTTON_TYPES[type].bg);
        button.drawRect(0, 0, 50, 50);
        button.endFill();

        const text = new PIXI.Text(BUTTON_TYPES[type].text);
        text.name = 'text';
        text.anchor.set(0.5);
        text.x = 25;
        text.y = 25;
        button.addChild(text);

        return button;
    }
}

class DecisionDialog {
    constructor(app) {
        this._app = app;

        this._container = new PIXI.Container();
        this._container.zIndex = 20;
        this._container.position = new PIXI.Point(this._app.pixi.screen.width/2, this._app.pixi.screen.height/2);

        this._objects = {
            buttonYes: null,
            buttonNo: null,
            memberDecision: null
        }

        this._handlers = {
            handlerClickYes: null,
            handlerClickNo: null
        }

        this._makeObjects();
        this._container.pivot.x = this._container.width / 2;
        this._container.pivot.y = this._container.height / 2;

        this.isShow = false;
        this._app.pixi.stage.addChild(this._container);
    }

    _makeObjects() {
        this._objects.buttonYes = new Button(this._container, 'yes')

        this._objects.buttonNo = new Button(this._container, 'no')
        this._objects.buttonNo.object.position.y = 60;

        this._objects.memberDecision = new Button(this._container, 'wait')
        this._objects.memberDecision.object.position.x = 100;
        this._objects.memberDecision.object.position.y = 25;

        this._objects.hostDecision = new Button(this._container, 'wait')
        this._objects.hostDecision.object.position.y = 25;
        this._objects.hostDecision.object.visible = false;
    }

    init() {

    }

    reset() {
        this._objects.buttonYes.alpha = 1;
        this._objects.buttonYes.object.interactive = true;
        this._objects.buttonYes.object.cursor = 'pointer';

        this._objects.buttonNo.alpha = 1;
        this._objects.buttonNo.object.interactive = true;
        this._objects.buttonNo.object.cursor = 'pointer';

        this._objects.hostDecision.type = 'wait';
        this._objects.memberDecision.type = 'wait';
    }

    set isShow(show) {
        this._container.visible = show;
    }

    set interactive(isInteractive) {
        if (isInteractive) {
            this._objects.buttonYes.object.visible = true;
            this._objects.buttonNo.object.visible = true;
            this._objects.hostDecision.object.visible = false;
        } else {
            this._objects.buttonYes.object.visible = false;
            this._objects.buttonNo.object.visible = false;
            this._objects.hostDecision.object.visible = true;
        }
    }

    set myDecision(yes) {
        this._objects.buttonYes.object.interactive = false;
        this._objects.buttonNo.object.interactive = false;

        if (yes) {
            this._objects.buttonNo.alpha = 0.2;
        } else {
            this._objects.buttonYes.alpha = 0.2;
        }
    }

    set hostDecision(yes) {
        this._objects.hostDecision.type = yes ? 'yes' : 'no';
    }

    set memberDecision(yes) {
        this._objects.memberDecision.type = yes ? 'yes' : 'no';
    }

    onYes(callback) {
        this._objects.buttonYes.object.on('click', callback);
    }

    onNo(callback) {
        this._objects.buttonNo.object.on('click', callback);
    }
}

export default DecisionDialog;
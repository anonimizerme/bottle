import _ from 'lodash';
import * as PIXI from 'pixi.js';

class DecisionDialog {
    constructor(app) {
        this._app = app;

        this._container = new PIXI.Container();
        this._container.zIndex = 20;
        this._container.position = new PIXI.Point(300, 300)
        this._app.pixi.stage.addChild(this._container);

        this.buttonYes = null;
        this.buttonNo = null;
        this.otherButton = null;

        this._isShow = false;

        this.handlerClickYes = null;
        this.handlerClickNo = null;
    }

    init() {
        this.render();
    }

    set isShow(show) {
        this._isShow = show;

        this.render();
    }

    set state(state) {
        if (!_.isUndefined(state.otherDecision)) {
            this.otherButton = this.otherButton = this._makeButton(state.otherDecision ? 'yes' : 'no');
            this.otherButton.position.x = 100;
            this.otherButton.position.y = 25;

            this._container.addChild(this.otherButton);
        }

        if (!_.isUndefined(state.decision)) {
            if (state.decision) {
                this.buttonYes.graphics.lineStyle(2, 0xFEEB77, 1);
            } else {
                this.buttonNo.graphics.lineStyle(2, 0xFEEB77, 1);
            }
        }

        this.render();
    }

    onYes(callback) {
        this.handlerClickYes = callback;
    }

    onNo(callback) {
        this.handlerClickNo = callback;
    }

    render() {
        this._container.visible = this._isShow;

        this._makeYesButton();
        this._makeNoButton();
        this._makeOtherButton();

        this._container.pivot.x = this._container.width / 2;
        this._container.pivot.y = this._container.height / 2;
    }

    _makeYesButton() {
        if (!_.isNull(this.buttonYes)) {
            return;
        }

        this.buttonYes = this._makeButton('yes');
        this.buttonYes.interactive = true;
        this.buttonYes.cursor = 'pointer';
        this.buttonYes.on('click', this.handlerClickYes);

        this._container.addChild(this.buttonYes);
    }

    _makeNoButton() {
        if (!_.isNull(this.buttonNo)) {
            return;
        }

        this.buttonNo = this._makeButton('no');
        this.buttonNo.position.y = 60;
        this.buttonNo.interactive = true;
        this.buttonNo.cursor = 'pointer';
        this.buttonNo.on('click', this.handlerClickNo);

        this._container.addChild(this.buttonNo);
    }

    _makeOtherButton() {
        if (!_.isNull(this.otherButton)) {
            return;
        }

        this.otherButton = this._makeButton('wait');
        this.otherButton.position.x = 100;
        this.otherButton.position.y = 25;

        this._container.addChild(this.otherButton);
    }

    _makeButton(type) {
        const types = {
            yes: {bg: 0xFFFFFF, text: '❤️'},
            no: {bg: 0xCCCCCC, text: '❌️'},
            wait: {bg: 0xffc1b2, text: '?️'},
        };

        const button = new PIXI.Graphics();

        button.beginFill(types[type].bg);
        button.drawRect(0, 0, 50, 50);
        button.endFill();

        const text = new PIXI.Text(types[type].text);
        text.anchor.set(0.5);
        text.x = 25;
        text.y = 25;
        button.addChild(text);

        return button;
    }
}

export default DecisionDialog;
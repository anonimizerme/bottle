const EventEmitter = require('events');
import * as PIXI from 'pixi.js';

class Element {
    constructor(pixi) {
        this._pixi = pixi;

        this._ee = new EventEmitter();
        this._container = new PIXI.Container();

        pixi.stage.addChild(this._container);
    }

    get screen() {
        return this._pixi.screen;
    }

    get ee() {
        return this._ee;
    }

    get container() {
        return this._container;
    }

    set zIndex(zIndex) {
        this._container.zIndex = zIndex;
    }

    addChild(object) {
        this._container.addChild(object);
    }

    getChild(name) {
        return this._container.getChildByName(name);
    }

    hide() {
        this._container.visible = false;
    }

    show() {
        this._container.visible = true;
    }

    render() {
        throw new Error(`Base class Element can't be rendered`);
    }
}

export default Element
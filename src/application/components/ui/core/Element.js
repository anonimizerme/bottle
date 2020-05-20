import EventEmitter from 'events';
import _ from 'lodash';
import * as PIXI from 'pixi.js';

class Element {
    constructor(pixi, container = null) {
        this._pixi = pixi;

        this._ee = new EventEmitter();
        this._container = container;

        pixi.stage.addChild(this.container);
    }

    get pixi() {
        return this._pixi;
    }

    get screen() {
        return this._pixi.screen;
    }

    get ee() {
        return this._ee;
    }

    get container() {
        if (_.isNull(this._container)) {
            this._container = new PIXI.Container();
        }

        return this._container;
    }

    set zIndex(zIndex) {
        this.container.zIndex = zIndex;
    }

    addChild(object) {
        this.container.addChild(object);
    }

    removeChild(object) {
        this.container.removeChild(object);
    }

    getChild(name) {
        return this.container.getChildByName(name);
    }

    hide() {
        this.container.visible = false;
    }

    show() {
        this.container.visible = true;
    }

    render() {
        throw new Error(`Base class Element can't be rendered`);
    }
}

export default Element
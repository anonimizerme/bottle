import EventEmitter from 'events';
import _ from 'lodash';
import * as PIXI from 'pixi.js';

class Element {
    constructor(pixi) {
        this._pixi = pixi;

        this._ee = new EventEmitter();
        this._container = null;

        pixi.stage.addChild(this.container);
    }

    get screen() {
        return this._pixi.screen;
    }

    get ee() {
        return this._ee;
    }

    get container() {
        if (_.isNull(this._container)) {
            this._container = this.makeContainer();
        }

        return this._container;
    }

    set zIndex(zIndex) {
        this.container.zIndex = zIndex;
    }

    makeContainer() {
        return new PIXI.Container();
    }

    addChild(object) {
        this.container.addChild(object);
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
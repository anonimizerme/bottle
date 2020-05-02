import _ from 'lodash';
import * as PIXI from 'pixi.js';
import {getAngle} from './helpers/bottleAngle';

class Bottle {
    constructor(app) {
        this._app = app;
        // todo: implement container;
        this._container = null;

        this.object = null;

        this._isShow = false;

        this._stage = null;

        this.handlerClick = null;

        this.loops = Math.floor(Math.random() * 3) + 3;
        this.maxSpeed = 0;
        this.speed = 0;
        this.distancetoStop = Math.max(180+Math.random()*90);
    }

    init() {
        this.render();
    }

    set isShow(show) {
        this._isShow = show;

        this.render();
    }

    onClick(callback) {
        this.handlerClick = callback;
    }

    onStop(callback) {
        this.handlerStop = callback;
    }

    spin() {
        this._stage = 'spin';
    }

    setStop(memberIndex) {
        this._targetAngle = getAngle(this._app.pixi.screen, memberIndex);
    }

    reset() {
        this.object.angle = 0;
    }

    render() {
        if (_.isNull(this.object)) {
            const pixi = this._app.pixi;

            this._container = new PIXI.Container();
            this._container.zIndex = 10;

            this.object = PIXI.Sprite.from('assets/bottle.png');
            this.object.anchor.set(0.5);
            this.object.scale.set(0.3);
            this.object.x = pixi.screen.width / 2;
            this.object.y = pixi.screen.height / 2;

            this.object.interactive = true;
            this.object.cursor = 'pointer';

            this.object.on('click', this.handlerClick);

            this._container.addChild(this.object)

            pixi.stage.addChild(this._container);
        }

        this.object.visible = this._isShow;
    }

    animation(delta) {
        const targetAngle = this._targetAngle + 360 * this.loops;

        if (this._stage === 'spin') {
            // increasing speed
            if (this.object.angle <= 180) {
                this.speed += 0.15;
            } else if (targetAngle) {
                if (this.object.angle >= targetAngle) {
                    this.maxSpeed = 0;
                    this.speed = 0;
                    this.object.angle = this._targetAngle;

                    this._stage = null;
                    this.handlerStop();
                    return;
                } else if (targetAngle - this.object.angle < this.distancetoStop) {
                    this.maxSpeed = Math.max(this.maxSpeed, this.speed);

                    const percent = (this.object.angle - (targetAngle - this.distancetoStop)) / (this.distancetoStop / 100);
                    let percentInvert = 100 - percent;
                    this.speed = (this.maxSpeed / 100) * Math.max(percentInvert, 8);
                }
            }


            this.object.angle += delta * this.speed;
        }
    }
}

export default Bottle;
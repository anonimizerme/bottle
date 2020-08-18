import _ from 'lodash';
import * as PIXI from 'pixi.js';
import anime from 'animejs';

import Element from './core/Element';
import {ROOM_LIMIT} from '../../../../common/models/Room';
import {getAngle} from '../helpers/bottleAngle';

const ANIM_ANGLE_PREPARE = () => ({
    value: anime.random(-20, -10),
    duration: 200,
    easing: 'easeOutCubic'
})

const ANIM_ANGLE_TARGET = (targetAngle) => ({
    value: anime.random(3, 5) * 360 + targetAngle,
    duration: 4000,
    easing: 'easeOutQuint'
});

export const ON_CLICK = 'CLICK';
export const ON_STOP = 'STOP';

class Bottle extends Element {
    constructor(pixi) {
        super(pixi);

        // By default bottle is hidden
        this.hide();

        this.zIndex = 10;

        // Define and init objects
        this.bottle = null;
        this._initObjects();
    }

    _initObjects() {
        if (this.bottle) {
            return;
        }

        this.bottle = PIXI.Sprite.from('assets/bottle_01.png');
        this.bottle.anchor.set(0.5);
        this.bottle.x = this.screen.width / 2 + 150;
        this.bottle.y = this.screen.height / 2;
        this.bottle.interactive = true;
        this.bottle.cursor = 'pointer';

        this.bottle.on('click', this.handlerClick.bind(this));

        this.addChild(this.bottle);
    }

    handlerClick() {
        this.ee.emit(ON_CLICK);
    }

    handlerStop() {
        this.ee.emit(ON_STOP);
    }

    prepare() {
        this.animation = anime({
            targets: this.bottle,
            angle: [ANIM_ANGLE_PREPARE()],
            round: 10,
        });
    }

    async spin() {
        let targetAngle = [ANIM_ANGLE_TARGET(this._targetAngle)];

        if (this.animation) {
            // await this.animation.finished;
        } else {
            targetAngle.unshift(ANIM_ANGLE_PREPARE());
        }

        this.animation = anime({
            targets: this.bottle,
            angle: targetAngle,
            round: 10
        });

        await this.animation.finished.then(() => {
            this.animation = null;
            this.handlerStop()
        });
    }

    setStop(memberIndex) {
        this._targetAngle = getAngle(this.screen, memberIndex, ROOM_LIMIT) + 90;
    }

    reset() {
        this.bottle.angle = 0;
    }
}

export default Bottle;
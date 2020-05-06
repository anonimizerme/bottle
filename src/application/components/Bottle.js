import _ from 'lodash';
import * as PIXI from 'pixi.js';
import anime from 'animejs';
import Element from './core/Element';
import {getAngle} from './helpers/bottleAngle';

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

class Bottle extends Element {
    constructor(app) {
        super(app.pixi);

        // By default bottle is hidden
        this.hide();

        this.zIndex = 10;

        // Define and init objects
        this.bottle = null;
        this._initObjects();

        // Define stage
        this._stage = null;

        // todo: refactoring
        this.loops = Math.floor(Math.random() * 3) + 3;
        this.maxSpeed = 0;
        this.speed = 0;
        this.distancetoStop = Math.max(180+Math.random()*90);
    }

    _initObjects() {
        if (this.bottle) {
            return;
        }

        this.bottle = PIXI.Sprite.from('assets/bottle.png');
        this.bottle.anchor.set(0.5);
        this.bottle.scale.set(0.3);
        this.bottle.x = this.screen.width / 2;
        this.bottle.y = this.screen.height / 2;
        this.bottle.interactive = true;
        this.bottle.cursor = 'pointer';

        this.bottle.on('click', this.handlerClick.bind(this));

        this.addChild(this.bottle);
    }

    set onClick(callback) {
        this.ee.on('CLICK', callback);
    }

    set onStop(callback) {
        this.ee.on('STOP', callback);
    }

    handlerClick() {
        this.ee.emit('CLICK');
    }

    handlerStop() {
        this.ee.emit('STOP');
    }

    prepare() {
        this.animation = anime({
            targets: this.bottle,
            angle: [ANIM_ANGLE_PREPARE()],
            round: 10
        });
    }

    async spin() {
        let targetAngle = [ANIM_ANGLE_TARGET(this._targetAngle)];
        if (this.animation) {
            await this.animation.finished;
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
        this._targetAngle = getAngle(this.screen, memberIndex);
    }

    reset() {
        this.bottle.angle = 0;
    }

    // animation(delta) {
    //     const targetAngle = this._targetAngle + 360 * this.loops;
    //
    //     if (this._stage === 'spin') {
    //         // increasing speed
    //         if (this.bottle.angle <= 180) {
    //             this.speed += 0.15;
    //         } else if (targetAngle) {
    //             if (this.bottle.angle >= targetAngle) {
    //                 this.maxSpeed = 0;
    //                 this.speed = 0;
    //                 this.bottle.angle = this._targetAngle;
    //
    //                 this._stage = null;
    //                 this.handlerStop();
    //                 return;
    //             } else if (targetAngle - this.bottle.angle < this.distancetoStop) {
    //                 this.maxSpeed = Math.max(this.maxSpeed, this.speed);
    //
    //                 const percent = (this.bottle.angle - (targetAngle - this.distancetoStop)) / (this.distancetoStop / 100);
    //                 let percentInvert = 100 - percent;
    //                 this.speed = (this.maxSpeed / 100) * Math.max(percentInvert, 8);
    //             }
    //         }
    //
    //
    //         this.bottle.angle += delta * this.speed;
    //     }
    // }
}

export default Bottle;
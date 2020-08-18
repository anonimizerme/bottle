import _ from 'lodash';
import * as PIXI from 'pixi.js';
import anime from 'animejs';

import Element from './core/Element';
import {ROOM_LIMIT} from '../../../../common/models/Room';
import {getAngle} from '../helpers/bottleAngle';

class Heart extends Element {
    constructor(pixi) {
        super(pixi);

        // Define and init objects
        this.icon = null;
        this.text = null;
        this._initObjects();
    }

    _initObjects() {
        if (this.icon) {
            return;
        }

        this.icon = PIXI.Sprite.from('assets/icons/heart.png');
        this.icon.position.set(20, 20);

        this.text = new PIXI.Text('0', {
            fontSize: 70,
            fill: 0xffffff
        });

        // todo: preload assets to get actually size
        setTimeout(() => {
            this.text.position.set(
                this.icon.x + this.icon.width + 10,
                this.icon.y + this.text.height / 4
            );
        }, 500)

        this.addChild(this.icon);
        this.addChild(this.text);
    }

    set count(count) {
        this.text.text = count;
    }
}

export default Heart;
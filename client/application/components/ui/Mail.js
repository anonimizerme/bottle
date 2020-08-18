import _ from 'lodash';
import * as PIXI from 'pixi.js';
import anime from 'animejs';

import Element from './core/Element';
import {ROOM_LIMIT} from '../../../../common/models/Room';
import {getAngle} from '../helpers/bottleAngle';

class Mail extends Element {
    constructor(pixi) {
        super(pixi);

        // Define and init objects
        this.icon = null;
        this._initObjects();
    }

    _initObjects() {
        if (this.icon) {
            return;
        }

        this.icon = PIXI.Sprite.from('assets/icons/mail.png');
        this.icon.position.set(this.screen.width - 200, 20);

        this.addChild(this.icon);
    }
}

export default Mail;
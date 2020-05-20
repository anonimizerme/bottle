import _ from 'lodash';
import * as PIXI from 'pixi.js';

import Element from './core/Element';
import {memberImageSize} from '../helpers/memberPositions';

class Member extends Element {
    constructor(app, {image, isMe}) {
        super(app.pixi);

        // Define props
        this.props = {
            image,
            isMe
        }

        // Define and init objects
        this.image = null;
        this.text = null;
        this.kisses = null;

        this._initObjects();
    }

    _initObjects() {
        if (_.isNull(this.image)) {
            this.image = new PIXI.Sprite.from(this.props.image);
            this.image.name = 'sprite';
            this.image.anchor.set(0.5);
            this.image.width = memberImageSize.width;
            this.image.height = memberImageSize.height;

            this.addChild(this.image);
        }

        if (_.isNull(this.text) && this.props.isMe) {
            this.text = new PIXI.Text('я', {fill: 0xFFFFFF, fontSize: 20});
            this.text.anchor.set(0.5);
            this.text.position.x = 0;
            this.text.position.y = 35;

            this.addChild(this.text);
        }

        if (_.isNull(this.kisses)) {
            this.kisses = new PIXI.Text('❤️ = 0', {fill: 0xFFFFFF, fontSize: 20});
            this.kisses.name = 'kisses';
            this.kisses.anchor.set(0.5);
            this.kisses.position.x = 0;
            this.kisses.position.y = 50;

            this.addChild(this.kisses);
        }
    }

    set kissesValue(value) {
        this.kisses.text = '❤️ = '+value;
    }

    reset() {
        this.image.tint = 0xFFFFFF;
    }

    setHost() {
        this.image.tint = 0x00FF2A;
    }

    setInCouple() {
        this.image.tint = 0xFF00D2;
    }
}

export default Member;
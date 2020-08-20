import _ from 'lodash';
import * as PIXI from 'pixi.js';

import loader from '../../assets/loader';
import Element from './core/Element';
import Kisses from './Kisses';
import {memberImageSize} from '../helpers/memberPositions';

class Member extends Element {
    constructor(pixi, {image, isMe}) {
        super(pixi);

        // Define props
        this.props = {
            image,
            isMe
        }

        // Define and init objects
        this.image = null;
        this.imageMask = null;
        this.border = null;
        this.text = null;
        this.kisses = null;

        this._initObjects();
    }

    _initObjects() {
        if (_.isNull(this.image)) {
            this.image = new PIXI.Sprite.from(this.props.image);
            this.image.name = 'sprite';
            this.image.width = memberImageSize.width;
            this.image.height = memberImageSize.height;

            this.addChild(this.image);
        }

        if (_.isNull(this.imageMask)) {
            // Mask to make rounded
            this.imageMask = new PIXI.Graphics();
            this.imageMask.lineStyle(0);
            this.imageMask.beginFill(0x000000);
            this.imageMask.drawRoundedRect(0, 0, memberImageSize.width, memberImageSize.height, 40);
            this.imageMask.endFill();
            this.addChild(this.imageMask);
            this.image.mask = this.imageMask;
        }

        if (_.isNull(this.border) && Math.random() > 0.3) {
            this.border = new PIXI.Sprite(loader.resources[`borders.0${Math.round(Math.random()*2)+1}`].texture);
            this.border.name = 'border';
            this.border.width = memberImageSize.width + 30 * memberImageSize.width / 100;
            this.border.height = memberImageSize.height + 30 * memberImageSize.height / 100;
            this.border.position.set(
                (memberImageSize.width - this.border.width) / 2,
                (memberImageSize.height - this.border.height) / 2
            );

            this.addChild(this.border);
        }

        if (_.isNull(this.text) && this.props.isMe) {
            this.text = new PIXI.Text('я', {fill: 0xFFFFFF, fontSize: 30});
            this.text.position.x = memberImageSize.width / 2;
            this.text.position.y = memberImageSize.height + 10;

            this.addChild(this.text);
        }

        if (_.isNull(this.kisses)) {
            this.kisses = new Kisses(this.pixi, {amount: 0});
            this.kisses.container.position.x = 0;
            this.kisses.container.position.y = 0;

            this.addChild(this.kisses.container);
        }
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
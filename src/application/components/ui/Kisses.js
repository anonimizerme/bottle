import _ from 'lodash';
import * as PIXI from 'pixi.js';

import Element from './core/Element';
import anime from 'animejs';

class Kisses extends Element {
    constructor(pixi, {amount}) {
        super(pixi);

        // Define props
        this.props = {
            amount
        }

        // By default component is hidden
        this.hide();

        // Define and init objects
        this.kiss = null;
        this.text = null;

        this._initObjects();
    }

    _initObjects() {
        if (_.isNull(this.kiss)) {
            this.kiss = new PIXI.Text('💋', {fontSize: 20});
            this.kiss.anchor.set(0.5);
            this.kiss.position.x = 10;
            this.kiss.position.y = 10;

            this.addChild(this.kiss);
        }

        if (_.isNull(this.text)) {
            this.text = new PIXI.Text(this.props.amount, {fill: 0xFFFFFF, fontSize: 10});
            this.text.position.x = 20;
            this.text.position.y = 5;

            this.addChild(this.text);
        }
    }

    async update(amount, withAnimation = true) {
        if (this.props.amount === amount) {
            return;
        }

        if (amount > 0) {
            this.show();

            if (withAnimation) {
                if (this.props.amount === 0) {
                    this.kiss.alpha = 0;
                    this.text.alpha = 0;
                }

                await this._animation();
                this.kiss.alpha = 1;
                this.text.alpha = 1;
            }

            this.props.amount = amount;
            this.text.text = this.props.amount;
        } else {
            this.hide();
        }
    }

    _animation() {
        let kiss = new PIXI.Text('💋', {fontSize: 5});
        kiss.anchor.set(0.5);
        kiss.alpha = 0;
        kiss.position.x = 10;
        kiss.position.y = 10;
        this.addChild(kiss);

        let props = {
            fontSize: kiss.style.fontSize,
            alpha: kiss.alpha,
            x: this.screen.width/2 - this.container.parent.position.x,
            y: this.screen.height/2 - this.container.parent.position.y,
        }

        return anime({
            targets: props,

            fontSize: this.kiss.style.fontSize + 5,
            alpha: 1,
            duration: 1200,
            x: 10,
            y: 10,

            easing: 'easeOutCubic',
            update: () => {
                kiss.alpha = props.alpha;
                kiss.style.fontSize = props.fontSize;
                kiss.position.x = props.x;
                kiss.position.y = props.y;
            },
            complete: () => {
                this.removeChild(kiss);
            }
        }).finished
    }
}

export default Kisses;
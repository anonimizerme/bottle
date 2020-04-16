import * as PIXI from 'pixi.js';

class Bottle {
    constructor(app) {
        this.app = app;

        this.object = null;
    }

    init() {
        const pixi = this.app.pixi;

        this.object = PIXI.Sprite.from('assets/bottle.png');
        this.object.anchor.set(0.5);
        this.object.scale.set(0.3);
        this.object.x = pixi.screen.width/2;
        this.object.y = pixi.screen.height/2;

        pixi.stage.addChild(this.object);

    }
}

export default Bottle;
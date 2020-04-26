import * as PIXI from 'pixi.js';

class Bottle {
    constructor(app) {
        this.app = app;

        this.object = null;

        this.targetAngle = 360*3 + [0, 90, 180, 270][Math.floor(Math.random() * 4)];
        this.maxSpeed = 0;
        this.speed = 0;
        this.distancetoStop = Math.max(180+Math.random()*90);
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

    render(delta) {
        // increasing speed
        if (this.object.angle <= 180) {
            this.speed += 0.15;
        } else if (this.object.angle >= this.targetAngle) {
            this.speed = 0;
            this.object.angle = this.targetAngle;
            return;
        } else if (this.targetAngle - this.object.angle < this.distancetoStop) {
            this.maxSpeed = Math.max(this.maxSpeed, this.speed);

            const percent = (this.object.angle - (this.targetAngle - this.distancetoStop)) / (this.distancetoStop / 100);
            let percentInvert = 100 - percent;
            this.speed = (this.maxSpeed / 100) * Math.max(percentInvert, 8);
        }

        this.object.angle += delta * this.speed;
    }
}

export default Bottle;
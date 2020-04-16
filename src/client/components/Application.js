import * as PIXI from 'pixi.js'

class Application {
    constructor() {
        this.pixi = new PIXI.Application({
            width: 600,
            height: 600,
            antialias: true,    // default: false
            transparent: false, // default: false
            resolution: 1       // default: 1
        });

        this.pixi.renderer.backgroundColor = 0x061639;
    }

    attachToDocument() {
        document.body.appendChild(this.pixi.view);
    }

}

export default Application;
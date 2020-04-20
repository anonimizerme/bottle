import * as PIXI from 'pixi.js'
import Members from './Members';
import Bottle from './Bottle';

class Application {
    constructor(store) {
        this.store = store;
        let prev;
        this.store.subscribe(() => {
            let cur = this.store.getState().members;
            console.log(cur == prev);
            prev = cur;
        });

        this.pixi = new PIXI.Application({
            width: 600,
            height: 600,
            antialias: true,    // default: false
            transparent: false, // default: false
            resolution: 1       // default: 1
        });

        this.pixi.renderer.backgroundColor = 0x061639;

        this.members = new Members(this);
        this.members.init();

        this.bottle = new Bottle(this);
        this.bottle.init();
    }

    attachToDocument() {
        document.body.appendChild(this.pixi.view);
    }

    render() {
        this.pixi.ticker.add(delta => this.members.render(delta));
        this.pixi.ticker.add(delta => this.bottle.render(delta));
    }
}

export default Application;
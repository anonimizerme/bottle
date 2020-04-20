import * as PIXI from 'pixi.js';

class Members {
    constructor(app) {
        this.app = app;

        this.loaded = false;
        this.playersCount = 4;
    }

    init(setup) {
        const pixi = this.app.pixi;

        const loader = PIXI.Loader.shared;
        for (let i=0; i < this.playersCount; i++) {
            loader.add(`player_${i}`, `assets/${i}.svg`)
        }

        let playersImages = {};
        let margin = 40;
        let positionMatrix = [
            {x: app => pixi.screen.width/2, y: app => margin},
            {x: app => pixi.screen.width - margin, y: app => pixi.screen.height/2},
            {x: app => pixi.screen.width/2, y: app => pixi.screen.height - margin},
            {x: app => margin, y: app => pixi.screen.height/2},
        ];
        loader.load();
        loader.onComplete.add((data, resources) => {
            for (let i=0; i < this.playersCount; i++) {
                console.log(resources);
                const sprite = new PIXI.Sprite(resources[`player_${i}`].texture);
                sprite.anchor.set(0.5);
                sprite.scale.set(0.3);
                sprite.x = positionMatrix[i].x(pixi);
                sprite.y = positionMatrix[i].y(pixi);

                playersImages[`player_${i}`] = sprite;
                pixi.stage.addChild(playersImages[`player_${i}`]);
            }
        });
    }

    render() {

    }
}

export default Members;
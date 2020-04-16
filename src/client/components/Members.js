import * as PIXI from 'pixi.js';

class Members {
    constructor(app) {
        this.app = app;
    }

    init(setup) {
        const pixi = this.app.pixi;

        const playersCount = 4;
        const loader = PIXI.Loader.shared;
        for (let i=0; i < playersCount; i++) {
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
        loader.load((loader, resources) => {
            for (let i=0; i < playersCount; i++) {
                console.log(resources);
                const sprite = new PIXI.Sprite(resources[`player_${i}`].texture);
                sprite.anchor.set(0.5);
                sprite.scale.set(0.3);
                sprite.x = positionMatrix[i].x(pixi);
                sprite.y = positionMatrix[i].y(pixi);

                playersImages[`player_${i}`] = sprite;
                pixi.stage.addChild(playersImages[`player_${i}`]);
            }

            setup();
        });
    }
}

export default Members;
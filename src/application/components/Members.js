import _ from 'lodash';
import * as PIXI from 'pixi.js';

class Members {
    constructor(app) {
        this.app = app;

        this._list = [];
        this.loaded = false;

        this._objects = {};
    }

    set list(members) {
        if (this._list !== members) {
            this._list = members;
            this.render();
        }
    }

    render() {
        let margin = 40;

        let positionMatrix = [
            {x: pixi => pixi.screen.width/2, y: pixi => margin},
            {x: pixi => pixi.screen.width - margin, y: pixi => pixi.screen.height/2},
            {x: pixi => pixi.screen.width/2, y: pixi => pixi.screen.height - margin},
            {x: pixi => margin, y: pixi => pixi.screen.height/2},
        ];

        // Remove deleted members
        // todo:

        // Adding new members
        for (let i in this._list) {
            let item = this._list[i];

            if (!_.has(this._objects, item.id)) {
                const sprite = new PIXI.Sprite.from(`assets/${i}.svg`);
                sprite.anchor.set(0.5);
                sprite.scale.set(0.3);
                sprite.x = positionMatrix[i].x(this.app.pixi);
                sprite.y = positionMatrix[i].y(this.app.pixi);

                this._objects[item.id] = sprite;

                this.app.pixi.stage.addChild(this._objects[item.id]);
            }
        }
    }

    init() {
        this.render();
    }
}

export default Members;
import _ from 'lodash';
import * as PIXI from 'pixi.js';
import {getPosition, memberImageSize} from './helpers/memberPositions';

class Members {
    constructor(app) {
        this._app = app;
        this._container = null;

        /** List of members */
        this._list = [];

        /** List of members PIXI objects */
        this._objects = {};

        this.makeContainer();
    }

    init() {
        this.render();
    }

    makeContainer() {
        this._container = new PIXI.Container();
        this._container.x = 0;
        this._container.y = 0;

        this._app.pixi.stage.addChild(this._container);
    }

    set list(members) {
        if (this._list !== members) {
            this._list = members;
            this.render();
        }
    }

    render() {
        // Remove deleted members
        // todo:

        // Adding new members
        for (let i=0; i<this._list.length; i++) {
            let item = this._list[i];

            if (!_.has(this._objects, item.id)) {
                const sprite = new PIXI.Sprite.from(`assets/${i % 4}.svg`);
                sprite.anchor.set(0.5);
                sprite.width = memberImageSize.width;
                sprite.height = memberImageSize.height;
                sprite.position = getPosition(this._app.pixi.screen, i);

                this._objects[item.id] = sprite;

                this._container.addChild(this._objects[item.id]);
            }
        }
    }
}

export default Members;
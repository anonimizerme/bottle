import _ from 'lodash';
import * as PIXI from 'pixi.js';
import anime from 'animejs';

import loader from '../../assets/loader';
import Element from './core/Element';
import {ROOM_LIMIT} from '../../../../common/models/Room';
import {getAngle} from '../helpers/bottleAngle';

class Menu extends Element {
    constructor(pixi) {
        super(pixi);

        // Define and init objects
        this.icons = [];
        this.texts = [];
        this._initObjects();
    }

    _initObjects() {
        if (this.icons.length > 0) {
            return;
        }

        const list = [
            {name: 'top', title: 'Лучшие', position: 0},
            {name: 'tasks', title: 'Задания', position: 1},
            {name: 'settings', title: 'Настройки', position: 2},
            {name: 'location', title: 'Сменить', position: 3},
            {name: 'decor', title: 'Декор', position: 4},
        ];

        for (let item of list) {
            const icon = new PIXI.Sprite(loader.resources[`icons.${item.name}`].texture);
            icon.position.set(
                20,
                350 + item.position * 153 + item.position * 70
            );

            const text = new PIXI.Text(item.title.toUpperCase(), {
                fontSize: 22,
                fill: 0x337AC0
            });
            text.position.set(
                icon.position.x + 65 - text.width/2,
                icon.position.y + 120
            )

            this.addChild(icon);
            this.addChild(text);

            this.icons.push(icon);
        }
    }
}

export default Menu;
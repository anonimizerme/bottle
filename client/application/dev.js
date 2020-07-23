import * as PIXI from 'pixi.js';
import faker from 'faker';

const pixi = new PIXI.Application({
    width: 600,
    height: 600,
    antialias: true,    // default: false
    transparent: false, // default: false
    resolution: 1       // default: 1
});

pixi.stage.sortableChildren = true;

const sprite = PIXI.Sprite.from('https://s3.amazonaws.com/uifaces/faces/twitter/namankreative/128.jpg');
sprite.width = 300;
sprite.height = 300;

const graphics = new PIXI.Graphics();
graphics.lineStyle(2, 0x000000);
graphics.beginFill(0x000000);
graphics.drawRoundedRect(10, 10, 300, 300, 40);
graphics.endFill();

sprite.mask = graphics;

sprite.position.x = 10;
sprite.position.y = 10;

pixi.stage.addChild(sprite);


document.body.appendChild(pixi.view);
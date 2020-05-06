import * as PIXI from 'pixi.js';
import anime from 'animejs';

const pixi = new PIXI.Application({
    width: 600,
    height: 600,
    antialias: true,    // default: false
    transparent: false, // default: false
    resolution: 1       // default: 1
});

pixi.stage.sortableChildren = true;

pixi.renderer.backgroundColor = 0x061639;

const graphics = new PIXI.Graphics();
graphics.beginFill(0xDE3249);
graphics.drawRect(0, 0, 100, 100);
graphics.endFill();
graphics.pivot.x = 50;
graphics.pivot.y = 50;
graphics.position.x = 100;
graphics.position.y = 100;
pixi.stage.addChild(graphics);

window.click = () => {
    // карточка наклоняется
    // anime({
    //     targets: graphics,
    //     angle: -10,
    //     round: 1,
    //     duration: 200,
    //     direction: 'alternate',
    //     easing: 'linear',
    // });

    graphics.angle = 0;

    anime({
        targets: graphics,
        angle: [
            {value: -15, duration: 200, easing: 'easeOutCubic'},
            {value: 360 * 2 + 180, duration: 4000, easing: 'easeOutQuint'}
        ],
        round: 1,
        easing: 'easeInBack'
    });
}

document.body.appendChild(pixi.view);
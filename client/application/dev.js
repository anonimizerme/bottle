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
graphics.interactive = true;
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

    let target = 0;

    let ani = anime({
        targets: graphics,
        angle: [
            {value: anime.random(-20, -10), duration: 200, easing: 'easeOutCubic'},
            // {value: 360 * 2 + 190, duration: 4000, easing: 'easeOutQuint'}
        ],
        round: 1,
        easing: 'easeInBack'
    });

    setTimeout(function() {
        let ani = anime({
            targets: graphics,
            angle: [
                // {value: anime.random(-20, -10), duration: 200, easing: 'easeOutCubic'},
                {value: 360 * 2 + 190, duration: 4000, easing: 'easeOutQuint'}
            ],
            round: 1,
            easing: 'easeInBack'
        });
    }, 400)
}

graphics.on('click', window.click);

document.body.appendChild(pixi.view);
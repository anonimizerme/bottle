import * as PIXI from 'pixi.js';

const containerPadding = 40;
const memberImageWidth = 40;

export const memberImageSize = {
    width: 50,
    height: 50
};

export const getPosition = (screen, memberIndex) => {
    let coordinates;
    switch (memberIndex) {
        case 0:
        case 1:
        case 2:
            coordinates = {x: screen.width/2 - (1 - memberIndex) * (memberImageSize.width + memberImageWidth), y: containerPadding};
            break;

        case 3:
        case 4:
        case 5:
            coordinates = {x: screen.width - containerPadding, y: screen.height/2 - (4 - memberIndex) * (memberImageSize.width + memberImageSize.height)};
            break;

        case 6:
        case 7:
        case 8:
            coordinates = {x: screen.width/2 - (7 - memberIndex) * (memberImageSize.width + memberImageWidth), y: screen.height - containerPadding};
            break;

        case 9:
        case 10:
        case 11:
            coordinates = {x: containerPadding, y: screen.height/2 - (10 - memberIndex) * (memberImageSize.width + memberImageSize.height)};
            break;
    }

    console.log(memberIndex, coordinates);

    return new PIXI.Point(coordinates.x, coordinates.y);
}
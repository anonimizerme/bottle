import * as PIXI from 'pixi.js';

const tableSize = 874;
const tableMargin = 550;
const containerPadding = 180;
const memberImageWidth = 100;

export const memberImageSize = {
    width: 250,
    height: 250
};

export const getPosition = (screen, memberIndex, maxCount) => {
    memberIndex = parseInt(memberIndex);

    let coordinates;

    const angle = 2 * Math.PI / maxCount * memberIndex;

    coordinates = {
        // x: tableSize / 2 + tableMargin * Math.sin(2*Math.PI / memberIndex),
        // y: tableSize / 2 + tableMargin * Math.sin(2*Math.PI / memberIndex),
        x: ((tableSize + tableMargin) / 2) * Math.cos(angle) + screen.width / 2 - memberImageSize.width / 2 + 150,
        y: ((tableSize + tableMargin) / 2) * Math.sin(angle) + screen.height / 2 - memberImageSize.height / 2,
    }

    return coordinates;

    switch (memberIndex) {
        case 0:
        case 1:
        case 2:
            coordinates = {
                x: screen.width/2 - (1 - memberIndex) * (memberImageSize.width + memberImageWidth) - memberImageSize.width/2,
                y: containerPadding - memberImageSize.height/2
            };
            break;

        case 3:
        case 4:
        case 5:
            coordinates = {
                x: screen.width - containerPadding - memberImageSize.width/2,
                y: screen.height/2 - (4 - memberIndex) * (memberImageSize.width + memberImageWidth) - memberImageSize.height/2
            };
            break;

        case 6:
        case 7:
        case 8:
            coordinates = {
                x: screen.width/2 + (7 - memberIndex) * (memberImageSize.width + memberImageWidth) - memberImageSize.width/2,
                y: screen.height - containerPadding - memberImageSize.height/2
            };
            break;

        case 9:
        case 10:
        case 11:
            coordinates = {
                x: containerPadding - memberImageSize.width/2,
                y: screen.height/2 + (10 - memberIndex) * (memberImageSize.width + memberImageWidth) - memberImageSize.height/2,
            };
            break;
    }

    return new PIXI.Point(coordinates.x, coordinates.y);
}
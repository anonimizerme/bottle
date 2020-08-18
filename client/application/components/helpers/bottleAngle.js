import * as PIXI from 'pixi.js';

import {getPosition} from './memberPositions';

export const getAngle = (screen, memberIndex, maxCount) => {
    const memberPosition = getPosition(screen, memberIndex);

    return 360 / maxCount * memberIndex;

    const centerX = screen.width / 2,
          centerY = screen.height / 2,
          deltaX = memberPosition.x - centerX,
          deltaY = memberPosition.y - centerY,
          absDeltaX = Math.abs(deltaX),
          absDeltaY = Math.abs(deltaY);

    const tan = absDeltaY / absDeltaX,
        rad = Math.atan(tan),
        deg = rad * 180 / Math.PI;

    console.log(centerX, centerY, memberPosition, deltaX, deltaY, deg);

    let resultDegree = 0;

    if (deltaX < 0 && deltaY < 0) {
        resultDegree = 270 + deg;
    } else if (deltaX < 0 && deltaY > 0) {
        resultDegree = 270 - deg;
    } else if (deltaX > 0 && deltaY < 0) {
        resultDegree = 90 - deg;
    } else if (deltaX > 0 && deltaY > 0) {
        resultDegree = 90 + deg;
    } else if (deltaX == 0 && deltaY < 0) {
        resultDegree = 0;
    } else if (deltaX == 0 && deltaY > 0) {
        resultDegree = 180
    } else if (deltaY == 0 && deltaX < 0) {
        resultDegree = 270;
    } else if (deltaY == 0 && deltaX > 0) {
        resultDegree = 90;
    }

    console.log('getAngle', memberIndex, resultDegree);

    return resultDegree;
}
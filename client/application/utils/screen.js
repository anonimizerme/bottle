export const GAME_WIDTH = 1790;
export const GAME_HEIGHT = 1620;

export default {
    getGameScrenRatio() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        return Math.min(windowHeight/GAME_HEIGHT, windowWidth/GAME_WIDTH);
    }
}
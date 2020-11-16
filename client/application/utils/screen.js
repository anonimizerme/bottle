export const GAME_WIDTH = 1790;
export const GAME_HEIGHT = 1620;

export default {
    getGameScreenRatio() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        return Math.min(windowHeight/GAME_HEIGHT, windowWidth/GAME_WIDTH);
    },

    onResizeWindow(callback) {
        let width;
        let height;
        let timeout;

        window.addEventListener('resize', () => {
            if (width !== window.innerWidth || height !== window.innerHeight) {
                width = window.innerWidth;
                height = window.innerHeight;

                clearTimeout(timeout);

                timeout = setTimeout(callback, 100);
            }
        });
    }
}
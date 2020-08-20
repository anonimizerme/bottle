import _ from 'lodash';
import * as PIXI from 'pixi.js';

import assets from './assets';
import Logger from '../../../common/components/Logger';

const logger = Logger('Loader');

class Loader {
    constructor(assets) {
        this.assets = assets;
        this.loader = new PIXI.Loader();
    }

    /**
     * Load assets
     * @returns {Promise<void>}
     */
    load() {
        for (let assetName in this.assets) {
            const asset = this.assets[assetName];

            // Group of assets
            if (_.isObject(asset)) {
                const assetGroup = assetName;

                for (let assetName in this.assets[assetGroup]) {
                    const asset = this.assets[assetGroup][assetName];

                    this.loader.add(`${assetGroup}.${assetName}`, asset);
                    logger.log(`Asset added ${assetGroup}.${assetName} for path ${asset}`);
                }
            }
            // Single asset
            else {
                this.loader.add(assetName, asset);
                logger.log(`Asset added ${assetName} for path ${asset}`);
            }
        }

        return new Promise(resolve => this.loader.load(resolve));
    }

    get resources() {
        return this.loader.resources;
    }
}

export default new Loader(assets)
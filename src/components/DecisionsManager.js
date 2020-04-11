const _ = require('lodash');
const Decision = require('../models/Decision');

class DecisionsManager {
    constructor() {
        this._decisions = new Map();
    }

    room(roomId) {
        if (!this._decisions.has(roomId)) {
            this._decisions.set(roomId, new Decision());
        }

        return this._decisions.get(roomId);
    }
}

module.exports = DecisionsManager;
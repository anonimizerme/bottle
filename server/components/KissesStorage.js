const assert = require('assert');
const _ = require('lodash');

class KissesStorage {
    constructor() {
        this._kisses = new Map();
    }

    add(memberId, value = 1) {
        assert.ok(!_.isUndefined(memberId));
        assert.ok(value == parseInt(value));

        value = parseInt(value);

        let amount = this.get(memberId);

        this._kisses.set(memberId, amount + value);
    }

    get(memberId) {
        assert.ok(!_.isUndefined(memberId));

        return this._kisses.has(memberId) ? this._kisses.get(memberId) : 0;
    }

    drop(memberId) {
        assert.ok(!_.isUndefined(memberId));

        this._kisses.delete(memberId);
    }

    get json() {
        let json = {};
        this._kisses.forEach((kisses, memberId) => {
            json[memberId] = kisses;
        });

        return json;
    }
}

module.exports = KissesStorage;
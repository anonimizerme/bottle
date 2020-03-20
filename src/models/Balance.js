const _ = require('lodash');
const assert = require('assert');

class Balance {
    constructor(memberId, hearts) {
        assert.ok(!_.isUndefined(memberId));
        assert.ok(!_.isUndefined(hearts));

        this._memberId = memberId;
        this._hearts = hearts;
    }

    get memberId() {
        return this._memberId;
    }

    get hearts() {
        return this._hearts;
    }

    addHearts(amount) {
        assert.ok(amount === parseInt(amount));

        this._hearts += amount;

        return this._hearts;
    }

    removeHearts(amount) {
        assert.ok(amount === parseInt(amount));

        if (this._hearts < amount) {
            throw new Error(`Current hearts amount less than ${amount}`);
        }

        this._hearts -= amount;

        return this._hearts;
    }
}

module.exports = Balance;
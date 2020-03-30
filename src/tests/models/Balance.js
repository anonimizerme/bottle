const assert = require('assert');
const should = require('should');

const Balance = require('../../models/Balance');

describe('Balance', function() {
    describe('Check constructor', function () {
        it('Invalid construction', function () {
            (() => {
                new Balance();
            }).should.throw();
        });

        it('Correct construction', function () {
            (() => {
                new Balance(1, 1);
            }).should.not.throw();
        });
    });

    describe('Check operations', function () {
        let balance;

        beforeEach(function() {
            balance = new Balance(1, 10);
        });

        it('Add hearts', function () {
            balance.addHearts(10);
            assert.equal(balance.hearts, 20);
        });

        it('Remove hearts', function () {
            balance.removeHearts(10);
            assert.equal(balance.hearts, 0);
        });

        it('Invalid remove hearts', function () {
            (() => {
                balance.removeHearts(20);
            }).should.throw();
        });
    })
});
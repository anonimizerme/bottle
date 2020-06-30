const assert = require('assert');
const chai = require('chai');

const Balance = require('../../common/models/Balance');

const expect = chai.expect;

describe('Balance', function() {
    describe('Check constructor', function () {
        it('Invalid construction', function () {
            expect(() => {
                new Balance();
            }).to.throw();
        });

        it('Correct construction', function () {
            expect(() => {
                new Balance(1, 1);
            }).to.not.throw();
        });
    });

    describe('Check operations', function () {
        let balance;

        beforeEach(function() {
            balance = new Balance(1, 10);
        });

        it('Add hearts', function () {
            balance.addHearts(10);
            expect(balance.hearts).to.equal(20);
        });

        it('Remove hearts', function () {
            balance.removeHearts(10);
            expect(balance.hearts).to.equal(0);
        });

        it('Invalid remove hearts', function () {
            expect(() => {
                balance.removeHearts(20);
            }).to.throw();
        });
    })
});
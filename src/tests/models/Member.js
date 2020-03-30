const assert = require('assert');

const Member = require('../../models/Member');

describe('Member', function() {

    let member;

    describe('Check constructor', function () {
        before(function () {
            member = new Member(1, 'Test', 'url');
        });

        it('Property id', function () {
            assert.equal(member.id, 1);
        });

        it('Property name', function () {
            assert.equal(member.name, 'Test');
        });

        it('Property picture', function () {
            assert.equal(member.picture, 'url');
        });
    });

    describe('Change change properties', function () {
        before(function () {
            member = new Member();

            member.id = 2;
            member.name = 'Test 2';
            member.picture = 'url 2';
        });

        it('Property id', function () {
            assert.equal(member.id, 2);
        });

        it('Property name', function () {
            assert.equal(member.name, 'Test 2');
        });

        it('Property picture', function () {
            assert.equal(member.picture, 'url 2');
        });
    })
});
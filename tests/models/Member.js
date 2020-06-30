const chai = require('chai');
const uuid = require('uuid');

const Member = require('../../common/models/Member');

const expect = chai.expect;

describe('Member', function() {
    let member;

    describe('Check constructor', function () {
        const id = uuid.v4();
        const name = '_test_name1';
        const picture = 'picture1';

        before(function () {
            member = Member.create(id, name, picture);
        });


        it('Member model', function () {
            expect(member).to.be.an.instanceof(Member);
        })

        it('Properties', function () {
            expect(member.id).to.equal(id);
            expect(member.name).to.equal(name);
            expect(member.picture).to.equal(picture);
        });
    });
});
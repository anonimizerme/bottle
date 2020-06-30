const chai = require('chai');

const Room = require('../../common/models/Room');

const expect = chai.expect;

describe('Room', function() {

    let room;

    describe('Check constructor', function () {
        beforeEach(function () {
            room = Room.create();
        });

        it('Empty Room', function () {
            expect(room.id).to.be.a('string');
            expect(room.memberIds).to.be.an.instanceof(Array);
            expect(room.memberIds).to.have.lengthOf(0);
            expect(room.hostMemberId).to.be.null;
        });
    });
});
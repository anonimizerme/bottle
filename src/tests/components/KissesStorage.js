const assert = require('assert');

const KissesStorage = require('../../components/KissesStorage');

describe('KissesStorage', function() {

    let kissesStorage;

    const member1Id = '1';
    const member2Id = '2';

    beforeEach(function () {
        kissesStorage = new KissesStorage();
    });

    it('Check zero kiss', function () {
        assert.equal(kissesStorage.get(member1Id), 0);
    });

    it('Add one kiss', function () {
        kissesStorage.add(member1Id);
        assert.equal(kissesStorage.get(member1Id), 1);
    });

    it('Add two kisses', function () {
        kissesStorage.add(member1Id, 2);
        assert.equal(kissesStorage.get(member1Id), 2);
    });

    it('Add kisses to second member', function () {
        kissesStorage.add(member1Id);
        kissesStorage.add(member2Id, 3);
        assert.equal(kissesStorage.get(member2Id), 3);
    });

    it('Drop', function () {
        kissesStorage.add(member2Id);
        kissesStorage.drop(member2Id);
        assert.equal(kissesStorage.get(member2Id), 0);
    });

    it('Check json', function () {
        kissesStorage.add(member1Id);
        kissesStorage.add(member2Id, 3);
        assert.equal(JSON.stringify(kissesStorage.json), `{"1":1,"2":3}`);
    });
});
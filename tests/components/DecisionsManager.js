const assert = require('assert');

const DecisionsManager = require('../../server/components/DecisionsManager');
const Room = require('../../common/models/Room');

describe('DecisionsManager', function() {

    let decisionsManager;

    beforeEach(function () {
        decisionsManager = new DecisionsManager();
    });

    it('Set host decision', function () {
        const room = new Room();
        const decision = decisionsManager.room(room.id);
        decision.hostDecision = true;
        assert.equal(decision.isReady, false);
        assert.ok(decision.hostDecision);
    });

    it('Set member decision', function () {
        const room = new Room();
        const decision = decisionsManager.room(room.id);
        decision.memberDecision = true;
        assert.equal(decision.isReady, false);
        assert.ok(decision.memberDecision);
    });

    it('Set both decisions true', function () {
        const room = new Room();
        const decision = decisionsManager.room(room.id);
        decision.hostDecision = true;
        decision.memberDecision = true;
        assert.ok(decision.isReady);
        assert.ok(decision.isCouple);
    });

    it('Set both decisions different', function () {
        const room = new Room();
        const decision = decisionsManager.room(room.id);
        decision.hostDecision = true;
        decision.memberDecision = false;
        assert.ok(decision.isReady);
        assert.equal(decision.isCouple, false);
    });
});
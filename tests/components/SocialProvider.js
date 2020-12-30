const chai = require('chai');

const SocialProvider = require('../../server/components/social/SocialProvider');

const expect = chai.expect;

describe('RoomsManager', function() {

    let socialProvider;

    before(function () {
        socialProvider = new SocialProvider('ok', 361190633)
    });

    it('Get OK profile', async function () {
        const profile = await socialProvider.getProfile();

        expect(profile.first_name).to.not.be.undefined;
        expect(profile.last_name).to.not.be.undefined;
    });
});

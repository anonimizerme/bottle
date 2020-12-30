const OkProvider = require('./OkProvider');
const FakeProvider = require('./FakeProvider');

class SocialProvider {
    constructor(providerName, socialId) {
        this.provider = null;

        this._initProvider(providerName, socialId);
    }

    _initProvider(providerName, socialId) {
        switch (providerName) {
            case 'ok':
                this.provider = new OkProvider(socialId);
                break;
            case 'fake':
                this.provider = new FakeProvider(socialId);
                break;
        }
    }

    get hasProvider() {
        return this.provider !== null;
    }

    get providerName() {
        return this.provider.providerName;
    }

    get socialId() {
        return this.provider.socialId;
    }

    getProfile() {
        return this.provider.getProfile();
    }
}

module.exports = SocialProvider;